/* English Pocket 22.1 — progressive enhancement of 21.0. User data and keys preserved.
   No AI API or covert online translator; uses cards and curated offline glossary. */
'use strict';
(()=>{
const q=id=>document.getElementById(id), mk=(tag,cls='',text='')=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n},
    add=(p,...els)=>{p.append(...els);return p},
    ls=(key,def)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):def}catch{return def}},
    save=(key,val)=>localStorage.setItem(key,JSON.stringify(val));
const EP22={version:'22.1',voiceKey:'elp-22-voice',prefKey:'elp-22-ui',videoKey:'elp-22-video-path',chapterKey:'elp-22-chapter-learning',userVoice:'',flipTimer:null,flipBusy:false,audio:null};
window.EP22=EP22;
const norm=s=>String(s||'').normalize('NFKC').toLocaleLowerCase('en').replace(/[’‘]/g,"'").replace(/^[\s.,!?;:"“”()]+|[\s.,!?;:"“”()]+$/g,'').replace(/\s+/g,' ').trim();
const userCards=()=>words.filter(w=>w&&w.text&&w.meaning), studied=()=>userCards().filter(w=>ep181Studied(w));
const ui=ls(EP22.prefKey,{theme:'dark',animation:true,readerTheme:'paper'});

// 1. Modern colour system: dark ocean-blue; optional light porcelain theme.
function applyTheme(){document.documentElement.dataset.ep22Theme=ui.theme;save(EP22.prefKey,ui);const b=q('ep22Appearance');if(b)b.textContent=ui.theme==='dark'?'☀ Світла тема':'☾ Темна тема'}
const theme=mk('button','btn alt small','☀ Світла тема');theme.id='ep22Appearance';theme.onclick=()=>{ui.theme=ui.theme==='dark'?'light':'dark';applyTheme()};
const settingsTarget=q('settingsDialog')?.querySelector('.dialog-content')||q('settingsDialog');
if(settingsTarget){const p=mk('div','ep22-preferences');add(p,mk('strong','','Вигляд і звук'),theme);settingsTarget.prepend(p)}
applyTheme();

// 2. Browser voices have no reliable gender field. Prefer common male-labelled names,
// then let the user choose explicitly. Do not change pitch to fake a male voice.
const maleNames=/\b(male|guy|david|ryan|christopher|andrew|daniel|aaron|arthur|alex|fred|liam|oliver|george|james|graham|thomas|tom|rishi|reed|matthew|eric|mark|richard|charles|adam|brian|roger|john|peter|alan|lee)\b/i;
const femaleNames=/\b(female|zira|hazel|susan|samantha|victoria|aria|jenny|serena|ava|siri|allison|emily|emma|karen|moira|fiona|kate|sara|heather|catherine|natasha|sonia)\b/i;
const voiceBox=mk('div','ep22-voice-settings'),vLabel=mk('label','','Голос англійською'),vSelect=mk('select','input'),vHint=mk('p','smallhint','За замовчуванням — чоловічий, якщо він є серед голосів телефона. Послухай і вибери найприємніший.'),vTry=mk('button','btn alt small','🔊 Послухати приклад');
const oldRate=()=>typeof EP17!=='undefined'?EP17.rate:.9;
EP22.userVoice=localStorage.getItem(EP22.voiceKey)||'';
const voiceMigrationKey='elp-221-male-preference';
if(!localStorage.getItem(voiceMigrationKey)){
  // The last version could preserve an automatically assigned female voice.
  // Reset just the old voice choice once so the new male-first preference applies.
  EP22.userVoice=''; localStorage.removeItem(EP22.voiceKey);
  localStorage.setItem(voiceMigrationKey,'1');
}
function voices(){if(!('speechSynthesis' in window))return[];return speechSynthesis.getVoices().filter(v=>/^en(?:-|_)/i.test(v.lang));}
function maleScore(v){const n=v.name||'';let sc=0;if(maleNames.test(n))sc+=100;if(femaleNames.test(n))sc-=120;
 if(/natural|neural|enhanced|premium/i.test(n))sc+=15;
 if(/en-CA/i.test(v.lang))sc+=10;else if(/en-GB/i.test(v.lang))sc+=6;else if(/en-US/i.test(v.lang))sc+=5;
 return sc;}
function preferredVoice(){const all=voices();return all.find(v=>v.voiceURI===EP22.userVoice)||all.slice().sort((a,b)=>maleScore(b)-maleScore(a))[0]||null;}
function renderVoices(){const current=EP22.userVoice,all=voices().sort((a,b)=>maleScore(b)-maleScore(a));vSelect.replaceChildren();
 vSelect.add(new Option('Автоматично — чоловічий у пріоритеті',''));
 for(const v of all)vSelect.add(new Option((maleNames.test(v.name)&&!femaleNames.test(v.name)?'● ':'')+v.name+' · '+v.lang,v.voiceURI));
 vSelect.value=all.some(v=>v.voiceURI===current)?current:'';
 if(!all.length)vHint.textContent='Англійські голоси ще не завантажені. Перевір мовні налаштування телефона.';
 else if(!all.some(v=>maleNames.test(v.name)&&!femaleNames.test(v.name)))vHint.textContent='Не знайдено голосу з чоловічою назвою. Обери доступний або додай англійський голос у налаштуваннях пристрою.';
 else vHint.textContent='Рекомендований чоловічий голос вибрано автоматично. Можна прослухати інші й зберегти вибір.';
}
function speech(text,opt={}){if(!('speechSynthesis'in window)||typeof SpeechSynthesisUtterance==='undefined'){toast('Озвучування недоступне на цьому пристрої');return}
 const str=String(text||'').trim();if(!str)return;
 speechSynthesis.cancel();const chunks=str.slice(0,7000).match(/.{1,170}(?:[.!?]\s|\s|$)/gu)||[str.slice(0,7000)];let i=0;
 function next(){if(i>=chunks.length){opt.onDone?.();return}const u=new SpeechSynthesisUtterance(chunks[i++]),v=preferredVoice();
 if(v){u.voice=v;u.lang=v.lang}else u.lang='en-CA';
 u.rate=Math.min(1.1,Math.max(.72,oldRate()));u.pitch=1;
 u.onend=next;u.onerror=e=>{if(!['interrupted','canceled'].includes(e.error))toast('Не вдалося озвучити текст');opt.onDone?.()};speechSynthesis.speak(u)}next();}
vSelect.onchange=()=>{EP22.userVoice=vSelect.value;localStorage.setItem(EP22.voiceKey,EP22.userVoice)};
vTry.onclick=()=>speech('Hi! Welcome to English Pocket. Let us practise everyday English together.');
add(voiceBox,vLabel,vSelect,vHint,vTry);if(settingsTarget)settingsTarget.prepend(voiceBox);
renderVoices();q('settingsButton')?.addEventListener('click',()=>setTimeout(renderVoices,80));
if('speechSynthesis' in window){speechSynthesis.addEventListener?.('voiceschanged',renderVoices);setTimeout(renderVoices,900)}
speakEnglish=function(text){speech(text)};

// 3. Trustworthy offline lookup. Word and phrase translations ONLY: never fabricate
// a full sentence translation from individual word glosses.
function getOfflineMap(){const dictionary=new Map();const insert=(en,uk,priority)=>{const k=norm(en);if(!k||!uk)return;const old=dictionary.get(k);if(!old||priority>old.priority)dictionary.set(k,{en,uk,priority})};
 for(const [en,uk] of Object.entries(window.EP22_OFFLINE_LEXICON||{}))insert(en,uk,1);
 for(const [en,uk] of Object.entries(window.EP221_EXTRA_LEXICON||{}))insert(en,uk,2);
 for(const [en,rec] of ep17Dict())insert(rec.text||en,rec.meaning,3);
 for(const card of userCards())insert(card.text,card.meaning,5);
 return dictionary;}
const irregularRoots={am:'be',is:'be',are:'be',was:'be',were:'be',been:'be',being:'be',has:'have',had:'have',does:'do',did:'do',done:'do',went:'go',gone:'go',saw:'see',seen:'see',ate:'eat',eaten:'eat',drank:'drink',drunk:'drink',ran:'run',took:'take',taken:'take',got:'get',gotten:'get',gave:'give',given:'give',knew:'know',known:'know',wrote:'write',written:'write',spoke:'speak',spoken:'speak',bought:'buy',brought:'bring',thought:'think',caught:'catch',taught:'teach',made:'make',found:'find',felt:'feel',kept:'keep',left:'leave',lost:'lose',paid:'pay',met:'meet',sent:'send',built:'build',heard:'hear',held:'hold',told:'tell',sold:'sell',read:'read',fell:'fall',fallen:'fall',grew:'grow',grown:'grow',began:'begin',begun:'begin',chose:'choose',chosen:'choose',drew:'draw',drawn:'draw',drove:'drive',driven:'drive',broke:'break',broken:'break',forgot:'forget',forgotten:'forget',understood:'understand',won:'win',wore:'wear',worn:'wear',stood:'stand',sat:'sit',slept:'sleep',spent:'spend',put:'put',cut:'cut',hit:'hit',shut:'shut',said:'say',fought:'fight',flew:'fly',flown:'fly',swam:'swim',swum:'swim',sang:'sing',sung:'sing',stole:'steal',stolen:'steal',hid:'hide',hidden:'hide',rode:'ride',ridden:'ride',rose:'rise',risen:'rise',chose:'choose',bit:'bite',bitten:'bite',lay:'lie',laid:'lay',led:'lead',lent:'lend',borrowed:'borrow',children:'child',men:'man',women:'woman',people:'person',feet:'foot',teeth:'tooth',mice:'mouse',geese:'goose',better:'good',best:'good',worse:'bad',worst:'bad',further:'far',farther:'far'};
function lemmaCandidates(token){const k=norm(token);if(!k||k.includes(' '))return[];
 const c=[];const push=x=>{if(x&&x!==k&&!c.includes(x)&&x.length>=2)c.push(x)};
 push(irregularRoots[k]);
 if(k.length>=5){
  if(k.endsWith('ies'))push(k.slice(0,-3)+'y');
  if(k.endsWith('ied'))push(k.slice(0,-3)+'y');
  if(k.endsWith('ves')){push(k.slice(0,-3)+'f');push(k.slice(0,-3)+'fe')}
  if(k.endsWith('es')){push(k.slice(0,-2));push(k.slice(0,-1))}
  if(k.endsWith('ing')){const base=k.slice(0,-3);push(base);push(base+'e');if(/([b-df-hj-np-tv-z])\1$/.test(base))push(base.slice(0,-1));}
  if(k.endsWith('ed')){const base=k.slice(0,-2);push(base);push(base+'e');if(/([b-df-hj-np-tv-z])\1$/.test(base))push(base.slice(0,-1))}
  if(k.endsWith('er')){push(k.slice(0,-2));push(k.slice(0,-1));}
  if(k.endsWith('est')){push(k.slice(0,-3));push(k.slice(0,-2));}
  if(k.endsWith('s')&&!k.endsWith('ss'))push(k.slice(0,-1));
 }
 return c;}
function offlineLookup(text){const dict=getOfflineMap(),key=norm(text);const exact=dict.get(key);if(exact)return {exact:true,meaning:exact.uk,source:exact.priority===5?'Твоя картка':'Офлайн-словник'};
 let base='';if(!key.includes(' ')){base=lemmaCandidates(key).find(x=>dict.has(x))||'';}
 else{const parts=key.split(' ');for(const b of lemmaCandidates(parts[0])){const q=[b,...parts.slice(1)].join(' ');if(dict.has(q)){base=q;break;}}}
 if(base){const hit=dict.get(base);return {exact:false,derived:true,meaning:hit.uk,base,source:'Словникова форма: '+base};}
 const gloss=[];const addGloss=(en,r)=>{if(gloss.length<5&&!gloss.some(x=>norm(x.en)===norm(en)))gloss.push({en:r.en||en,uk:r.uk})};
 // Match phrasal verbs first. Avoid substring matches inside other words.
 for(const [part,r] of [...dict.entries()].filter(([k])=>k.length>=4&&k.includes(' ')).sort((a,b)=>b[0].length-a[0].length)){
  if(gloss.length>=3)break;const needle=part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  if(new RegExp('(^|[^\\p{L}])'+needle+'(?=$|[^\\p{L}])','iu').test(key))addGloss(part,r);
 }
 if(gloss.length<5)for(const part of key.match(/[\p{L}']+/gu)||[]){if(gloss.length>=5)break;
  const direct=dict.get(part),root=lemmaCandidates(part).find(x=>dict.has(x)),hit=direct||(root&&dict.get(root));
  if(hit&&part.length>=3)addGloss(part,hit);
 }
 return {exact:false,gloss};}
// Disable legacy automatic cloud calls; the user must explicitly choose them.
const oldLookup=readerLookup;
readerLookup=function(text,context=''){oldLookup(text,context);const local=offlineLookup(text);const saved=ep181CacheGet(text),exact=local.exact&&local.meaning;
 if(exact){q('trayMeaning').value=local.meaning;q('trayStatus').textContent=local.source+' · доступно офлайн';}
 else if(local.derived){q('trayMeaning').value=local.meaning;q('trayStatus').textContent='Словникова форма: '+local.base+' · перевір значення у контексті';}
 else if(saved){q('trayMeaning').value=saved;q('trayStatus').textContent='Збережений попередній переклад · перевір значення';}
 else {q('trayMeaning').value='';q('trayStatus').textContent=local.derived?'Знайдено словникову форму — перевір значення':'Немає точного локального перекладу. Можна додати власний.'}
 const gloss=q('ep17Glosses');if(gloss){gloss.replaceChildren();if(!exact&&local.gloss?.length){gloss.append(mk('div','smallhint','Знайомі слова і вирази (це не переклад цілого речення):'));for(const g of local.gloss){const line=mk('div','ep22-glossline');add(line,mk('b','',g.en),mk('span','',g.uk));gloss.append(line)}}}
 const btn=q('ep181Translate');if(btn){btn.textContent='Локальний переклад';btn.disabled=false;}
};
const oldEp181Btn=q('ep181Translate');if(oldEp181Btn){oldEp181Btn.onclick=async()=>{
 if(!trayValue?.text)return;const info=offlineLookup(trayValue.text);if(info.exact||info.derived){q('trayMeaning').value=info.meaning;q('trayStatus').textContent=info.derived?'Словникова форма: '+info.base+' · перевір контекст':'Офлайн-словник · готово';return}
 if(typeof window.Translator==='function'||window.Translator){
  try{const T=window.Translator,status=await T.availability({sourceLanguage:'en',targetLanguage:'uk'});
   if(status==='available'){q('trayStatus').textContent='Локальна модель перекладає…';const instance=await T.create({sourceLanguage:'en',targetLanguage:'uk'});try{const out=await instance.translate(trayValue.text);q('trayMeaning').value=String(out||'');q('trayStatus').textContent='Переклад на пристрої · перевір перед збереженням'}finally{instance.destroy?.()}return}
   if(status==='downloadable'||status==='downloading'){q('trayStatus').textContent='Для цього перекладу браузеру потрібно окремо завантажити мовну модель. На телефонах функція може бути недоступною.';return}
  }catch(err){q('trayStatus').textContent='Локальна модель недоступна для цієї пари мов';}}
  q('trayStatus').textContent='Повний локальний переклад цього речення недоступний на пристрої. Можеш вписати власний переклад.';
 }}
// Never automatically send selected reading text to MyMemory.
// The legacy online-translation consent is left untouched; no automatic network requests are made.
// Small, explicit external fallback kept hidden unless the user requests it.
const external=q('trayExternal');if(external)external.hidden=true;

// 4. Reader: friendly tap/selection, gentle native selection on mobile; avoid click reopening
// the modal. The previous v15 selection handlers continue handling word/phrase selection.
const area=q('pageText');if(area){area.setAttribute('aria-label','Текст книги. Торкнися слова або виділи фразу для перекладу.');
 area.addEventListener('pointerup',()=>{setTimeout(()=>{if(!book||q('bookview').hidden)return;const sel=window.getSelection();if(sel&&!sel.isCollapsed&&sel.toString().trim().length>=2)captureSelection()},170)},{passive:true});}
// 5. Animated page flip. A brief 3-D paper flip using a clone of the current page only.
const originalTurn22=turn;let flipCleanup=null;
function animatePage(direction){if(!book||ui.animation===false||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||q('translationTray')?.hidden===false)return;
 const box=q('pageWindow'),text=q('pageText');if(!box||!text||text.textContent.length>180000)return;
 const overlay=mk('div','ep22-flip-overlay '+(direction>0?'next':'prev'));
 const copy=text.cloneNode(true);copy.id='';copy.className+=' ep22-flip-copy';copy.style.width=text.clientWidth+'px';copy.style.height=text.clientHeight+'px';copy.style.overflow='hidden';overlay.append(copy);box.append(overlay);copy.scrollLeft=text.scrollLeft;
 if(flipCleanup)clearTimeout(flipCleanup);flipCleanup=setTimeout(()=>overlay.remove(),490);
}
turn=function(direction){try{animatePage(direction)}catch{}return originalTurn22(direction)};
// 6. Inline reader preferences: one simple animation toggle in settings.
const flipWrap=mk('label','ep22-toggle'),flipInput=mk('input');flipInput.type='checkbox';flipInput.checked=ui.animation!==false;flipInput.onchange=()=>{ui.animation=flipInput.checked;save(EP22.prefKey,ui)};
add(flipWrap,flipInput,mk('span','','Гортання з ефектом книги'));settingsTarget?.prepend(flipWrap);

// 7. Reading aloud: highlight the paragraph being spoken (best effort; not word-level
// synchronization). Device engine voices may not expose boundary events reliably.
function clearSpeechGlow(){q('pageText')?.querySelectorAll('.ep22-speaking').forEach(el=>el.classList.remove('ep22-speaking'))}
let currentParagraphs=[];
function visibleParagraphs(){const page=q('pageWindow').getBoundingClientRect();return [...q('pageText').querySelectorAll('p,h1,h2,h3,h4,li,blockquote')].filter(p=>[...p.getClientRects()].some(r=>r.left<page.right-8&&r.right>page.left+8&&r.bottom>page.top+5&&r.top<page.bottom-5)).slice(0,18)}
function speechParagraphs(paras){if(!paras.length)return;stopSpeech();let i=0;
 const speakNext=()=>{clearSpeechGlow();if(i>=paras.length)return;const p=paras[i++];if(!p?.textContent?.trim())return speakNext();p.classList.add('ep22-speaking');p.scrollIntoView?.({block:'nearest'});const u=new SpeechSynthesisUtterance(p.textContent.trim().slice(0,450));const v=preferredVoice();if(v){u.voice=v;u.lang=v.lang}else u.lang='en-CA';u.rate=oldRate();u.pitch=1;u.onend=speakNext;u.onerror=clearSpeechGlow;speechSynthesis.speak(u)};speakNext()}
q('readerSpeak').onclick=()=>{if(!('speechSynthesis'in window))return toast('Озвучування недоступне');if(speechSynthesis.speaking){stopSpeech();clearSpeechGlow();return}speechParagraphs(visibleParagraphs())};
const speechBaseStop=stopSpeech;stopSpeech=function(){speechBaseStop();clearSpeechGlow()};
// mode: tap a paragraph to read it without copying selection.
const paragraphBtn=q('ep17ParagraphMode');if(paragraphBtn)paragraphBtn.textContent='🎧 Натисни абзац';
// Reuse the original paragraph-tap mode while highlighting the spoken paragraph.
speakEnglish=function(text){const match=book&&q('bookview')&&!q('bookview').hidden?[...q('pageText').querySelectorAll('p,li,h1,h2,h3,h4,blockquote')].find(p=>p.textContent.trim()===String(text).trim()):null;
 if(match&&EP17.paragraphMode)speechParagraphs([match]);else speech(text)};

// 8. Reading vocabulary map for current book; no new navigation button, subtle details
// located within the existing reading tools.
const readMap=mk('details','ep22-reading-map'),summary=mk('summary','','📚 Слова з цієї книги'),readMapArea=mk('div','ep22-map-body');add(readMap,summary,readMapArea);
q('readerMore')?.append(readMap);
function bookCards(){if(!book)return[];return words.filter(w=>w.source==='book:'+book.title||w.p20Location?.bookId===book.id)}
function drawReadMap(){readMapArea.replaceChildren();const cards=bookCards(),done=cards.filter(w=>ep181Studied(w)),mastered=done.filter(w=>ep17Mastery(w)==='mastered');
 readMapArea.append(mk('p','smallhint',`${cards.length} збережено · ${done.length} вивчено · ${mastered.length} засвоєно`));
 for(const w of cards.slice(0,15)){const line=mk('button','ep22-map-word');line.type='button';line.textContent=w.text+' · '+w.meaning;line.onclick=()=>{show('readerMore',false);readerLookup(w.text,w.example||'')};readMapArea.append(line)}
 if(cards.length>15)readMapArea.append(mk('p','smallhint','Ще '+(cards.length-15)+' фраз доступні у «Мої картки».'));}
readMap.addEventListener('toggle',()=>{if(readMap.open)drawReadMap()});

// 9. Adaptive practice / mastery dashboard. No new main tab; compact card in the words pane.
function skills(w){const s=ep203Skills(w),one=t=>({attempts:Number(s[t]?.attempts)||0,correct:Number(s[t]?.correct)||0,misses:Number(s[t]?.misses)||0,weak:!!s[t]?.needsWork});return {recall:one('recall'),audio:one('listening'),usage:one('usage')}}
function bottleneck(w){const s=skills(w),arr=[['context',s.recall],['audio',s.audio],['speak',s.usage]];
 arr.sort((a,b)=>((b[1].weak?10:0)+b[1].misses*2+(b[1].attempts===0?1:0))-((a[1].weak?10:0)+a[1].misses*2+(a[1].attempts===0?1:0)));
 return arr[0][0]}
function masterySteps(w){const x=skills(w);return [{label:'Розумію',done:!!w.srs},{label:'Пригадую',done:x.recall.correct>=2},{label:'Чую',done:x.audio.correct>=2},{label:'Використовую',done:x.usage.correct>=2&&new Set(w.recallHistory?.filter(z=>z.ok).map(z=>z.day)||[]).size>=2}]}
function todayPlan(){const known=studied();const weak=known.filter(w=>ep202Hard(w)||Object.values(skills(w)).some(s=>s.weak));const late=known.filter(w=>Number(w.srs?.due||0)<=Date.now());const fresh=words.filter(w=>w?.meaning&&!w.srs);return {known,weak,late,fresh,newLimit:late.length>20?0:late.length>10?2:5}}
// Enhance the existing Daily Coach rather than adding a competing card.
const oldCoach22=p20RenderCoach;
p20RenderCoach=function(){oldCoach22();const plan=todayPlan();const steps=[...q('p20Coach').querySelectorAll('.p20-step')];
 if(steps[1]&&plan.fresh.length){const label=steps[1].querySelector('strong');if(label)label.textContent='Нові · рекомендовано до '+plan.newLimit;
  const hint=steps[1].querySelector('small');if(hint)hint.textContent=plan.newLimit?'Після повторення · зі свого словника':'Сьогодні краще повторити старі';}
 if(steps[2]&&plan.known.length){const target=[...plan.known].sort((a,b)=>ep203Priority(b,bottleneck(b))-ep203Priority(a,bottleneck(a)))[0],mode=bottleneck(target),title=mode==='audio'?'слух':mode==='speak'?'використання':'пригадування';
  const label=steps[2].querySelector('strong'),hint=steps[2].querySelector('small');if(label)label.textContent='Тренування: '+title;if(hint)hint.textContent='Фрази, що потребують найбільше практики';
  steps[2].onclick=()=>{q('ep18TrainingDetails').open=true;ep18SetMode(mode);q('ep18TrainingDetails').scrollIntoView({behavior:'smooth',block:'start'})};}
 const footer=q('p20Coach').querySelector('.p20-coach-footer');if(footer&&plan.weak.length)footer.textContent+=' · У фокусі: '+plan.weak.length+' складних';
};
const oldSaveWords22=saveWords;saveWords=function(){oldSaveWords22();clearTimeout(EP22.refresh);EP22.refresh=setTimeout(()=>{if(q('p20Coach'))p20RenderCoach()},250)};
const oldDrawReview22=drawReview;drawReview=function(){oldDrawReview22();if(q('p20Coach'))p20RenderCoach()};
p20RenderCoach();
// Mastery ladder in card editor, hidden under one expandable summary.
const mastery=mk('details','ep22-mastery'),mt=mk('summary','','Мої навички з цією фразою'),mb=mk('div','ep22-mastery-body');mastery.append(mt,mb);
q('cardForm')?.querySelector('.actions')?.before(mastery);
const oldOpenCard22=openCard;
openCard=function(...args){oldOpenCard22(...args);mb.replaceChildren();const item=editingId?words.find(w=>w.id===editingId):null;if(item){for(const step of masterySteps(item))mb.append(mk('div','ep22-mastery-row',(step.done?'✓ ':'○ ')+step.label))}else mb.textContent='З’явиться після перших повторень';mastery.open=false};

// 10. Safe transfer contexts (hand-written, no random word-substitution). Only show
// when the corresponding phrase is already among studied cards.
const CONTEXTS={
 'run out of':['We ran out of milk.','We are running out of time.'],
 'come across':['I came across an interesting article.','She came across an old photo.'],
 'look forward to':['I am looking forward to meeting you.','We look forward to your reply.'],
 'put up with':['I cannot put up with this noise.','She puts up with a long commute.'],
 'get along with':['I get along with my neighbours.','Do you get along with your coworkers?'],
 'cut down on':['I need to cut down on coffee.','They are cutting down on expenses.'],
 'pick up a prescription':['I need to pick up a prescription.','Can I pick up my prescription today?'],
 'within walking distance':['The school is within walking distance.','The station is within walking distance of our home.']
};
const originalContexts22=ep203Contexts;
ep203Contexts=function(w){const base=originalContexts22(w);const existing=new Set(base.map(c=>norm(c.example||'')));
 for(const example of CONTEXTS[norm(w.text)]||[]){if(existing.has(norm(example)))continue;const context=ep203OriginalContext({...w,example,context:'',ep203ContextIndex:0});if(context?.masked){base.push(context);existing.add(norm(example))}}
 return base};

// 11. Listening Video Studio: guided learning path, deliberate two-pass listening,
// written self-check and optional timestamped phrases. No transcript scraping.
const videoPath=mk('details','ep22-video-path'),videoTitle=mk('summary','','▶ Мій відеомаршрут A2 → B1'),videoList=mk('div','ep22-video-list');videoPath.append(videoTitle,videoList);q('videoList')?.before(videoPath);
const vids=()=>typeof CATALOG!=='undefined'?CATALOG:[];
function drawVideoPath(){videoList.replaceChildren();const source=vids(),results=ls(EP22.videoKey,{});const order=[...source].sort((a,b)=>{const lvl=v=>(v.level||'').includes('A2')?0:1;return lvl(a)-lvl(b)||Number(!!results[a.id]?.completed)-Number(!!results[b.id]?.completed)});
 for(const v of order.slice(0,8)){const line=mk('div','ep22-video-step'),l=mk('div',''),a=mk('a','btn alt small','Відкрити ↗');a.href=v.url;a.target='_blank';a.rel='noopener noreferrer';add(l,mk('b','',`${results[v.id]?.completed?'✓':'○'} ${v.name}`),mk('p','smallhint',`${v.level} · ${v.source}`));line.append(l,a);const pb=mk('button','btn small','Практика');pb.onclick=()=>ep22VideoExercise(v);line.append(pb);videoList.append(line)}
}
videoPath.addEventListener('toggle',()=>{if(videoPath.open)drawVideoPath()});
function ep22VideoExercise(v){const panel=q('ep17VideoPractice');panel.replaceChildren();show('ep17VideoPractice',true);const prior=ls(EP22.videoKey,{})[v.id]||{},guide=typeof EP18_GUIDES!=='undefined'?EP18_GUIDES[v.id]:null;
 const heading=mk('h3','','Мініурок: '+v.name),st=mk('p','smallhint','Підготовка: '+(guide?.before||'Пригадай, що ти вже знаєш про цю тему.')+' Перший перегляд — без субтитрів, другий — з англійськими субтитрами.'),a=mk('a','btn alt small','▶ Дивитися на джерелі');a.href=v.url;a.target='_blank';a.rel='noopener noreferrer';
 const firstPass=mk('label','ep22-video-check'),checkFirst=mk('input');checkFirst.type='checkbox';checkFirst.checked=!!prior.firstPass;firstPass.append(checkFirst,mk('span','','1 · Без субтитрів'));
 const secondPass=mk('label','ep22-video-check'),checkSecond=mk('input');checkSecond.type='checkbox';checkSecond.checked=!!prior.secondPass;secondPass.append(checkSecond,mk('span','','2 · З англійськими субтитрами'));
 const gist=mk('textarea','input'),details=mk('textarea','input');gist.rows=2;gist.placeholder='What is the main idea of the video?';gist.value=prior.gist||'';details.rows=2;details.placeholder=guide?.question||'What two details did you understand?';details.value=prior.details||'';
 const level=mk('select','input');for(const [k,val] of [['','Оціни розуміння'],['hard','Поки складно'],['okay','Зрозумів основне'],['good','Можу коротко переказати']])level.add(new Option(val,k));level.value=prior.level||'';
 const phrase=mk('input','input');phrase.placeholder='Фраза з відео (за бажанням)';const meaning=mk('input','input');meaning.placeholder='Українське значення';const time=mk('input','input');time.placeholder='Час у відео, напр. 02:35';time.value=prior.time||'';
 const saveBtn=mk('button','btn','Зберегти мініурок');saveBtn.onclick=()=>{const out=ls(EP22.videoKey,{});out[v.id]={completed:checkFirst.checked&&checkSecond.checked,gist:gist.value.trim(),details:details.value.trim(),level:level.value,time:time.value.trim(),firstPass:checkFirst.checked,secondPass:checkSecond.checked,at:Date.now()};save(EP22.videoKey,out);
  if(phrase.value.trim()&&meaning.value.trim())mergeWords([{text:phrase.value.trim(),meaning:meaning.value.trim(),source:'video:'+v.name,note:time.value.trim()?'Мітка відео '+time.value.trim():''}]);
  show('ep17VideoPractice',false);drawVideos();toast(checkFirst.checked&&checkSecond.checked?'Урок збережено як завершений':'Прогрес уроку збережено; два перегляди ще не позначені')};
 add(panel,heading,st,a,firstPass,secondPass,mk('label','','Основна думка'),gist,mk('label','','Перевірка розуміння'),details,level,mk('label','','Корисна фраза (необов’язково)'),phrase,meaning,time,saveBtn);
 panel.scrollIntoView({behavior:'smooth',block:'nearest'});
}
const oldDrawVideo22=drawVideos;
drawVideos=function(){oldDrawVideo22();const r=ls(EP22.videoKey,{});const count=Object.values(r).filter(x=>x.completed).length;videoTitle.textContent=`▶ Мій відеомаршрут A2 → B1 · ${count} уроків пройдено`};drawVideos();

// 12. Chapter review: an authentic comprehension self-check with retained notes.
const originalChapterReview=ep21OpenChapterReview;
ep21OpenChapterReview=function(){originalChapterReview();if(!book)return;const panel=q('ep21ChapterReview'),key=book.id+':'+chapter,store=ls(EP22.chapterKey,{}),old=store[key]||{};
 const extra=mk('div','ep22-chapter-comprehension');extra.append(mk('strong','','Зрозумів розділ?'),mk('p','smallhint','Без автоматичного оцінювання: коротко опиши, що відбулося, і поясни одну причину чи наслідок.'));
 const r=mk('textarea','input');r.rows=2;r.placeholder='What happened in this chapter?';r.value=old.summary||'';
 const why=mk('textarea','input');why.rows=2;why.placeholder='Why did it happen?';why.value=old.reason||'';
 const btn=mk('button','btn alt small','Зберегти відповіді');btn.onclick=()=>{const data=ls(EP22.chapterKey,{});data[key]={summary:r.value.trim(),reason:why.value.trim(),at:Date.now()};save(EP22.chapterKey,data);toast('Відповіді до розділу збережено')};add(extra,r,why,btn);panel.append(extra)};

// 13. Backup bridge: the existing full backup exports all elp-* keys, including
// these new fields. Preserve fresh content after importing a backup.
q('backToLibrary')?.addEventListener('click',clearSpeechGlow);
EP22.dictionaryLookup=offlineLookup;EP22.voiceChoice=preferredVoice;EP22.voiceScore=maleScore;
})();
