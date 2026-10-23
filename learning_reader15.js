/* English Pocket 15: focused lessons, readable speech and compact reader lookup. */
'use strict';
const LKEY='elp-15-focused-lesson';
let lessonState=parseLS(LKEY,null);
let dueView=false;
const originalDrawReview=drawReview, originalDrawWordList=drawWordList;
const originalTurn=turn;
const originalOpenBook=openBook;
const originalRateReview=rateReview;
const originalAvailableReview=availableReview;

function speakEnglish(text){
 if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){toast('Озвучування недоступне у цьому браузері');return}
 const engine=window.speechSynthesis;
 if(engine.speaking||engine.pending)engine.cancel();
 const source=clean(text).slice(0,6500);if(!source){toast('Немає тексту для озвучування');return}
 const chunks=source.match(/.{1,170}(?:[.!?]\s|\s|$)/gu)||[source];
 const voice=engine.getVoices().find(v=>/^en-(US|GB|CA)/i.test(v.lang))||engine.getVoices().find(v=>/^en/i.test(v.lang));
 let pointer=0;
 function next(){if(pointer>=chunks.length)return;const utter=new SpeechSynthesisUtterance(chunks[pointer++]);utter.lang=voice?.lang||'en-US';utter.rate=.88;utter.pitch=1;if(voice)utter.voice=voice;utter.onend=next;utter.onerror=e=>{if(e.error!=='canceled'&&e.error!=='interrupted')toast('Не вдалося озвучити текст')};engine.speak(utter)}
 next();
}
function stopSpeech(){if('speechSynthesis' in window)window.speechSynthesis.cancel()}
// Remove the redundant Edit button; tapping the card opens the editor.
drawWordList=function(){
 originalDrawWordList();
 for(const item of $('wordsList').querySelectorAll('.worditem')){
  const text=item.querySelector('.wordtext')?.textContent?.replace(/^☆\s*/,''),actions=item.querySelector('.mini-actions');
  const edit=actions?.querySelector('button');if(!text||!actions)continue;
  if(edit)edit.remove();
  actions.prepend(BTN('🔊',()=>speakEnglish(text),'btn alt small audio-word'));
 }
};
// Previously the new words appeared directly among due SRS cards. In version 15,
// newly introduced cards go through the complete linked lesson first.
availableReview=function(){const now=Date.now();return words.filter(w=>w.meaning&&w.srs&&(!w.srs.due||Number(w.srs.due)<=now)).sort((a,b)=>(Number(a.srs.due)||0)-(Number(b.srs.due)||0))};
function persistLesson(){putLS(LKEY,lessonState)}
function lessonForToday(){
 if(lessonState?.stage==='done'&&lessonState.day!==dateKey()){lessonState=null;persistLesson()}
 return lessonState;
}
function lessonCards(){return lessonState?.ids.map(id=>words.find(w=>w.id===id)).filter(Boolean)||[]}
function newCandidates(){return words.filter(w=>w.meaning&&!w.srs)}
function startLesson(n){
 if(lessonForToday())return;
 const chosen=newCandidates().slice(0,Math.min(10,Math.max(1,n)));
 if(!chosen.length){toast('Поки немає нових карток із перекладом');return}
 lessonState={day:dateKey(),ids:chosen.map(w=>w.id),stage:'learn',index:0,revealed:false,checked:false,practiceResults:{},testResults:{}};
 dueView=false;persistLesson();drawReview();
}
function compareAnswer(answer,expected){
 const tidy=s=>keyText(s).replace(/[“”‘’]/g,"'").replace(/[^\p{L}\p{N}' -]/gu,'').replace(/\s+/g,' ').trim();
 return tidy(answer)===tidy(expected);
}
function sampleCloze(w){
 if(!w.example)return null;
 const start=w.example.toLocaleLowerCase().indexOf(w.text.toLocaleLowerCase());
 if(start<0)return null;
 return w.example.slice(0,start)+'______'+w.example.slice(start+w.text.length);
}
function nextStage(){
 const s=lessonState;if(!s)return;
 s.index++;s.revealed=false;s.checked=false;
 if(s.index>=s.ids.length){s.index=0;s.stage=s.stage==='learn'?'practice':s.stage==='practice'?'test':'done';if(s.stage==='done')completeLesson();}
 persistLesson();renderLesson();
}
function completeLesson(){
 const s=lessonState;if(!s||s.finalized)return;
 const now=Date.now();s.finalized=true;
 for(const id of s.ids){
  const w=words.find(x=>x.id===id);if(!w)continue;
  const pass=!!s.testResults[id];
  w.srs={step:pass?1:0,streak:pass?1:0,interval:pass?1:10/1440,due:now+(pass?DAY:600000),last:now,ease:pass?2.4:2.1,reps:1,lapses:pass?0:1};
 }
 saveWords();persistLesson();
}
function lessonAction(label,fn,style='btn'){return BTN(label,fn,style)}
function stageTitle(stage){return ({learn:'1 · Вивчаю',practice:'2 · Практикую',test:'3 · Перевіряю',done:'Готово'})[stage]}
function launchDue(){dueView=true;renderLesson()}
function renderLesson(){
 const box=$('lessonFlow');box.replaceChildren();const saved=lessonForToday();
 const due=availableReview().length;
 show('oldReviewBox',dueView);
 if(dueView){
  const bar=node('div','row between wrap');bar.append(node('strong','','Повторення вивченого'),BTN('← До навчання',()=>{dueView=false;renderLesson()},'btn alt small'));
  box.append(bar);originalDrawReview();
  const reviewWord=words.find(w=>w.id===currentReviewId);
  const buttons=$('reviewBox').querySelector('.studycontrols');
  if(reviewWord&&buttons)buttons.prepend(BTN('🔊',()=>speakEnglish(reviewWord.text),'btn alt small'));
  return;
 }
 if(!saved){
  const count=newCandidates().length;
  const header=node('div','box');header.append(node('div','kicker','Сьогодні'),node('div','studytitle',count?`${Math.min(count,10)} фраз — максимум`:'Нові картки закінчилися'));
  header.append(node('p','smallhint',count?'Одна добірка: спочатку знайомство, потім практика й перевірка тих самих виразів.':'Додай нові картки із книги або свого словника.'));
  const actions=node('div','lesson-actions');
  if(count){
   const select=node('select','input slim');select.setAttribute('aria-label','Кількість нових карток');
   for(const n of [3,5,7,10]){const opt=new Option(`${n} карток`,String(n));select.add(opt)}select.value=String([3,5,7,10].includes(reviewPrefs.daily)?reviewPrefs.daily:5);
   select.onchange=()=>{reviewPrefs.daily=Number(select.value);$('dailyLimit').value=select.value;putLS(K.reviewConfig,reviewPrefs)};
   actions.append(select,lessonAction('Почати навчання →',()=>startLesson(Number(select.value))));
  }
  if(due)actions.append(lessonAction(`Повторити старі · ${due}`,launchDue,'btn alt'));
  header.append(actions);box.append(header);return;
 }
 if(saved.stage==='done'){
  const n=saved.ids.length,passed=Object.values(saved.testResults).filter(Boolean).length;
  const result=node('div','box');result.append(node('div','kicker','Сесію завершено'),node('div','studytitle',`${passed} / ${n} правильно`),node('p','smallhint','Ці самі фрази вже додані до інтервального повторення. Складні повернуться раніше. Нову добірку можна взяти завтра.'));
  const actions=node('div','lesson-actions');if(due)actions.append(lessonAction(`Повторити · ${due}`,launchDue,'btn'));
  actions.append(lessonAction('Мої картки',()=>chooseWordTab('list'),'btn alt'));result.append(actions);box.append(result);return;
 }
 const batch=lessonCards(),s=lessonState;
 if(!batch.length){lessonState=null;persistLesson();renderLesson();return}
 let item=batch[s.index];if(!item){s.index=0;item=batch[0]}
 const progress=node('div','lesson-badge');progress.append(node('strong','',stageTitle(s.stage)),node('span','lesson-sub',`${s.index+1} / ${batch.length}`));box.append(progress);
 const strip=node('div','lesson-progress');const fill=node('div');fill.style.width=100*(s.index+(s.stage==='learn'?0:s.stage==='practice'?batch.length:batch.length*2))/(batch.length*3)+'%';strip.append(fill);box.append(strip);
 const card=node('div','studycard');const controls=node('div','lesson-actions');
 if(s.stage==='learn'){
  card.append(node('div','smallhint','Прочитай і пригадай значення'),node('div','studytitle',item.text));
  controls.append(lessonAction('🔊',()=>speakEnglish(item.text),'btn alt'));
  if(!s.revealed)controls.append(lessonAction('Показати значення',()=>{s.revealed=true;persistLesson();renderLesson()}));
  else{
   card.append(node('div','answer',item.meaning));if(item.example)card.append(node('div','studyexample',item.example));
   controls.append(lessonAction('Далі →',nextStage));
  }
 }else{
  const cloze=s.stage==='practice'?sampleCloze(item):null;
  card.append(node('div','smallhint',s.stage==='test'?'Згадай англійською без підказки':cloze?'Встав пропущений вираз':'Напиши англійський вираз'),node('div','studytitle',cloze||item.meaning));
  if(!cloze&&s.stage==='practice')card.append(node('p','lesson-sub','Переклади українську фразу англійською.'));
  const field=node('textarea','input lesson-field');field.rows=2;field.placeholder='Твоя відповідь англійською…';field.autocapitalize='off';field.spellcheck=false;
  field.value=s.currentInput||'';field.disabled=!!s.checked;field.addEventListener('input',()=>{s.currentInput=field.value;persistLesson()});card.append(field);
  if(!s.checked)controls.append(lessonAction('Перевірити',()=>{
   if(!clean(s.currentInput)){toast('Напиши відповідь');return}
   s.checked=true;const passed=compareAnswer(s.currentInput,item.text);
   (s.stage==='test'?s.testResults:s.practiceResults)[item.id]=passed;
   trackPractice(passed,s.stage==='test'?'test':'practice');persistLesson();renderLesson();
  }));
  else{
   const passed=(s.stage==='test'?s.testResults:s.practiceResults)[item.id];
   const note=node('div','lesson-notice');note.append(node('strong','',passed?'✓ Правильно':'Правильна відповідь: '+item.text));
   if(item.example)note.append(node('p','smallhint','Приклад: '+item.example));card.append(note);
   controls.append(lessonAction('🔊',()=>speakEnglish(item.text),'btn alt'),lessonAction(s.index===batch.length-1&&s.stage==='test'?'Завершити ✓':'Далі →',()=>{delete s.currentInput;nextStage()}));
  }
 }
 box.append(card,controls);
}
drawReview=function(){renderLesson()};
wordTab='review';
function switchLessonTab(tab){if(tab!=='review')dueView=false}
const baseChooseWordTab=chooseWordTab;
chooseWordTab=function(tab){switchLessonTab(tab);baseChooseWordTab(tab)};
// Keep the source cards and the lesson coupled: after adding/editing a card, next visit
// to "Навчання" recalculates available candidates without resetting existing progress.

// Reader: compact phrase/sentence card. Never open the large editing dialog on a tap.
let trayValue=null,selectTimer=null;
const tray=$('translationTray');
function hideReaderTray(){show('translationTray',false);trayValue=null;}
function closeReaderMenus(){for(const id of ['readerTools','readerMore','readerSearchPanel','bookmarksPanel'])show(id,false)}
function offlineMeaning(value){
 const old=wordMatch(value);if(old?.meaning)return old.meaning;
 const hit=(typeof STARTER_CARDS!=='undefined'?STARTER_CARDS:[]).find(w=>keyText(w.text||w.en)===keyText(value));
 return hit?.meaning||hit?.uk||'';
}
function readerLookup(value,context=''){
 if(!book)return;
 const text=clean(value);if(text.length<2||text.length>800)return;
 closeReaderMenus();trayValue={text,context,source:'book:'+book.title};
 $('trayHeading').textContent=/[.!?](?:\s|$)/.test(text)||text.split(/\s+/).length>=9?'Речення':text.includes(' ')?'Фраза':'Слово';
 $('traySelected').textContent=text;
 $('trayContext').textContent=context;
 show('trayContext',!!context);
 const meaning=offlineMeaning(text);$('trayMeaning').value=meaning;
 $('trayStatus').textContent=meaning?'Переклад із твого словника': 'Для нових виразів — «Перекласти»';
 show('translationTray');
}
$('trayClose').onclick=hideReaderTray;
$('traySpeak').onclick=()=>{if(trayValue)speakEnglish(trayValue.text)};
$('trayExternal').onclick=()=>{
 if(!trayValue)return;
 const url='https://translate.google.com/?sl=en&tl=uk&text='+encodeURIComponent(trayValue.text)+'&op=translate';
 window.open(url,'_blank','noopener,noreferrer');
 $('trayStatus').textContent='У вкладці перекладача скопіюй український результат і встав сюди.';
};
$('traySave').onclick=()=>{
 if(!trayValue)return;
 const meaning=clean($('trayMeaning').value);if(!meaning){toast('Спочатку додай українське значення');$('trayMeaning').focus();return}
 const old=wordMatch(trayValue.text);
 if(old){if(!old.meaning)old.meaning=meaning;if(!old.example&&trayValue.context)old.example=trayValue.context;saveWords();toast('Картку оновлено');}
 else {words.unshift({id:uuid(),text:trayValue.text,meaning,example:trayValue.context,source:trayValue.source,created:Date.now()});saveWords();toast('Збережено у «Мої картки»')}
 hideReaderTray();refreshHighlights();
};
captureSelection=function(){
 const sel=window.getSelection();if(!sel||sel.isCollapsed)return false;
 const a=sel.anchorNode,b=sel.focusNode,region=$('pageText');
 if(!a||!b||!region.contains(a)||!region.contains(b))return false;
 const text=clean(sel.toString());if(text.length<2||text.length>800)return false;
 const element=a.nodeType===Node.TEXT_NODE?a.parentElement:a;
 const context=selectionContext(text,element);
 if(!trayValue||trayValue.text!==text)readerLookup(text,context);
 return true;
};
// Capture phase prevents the previous v14 click handler from opening a modal.
$('pageText').addEventListener('click',e=>{
 if(!book||Date.now()-swipedAt<450||e.target.closest('button,a'))return;
 e.stopImmediatePropagation();
 if(window.getSelection()?.toString().trim()){captureSelection();return}
 let range=null;
 if(document.caretRangeFromPoint)range=document.caretRangeFromPoint(e.clientX,e.clientY);
 else if(document.caretPositionFromPoint){const p=document.caretPositionFromPoint(e.clientX,e.clientY);if(p){range=document.createRange();range.setStart(p.offsetNode,p.offset);range.collapse(true)}}
 if(!range||range.startContainer.nodeType!==Node.TEXT_NODE||!$('pageText').contains(range.startContainer))return;
 const txt=range.startContainer.textContent,o=range.startOffset,letter=/[\p{L}\p{M}\p{N}'’\-]/u;
 let a=o,b=o;while(a>0&&letter.test(txt[a-1]))a--;while(b<txt.length&&letter.test(txt[b]))b++;
 const word=txt.slice(a,b).replace(/^[-'’]+|[-'’]+$/g,'');
 if(word.length>=2)readerLookup(word,selectionContext(word,range.startContainer.parentElement));
},true);
document.addEventListener('selectionchange',()=>{
 clearTimeout(selectTimer);if(!book||$('bookview').hidden)return;
 selectTimer=setTimeout(()=>{if(Date.now()-swipedAt>=450)captureSelection()},620);
});
turn=function(dir){hideReaderTray();closeReaderMenus();return originalTurn(dir)};
openBook=function(b){hideReaderTray();closeReaderMenus();stopSpeech();return originalOpenBook(b)};
$('backToLibrary').addEventListener('click',()=>{hideReaderTray();stopSpeech();closeReaderMenus()});
$('readerToolsToggle').onclick=()=>{let state=$('readerTools').hidden;closeReaderMenus();show('readerTools',state);hideReaderTray()};
$('readerOptions').addEventListener('click',()=>show('readerTools',false));
$('readerCloseMore').addEventListener('click',()=>show('readerTools',false));
$('readerSearchClose').onclick=()=>show('readerSearchPanel',false);
$('bookmarksClose').onclick=()=>show('bookmarksPanel',false);
function visiblePageSpeech(){
 const root=$('pageWindow').getBoundingClientRect();const paragraphs=[...$('pageText').querySelectorAll('p,h1,h2,h3,li,blockquote')];
 const shown=paragraphs.filter(p=>{const boxes=[...p.getClientRects()];return boxes.some(r=>r.right>root.left+10&&r.left<root.right-10&&r.bottom>root.top+15&&r.top<root.bottom-10)});
 return (shown.length?shown.map(p=>p.textContent).join(' '):$('pageText').textContent).slice(0,3200);
}
$('readerSpeak').onclick=()=>{
 if('speechSynthesis' in window&&(speechSynthesis.speaking||speechSynthesis.pending)){stopSpeech();toast('Озвучування зупинено');}
 else speakEnglish(visiblePageSpeech());
};
// If app is already open on "Слова", redraw the focused teaching mode.
if(activeTab==='words')chooseWordTab('review');
