/* English Pocket 24.3.1 — reader selection UX hotfix.
   Native selection inside book pages is intentionally disabled: tap a word,
   then use Phrase (two taps) or Sentence. Does not change saved cards/SRS. */
'use strict';
(()=>{
  const D=id=>document.getElementById(id);
  const reader=D('pageText'), frame=D('pageWindow'), tray=D('translationTray');
  if(!reader||!frame||!tray)return;
  const state={anchor:null,current:null,selecting:false};
  const EP244={active:true, getState:()=>({selecting:state.selecting,selected:state.current?.text||'',anchor:state.anchor?.word||''})};
  window.EP244=EP244;
  reader.setAttribute('aria-label','Сторінка книги. Натисни на слово для перекладу. У панелі обери фразу або речення.');

  function element(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
  function button(label,fn){const b=element('button','btn alt small',label);b.type='button';b.addEventListener('click',fn);return b}
  const modes=element('div','ep244-modes');modes.setAttribute('role','group');modes.setAttribute('aria-label','Що перекладати');
  const wordButton=button('Слово',()=>selectWord());
  const phraseButton=button('Фраза',()=>startPhrase());
  const sentenceButton=button('Речення',()=>selectSentence());
  const copyButton=button('Копіювати',async()=>{
    const s=state.current?.text;if(!s)return;
    try{if(!navigator.clipboard?.writeText)throw Error('copy unavailable');await navigator.clipboard.writeText(s);toast('Скопійовано')}catch{toast('Копіювання недоступне в цьому браузері')}
  });
  modes.append(wordButton,phraseButton,sentenceButton);const tools=element('div','ep28-range-tools');
  const left=button('‹ + слово',()=>expand(-1)),right=button('+ слово ›',()=>expand(1));
  tools.append(left,right);const extra=element('details','ep28-translate-more');extra.append(element('summary','','Ще'),copyButton);tray.querySelector('.tray-actions')?.append(extra);const memory=[...tray.querySelectorAll('button')].find(b=>b.textContent.includes('Запам’ятати переклад'));if(memory)extra.append(memory);
  tray.querySelector('.tray-heading')?.after(modes,tools);
  const prompt=element('div','ep244-pick-banner');prompt.hidden=true;
  const promptText=element('span','', 'Торкнися останнього слова фрази');
  const cancelButton=button('Скасувати',()=>cancelPhrase());
  prompt.append(promptText,cancelButton);document.body.append(prompt);
  const marks=element('div','ep244-marks');marks.setAttribute('aria-hidden','true');frame.append(marks);

  function wordNodes(root){
    const nodes=[],walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let n,at=0;
    while((n=walk.nextNode())){const value=n.nodeValue||'';if(!value)continue;nodes.push({node:n,start:at,end:at+value.length});at+=value.length}
    return {nodes,text:nodes.map(x=>x.node.nodeValue).join('')};
  }
  function rangeFor(root,start,end){
    const {nodes,text}=wordNodes(root);if(!nodes.length||start<0||end>text.length||start>=end)return null;
    const startNode=nodes.find(x=>start>=x.start&&start<x.end)||nodes.at(-1);
    const endNode=nodes.find(x=>end>x.start&&end<=x.end)||nodes.at(-1);
    const r=document.createRange();r.setStart(startNode.node,start-startNode.start);r.setEnd(endNode.node,end-endNode.start);return r;
  }
  function pointWord(x,y){
    let caret=null;
    if(document.caretRangeFromPoint)caret=document.caretRangeFromPoint(x,y);
    else if(document.caretPositionFromPoint){const c=document.caretPositionFromPoint(x,y);if(c){caret=document.createRange();caret.setStart(c.offsetNode,c.offset);caret.collapse(true)}}
    if(!caret||!reader.contains(caret.startContainer))return null;
    let n=caret.startContainer,offset=caret.startOffset;
    if(n.nodeType!==Node.TEXT_NODE){const nearest=n.childNodes[offset]||n.childNodes[offset-1];if(!nearest||nearest.nodeType!==Node.TEXT_NODE)return null;n=nearest;offset=0}
    const p=n.parentElement?.closest('p,li,blockquote,h1,h2,h3,h4,pre,div')||reader;
    if(!reader.contains(p))return null;
    const {nodes,text}=wordNodes(p);
    const part=nodes.find(a=>a.node===n);if(!part)return null;
    const position=part.start+offset;
    const matches=[...text.matchAll(/[\p{L}\p{N}]+(?:['’ʼ\-][\p{L}\p{N}]+)*/gu)];
    let m=matches.find(m=>position>=m.index&&position<m.index+m[0].length)
         ||matches.find(m=>position===m.index+m[0].length);
    if(!m)return null;
    const start=m.index,end=start+m[0].length;
    const range=rangeFor(p,start,end);if(!range)return null;
    const rects=[...range.getClientRects()];
    if(!rects.some(r=>x>=r.left-14&&x<=r.right+14&&y>=r.top-11&&y<=r.bottom+11))return null;
    return {p,start,end,word:m[0],text,range};
  }
  function sentenceFrom(hit){
    if(!hit)return null;
    let a=0,b=hit.text.length;
    if(typeof Intl.Segmenter==='function'){
      try{const segments=[...new Intl.Segmenter('en',{granularity:'sentence'}).segment(hit.text)];
        const found=segments.find(s=>s.index<=hit.start&&s.index+s.segment.length>=hit.end);
        if(found){a=found.index;b=a+found.segment.length}
      }catch{}
    } else {
      const before=hit.text.slice(0,hit.start);
      const prev=[...before.matchAll(/[.!?]+(?:[\s”"')\]]+|$)/gu)].at(-1);
      if(prev)a=prev.index+prev[0].length;
      const next=/[.!?]+(?:[\s”"')\]]+|$)/gu.exec(hit.text.slice(hit.end));
      if(next)b=hit.end+next.index+next[0].length;
    }
    while(a<b&&/\s/u.test(hit.text[a]))a++;
    while(b>a&&/\s/u.test(hit.text[b-1]))b--;
    return makeSelection(hit.p,a,b,'sentence');
  }
  function makeSelection(p,start,end,mode='phrase'){
    const {text}=wordNodes(p);start=Math.max(0,start);end=Math.min(text.length,end);
    const selected=text.slice(start,end).trim();if(!selected||selected.length>800)return null;
    return {p,start,end,text:selected,mode,range:rangeFor(p,start,end)};
  }
  function highlight(sel){
    marks.replaceChildren();if(!sel?.range)return;
    const outer=frame.getBoundingClientRect();
    for(const rect of sel.range.getClientRects()){
      const left=Math.max(0,rect.left-outer.left),right=Math.min(outer.width,rect.right-outer.left);
      if(right<=left||rect.bottom<outer.top||rect.top>outer.bottom)continue;
      const mark=element('span','ep244-mark');
      mark.style.left=left+'px';mark.style.top=Math.max(0,rect.top-outer.top)+'px';
      mark.style.width=(right-left)+'px';mark.style.height=Math.min(rect.height,outer.height)+'px';
      marks.append(mark);
    }
  }
  function activeMode(mode){
    tools.hidden=mode==='sentence'||!mode;
    for(const [button,key] of [[wordButton,'word'],[phraseButton,'phrase'],[sentenceButton,'sentence']]){
      button.classList.toggle('ep244-mode-active',key===mode);
      button.setAttribute('aria-pressed',String(key===mode));
    }
  }
  function showSelection(sel,context){
    if(!sel)return toast('Спробуй коротший фрагмент — до 800 символів');
    state.current=sel;state.selecting=false;prompt.hidden=true;highlight(sel);
    window.getSelection()?.removeAllRanges();
    readerLookup(sel.text,context||sentenceFrom({p:sel.p,text:wordNodes(sel.p).text,start:sel.start,end:sel.end})?.text||'');
    activeMode(sel.mode);
  }
  function expand(dir){const sel=state.current;if(!sel)return;const {text}=wordNodes(sel.p);const ts=[...text.matchAll(/[\p{L}\p{N}]+(?:['’ʼ-][\p{L}\p{N}]+)*/gu)];let start=sel.start,end=sel.end;if(dir<0){const m=ts.filter(x=>x.index+x[0].length<=start).at(-1);if(!m)return;start=m.index;}else{const m=ts.find(x=>x.index>=end);if(!m)return;end=m.index+m[0].length;}showSelection(makeSelection(sel.p,start,end,'phrase'));}
  function selectWord(){const hit=state.anchor;if(!hit)return;
    showSelection(makeSelection(hit.p,hit.start,hit.end,'word'));
  }
  function selectSentence(){const hit=state.anchor;if(!hit)return;
    showSelection(sentenceFrom(hit));
  }
  function startPhrase(){const hit=state.anchor;if(!hit)return;
    state.selecting=true;state.current=null;
    if(typeof hideReaderTray==='function')hideReaderTray();
    prompt.hidden=false;promptText.textContent='Торкнися останнього слова фрази';
    highlight(makeSelection(hit.p,hit.start,hit.end,'phrase'));
    window.getSelection()?.removeAllRanges();
  }
  function cancelPhrase(){state.selecting=false;prompt.hidden=true;
    marks.replaceChildren();if(state.anchor)selectWord();
  }
  function reset(){state.anchor=null;state.current=null;state.selecting=false;prompt.hidden=true;marks.replaceChildren();activeMode('')}

  // Capture on document BEFORE the legacy pageText listeners. No synthetic/native text
  // selections are created, so Android/iOS selection toolbar is not requested.
  document.addEventListener('click',e=>{
    if(!book||D('bookview').hidden||!reader.contains(e.target)||e.button>0)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(Date.now()-swipedAt<380)return;
    const hit=pointWord(e.clientX,e.clientY);if(!hit)return;
    if(state.selecting){
      if(hit.p!==state.anchor?.p){promptText.textContent='Обери кінцеве слово в тому самому абзаці';return}
      const start=Math.min(state.anchor.start,hit.start),end=Math.max(state.anchor.end,hit.end);
      const sel=makeSelection(hit.p,start,end,'phrase');if(!sel){promptText.textContent='Фраза надто довга — обери ближче слово';return}
      showSelection(sel);return;
    }
    state.anchor=hit;showSelection(makeSelection(hit.p,hit.start,hit.end,'word'));
  },true);
  reader.addEventListener('contextmenu',e=>e.preventDefault(),true);
  reader.addEventListener('selectstart',e=>e.preventDefault(),true);
  reader.addEventListener('dragstart',e=>e.preventDefault(),true);
  document.addEventListener('selectionchange',()=>{
    if(!book||D('bookview').hidden)return;
    const selection=window.getSelection();
    if(selection?.rangeCount&&reader.contains(selection.anchorNode))selection.removeAllRanges();
  });
  D('trayClose')?.addEventListener('click',reset);
  D('backToLibrary')?.addEventListener('click',reset);
  D('chapterPicker')?.addEventListener('change',reset);
  const originalTurn244=turn;
  turn=function(...args){reset();return originalTurn244(...args)};
  const oldRender244=renderChapter;
  renderChapter=function(...args){reset();return oldRender244(...args)};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.selecting){e.preventDefault();cancelPhrase()}});
})();
