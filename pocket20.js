/* English Pocket 20.0 — cohesive learning, source-aware reader and authentic Canada scripts.
 * Extends the 18.1 data model; no AI API, no invented grammar judgements. */
'use strict';
const P20={queueKey:'elp-20-coach',soundKey:'elp-20-audio',highlightKey:'elp-20-highlights',session:null,dialog:null,audioIndex:0};
const p20E=(t,c='',s)=>node(t,c,s);
const p20Studied=()=>ep181StudiedCards().filter(w=>!!w.meaning);
const p20DialogNorm=t=>ep18Norm(String(t||'').replace(/\bthat's\b/gi,'that is').replace(/\bi'll\b/gi,'I will').replace(/\bi'd\b/gi,'I would').replace(/\bwe'll\b/gi,'we will').replace(/\byou're\b/gi,'you are'));
const p20Has=(en)=>p20Studied().find(w=>p20DialogNorm(w.text)===p20DialogNorm(en));
const p20Needs=()=>words.filter(w=>w.meaning&&!ep181Studied(w));
function p20Skill(w){
 const h=Array.isArray(w.recallHistory)?w.recallHistory:[];
 const good=h.filter(x=>x.ok),unique=new Set(good.map(x=>x.day));
 const tests=good.some(x=>['test','srs','context','audio','dialogue','p20-dialogue'].includes(x.kind));
 const use=!!w.p20Skill?.use ||good.some(x=>['sentence','p20-use'].includes(x.kind));
 const reproduce=!!w.p20Skill?.reproduce ||good.some(x=>['context','audio','test','p20-dialogue'].includes(x.kind));
 const recognize=!!w.srs;
 const label=!recognize?'Ще не вивчено':use&&unique.size>=2?'Використовую':reproduce&&tests?'Відтворюю':'Розумію';
 return {recognize,reproduce,use,label,days:unique.size};
}
// Keep existing SRS data; gradually adapt retention to the actual review grade.
const p20OldRate=rateReview;
rateReview=function(grade){
 const w=words.find(x=>x.id===currentReviewId),prev=w?.srs?{...w.srs}:null,eligible=!!w&&answerVisible;
 p20OldRate(grade);if(!eligible||!w.srs)return;
 const last=w.p20Memory||{},priorStability=Math.max(.5,Math.min(120,Number(last.stability)||Number(prev?.interval)||1));
 const difficulty=Math.max(1,Math.min(10,(Number(last.difficulty)||5)+(grade===0?1:grade===1?.4:grade===3?-.35:-.08)));
 let stability=grade===0?.35:grade===1?Math.max(.6,priorStability*.88):grade===2?priorStability*(1.65-.04*difficulty):priorStability*(2.25-.055*difficulty);
 stability=Math.max(.25,Math.min(365,stability));
 const baseline=Math.max(0,Number(w.srs.interval)||0);
 let interval=grade===0?10/1440:grade===1?Math.min(baseline,Math.max(.5,stability*.85)):Math.max(baseline,stability);
 interval=Math.min(365,Math.max(grade===0?10/1440:.5,interval));
 w.p20Memory={stability,difficulty,lastGrade:grade,lastAt:Date.now(),desiredRetention:.9};
 w.srs.interval=interval;w.srs.due=Date.now()+interval*DAY;
 if(grade>=2)w.p20Skill={...(w.p20Skill||{}),recognize:true};
 saveWords();
};
const p20OldUpdate=ep18TrainUpdate;
ep18TrainUpdate=function(w,ok,type){p20OldUpdate(w,ok,type);if(!w)return;
 if(ok&&['context','audio'].includes(type)){w.p20Skill={...(w.p20Skill||{}),reproduce:true};saveWords()}
};
const p20OldComplete=l16Complete;
l16Complete=function(){p20OldComplete();const s=lessonState;if(s?.stage==='done')for(const id of s.ids){const w=words.find(x=>x.id===id);if(w?.srs){w.p20Skill={...(w.p20Skill||{}),recognize:true};}}saveWords();};
function p20Count(){const practiced=p20Studied(),now=Date.now();return {new:p20Needs().length,studied:practiced.length,due:practiced.filter(w=>Number(w.srs.due||0)<=now).length,weak:practiced.filter(w=>(w.ep18Train?.wrong||0)>0).length,active:practiced.filter(w=>p20Skill(w).reproduce).length,uses:practiced.filter(w=>p20Skill(w).use).length};}
const p20Coach=document.createElement('div');p20Coach.id='p20Coach';p20Coach.className='p20-coach';
$('reviewPane').insertBefore(p20Coach,$('lessonFlow'));
function p20RenderCoach(){
 const c=p20Count(),el=p20Coach;el.replaceChildren();
 const header=p20E('div','p20-coach-head');header.append(p20E('div','p20-kicker','ТВІЙ ПЛАН НА СЬОГОДНІ'),p20E('strong','p20-coach-title',c.due?'Спершу повтори знайоме':'15 хвилин для твоєї англійської'));
 el.append(header);
 const steps=p20E('div','p20-steps');
 function step(icon,label,sub,action,disabled=false){const b=p20E('button','p20-step');b.type='button';b.disabled=disabled;b.append(p20E('span','p20-step-icon',icon));const group=p20E('span','p20-step-text');group.append(p20E('strong','',label),p20E('small','',sub));b.append(group,p20E('span','p20-step-arrow','›'));b.onclick=action;steps.append(b)}
 step('↻',`Повторити · ${c.due}`,c.due?'Картки, які вже час згадати':'На сьогодні немає прострочених',()=>{launchDue();p20Coach.scrollIntoView({block:'start',behavior:'smooth'})},!c.due);
 step('＋',`Нові · до ${Math.min(10,Math.max(3,reviewPrefs.daily||5))}`,c.new?'Вивчення → практика → тест':'Нових карток немає',()=>{renderLesson();$('lessonFlow').scrollIntoView({block:'start',behavior:'smooth'})},!c.new);
 step('♫','Слухай і відтворюй',`${c.studied} уже пройдених фраз`,()=>{document.getElementById('ep18TrainingDetails').open=true;document.getElementById('p20Immersion').open=true;p20RenderAudio();document.getElementById('p20Immersion').scrollIntoView({block:'nearest',behavior:'smooth'})},!c.studied);
 step('🇨🇦','Діалог із життя',`Реальні ситуації · лише вивчені цільові репліки`,()=>{$('ep18CanadaDetails').open=true;$('ep18CanadaDetails').scrollIntoView({block:'start',behavior:'smooth'})});
 el.append(steps);
 const small=p20E('div','p20-coach-footer',`Вивчено: ${c.studied} · Відтворюю: ${c.active} · Власні речення: ${c.uses}`);el.append(small);
}
const p20BaseChoose=chooseWordTab;
chooseWordTab=function(tab){p20BaseChoose(tab);if(tab==='review')p20RenderCoach()};
const p20BaseSave=saveWords;
saveWords=function(){p20BaseSave();if(activeTab==='words'&&wordTab==='review')p20RenderCoach()};
// Audio immersion from completed cards only: play, recall and compare.
const p20Immersion=p20E('details','ep18-details');p20Immersion.id='p20Immersion';const audSum=p20E('summary','','🎧 Аудіоповторення');p20Immersion.append(audSum);
const p20AudArea=p20E('div','p20-audio-area');p20Immersion.append(p20AudArea);$('ep18TrainingArea').after(p20Immersion);
function p20AudioCards(){return ep18FocusWords().filter(ep181Studied).slice(0,10)}
function p20RenderAudio(){const el=p20AudArea;el.replaceChildren();const c=p20AudioCards();if(!c.length){el.append(p20E('p','smallhint','Спершу вивчи картки — тут вони стануть короткими аудіозавданнями.'));return}
 P20.audioIndex%=c.length;const w=c[P20.audioIndex];el.append(p20E('p','smallhint',`${P20.audioIndex+1}/${c.length} · Слухай англійською, потім відтвори значення.`));
 const btns=p20E('div','row wrap');btns.append(BTN('🔊 Слухати фразу',()=>speakEnglish(w.text),'btn'),BTN('Повторити повільніше',()=>{const rate=EP17.rate;EP17.rate=.7;speakEnglish(w.text);EP17.rate=rate},'btn alt small'));el.append(btns);
 const meaning=p20E('div','p20-answer');meaning.hidden=true;meaning.append(p20E('strong','',w.text),p20E('p','',w.meaning));if(w.example)meaning.append(p20E('p','smallhint',w.example));el.append(meaning);
 const navs=p20E('div','row wrap');navs.append(BTN('Показати текст',()=>{meaning.hidden=false},'btn alt'),BTN('Наступна →',()=>{stopSpeech();P20.audioIndex=(P20.audioIndex+1)%c.length;p20RenderAudio()},'btn'));el.append(navs);
}
p20Immersion.addEventListener('toggle',()=>{if(p20Immersion.open)p20RenderAudio();else stopSpeech()});
// User-generated context: self-assessment is explicit; no fake grammar AI.
const p20Writing=p20E('details','ep18-details');p20Writing.id='p20Writing';p20Writing.append(p20E('summary','','✍️ Використай фразу у своєму реченні'));
const p20WriteArea=p20E('div','p20-audio-area');p20Writing.append(p20WriteArea);p20Immersion.after(p20Writing);
function p20RenderWriting(){const el=p20WriteArea;el.replaceChildren();const c=p20AudioCards();if(!c.length){el.append(p20E('p','smallhint','Спершу пройди хоча б одну картку.'));return}
 const w=c[(P20.audioIndex||0)%c.length];el.append(p20E('p','smallhint','Створи своє речення з цією фразою. Не копіюй приклад із картки.'),p20E('strong','p20-write-word',w.text));
 const input=p20E('textarea','input');input.rows=3;input.placeholder='Моє речення англійською…';el.append(input);const feedback=p20E('div','p20-write-feedback');el.append(feedback);
 let assessed=false;el.append(BTN('Порівняти зі зразком',()=>{if(!clean(input.value))return toast('Напиши речення');feedback.replaceChildren();feedback.append(p20E('p','smallhint',`Приклад з твоєї картки: ${w.example||'Використай фразу природно у своєму реченні.'}`),p20E('p','smallhint','Оціни сам: чи правильна граматика та чи доречна фраза?'));const row=p20E('div','row wrap');
  row.append(BTN('✓ Вийшло',()=>finish(true),'btn'),BTN('↻ Потрібно повторити',()=>finish(false),'btn alt'));feedback.append(row);
  function finish(ok){if(assessed)return;assessed=true;w.p20Skill={...(w.p20Skill||{}),use:ok,usedAt:Date.now()};ep17Recall(w,ok,'p20-use');if(!ok&&w.srs)w.srs.due=Math.min(Number(w.srs.due)||Infinity,Date.now()+DAY);saveWords();feedback.replaceChildren(p20E('p','smallhint',ok?'Використання зафіксовано. Наступне закріплення — пізніше.':'Фразу повернуто до раннього повторення.'));feedback.append(BTN('Наступна фраза →',()=>{P20.audioIndex++;p20RenderWriting()},'btn alt'))}
 },'btn'));
}
p20Writing.addEventListener('toggle',()=>{if(p20Writing.open)p20RenderWriting()});
// Status for studied vs actively recalled vs used in a new situation, shown on existing cards.
const p20OldDrawList=drawWordList;
drawWordList=function(){p20OldDrawList();for(const item of $('wordsList').querySelectorAll('.worditem')){const txt=item.querySelector('.wordtext')?.textContent?.replace(/^☆\s*/,''),w=wordMatch(txt);if(!w)continue;
 const pill=item.querySelector('.pill');if(pill){const old=pill.textContent.split(' · ').slice(1).join(' · ');pill.textContent=p20Skill(w).label+(old?' · '+old:'')}
 const buttons=item.querySelector('.mini-actions');if(w.p20Location?.bookId&&buttons){buttons.prepend(BTN('У книзі',()=>p20ReturnToBook(w),'btn ghost small'))}
 }};
async function p20ReturnToBook(w){try{const loc=w.p20Location;const b=await dbGet(loc.bookId);if(!b){toast('Книгу не знайдено. Можливо, її було видалено.');return}nav('read');await openBook(b);chapter=Math.min(b.chapters.length-1,Number(loc.chapter)||0);renderChapter(0,loc.fraction||0)}catch{toast('Не вдалося відкрити місце в книзі')}}
// Read: emphasize learned phrases only; ignore text nodes inside markup and preserve reader's selection.
const p20OldNewCandidates=newCandidates;
newCandidates=function(){return p20OldNewCandidates().sort((a,b)=>(Number(b.p20Priority)||0)-(Number(a.p20Priority)||0))};
const p20OldHighlights=highlightWords;
highlightWords=function(){if(localStorage.getItem(P20.highlightKey)==='off')return;
 const area=$('pageText'),phrases=p20Studied().map(w=>clean(w.text)).filter(t=>t.length>=3&&t.length<90).sort((a,b)=>b.length-a.length).slice(0,300);
 if(!phrases.length)return;
 const esc=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 let rx;try{rx=new RegExp('(?<![\\p{L}\\p{N}])('+phrases.map(esc).join('|')+')(?![\\p{L}\\p{N}])','giu')}catch{return}
 const walker=document.createTreeWalker(area,NodeFilter.SHOW_TEXT),textNodes=[];while(walker.nextNode()){const n=walker.currentNode;if(n.parentElement?.closest('mark,script,style')||n.textContent.length<2)continue;textNodes.push(n)}
 let marked=0;for(const n of textNodes){if(marked>450)break;const value=n.textContent;rx.lastIndex=0;let m=rx.exec(value);if(!m)continue;let cursor=0;const frag=document.createDocumentFragment();do{if(m.index>cursor)frag.append(document.createTextNode(value.slice(cursor,m.index)));frag.append(p20E('mark','saved-expression p20-learned-mark',m[0]));cursor=m.index+m[0].length;marked++;if(marked>450)break}while((m=rx.exec(value)));frag.append(document.createTextNode(value.slice(cursor)));n.replaceWith(frag)}
};
const p20SavedTray=$('traySave').onclick;
$('traySave').onclick=function(){const value=trayValue?.text,loc=book?{bookId:book.id,chapter,page,fraction:chapterPages<=1?0:page/(chapterPages-1)}:null;p20SavedTray();if(value&&loc){const w=wordMatch(value);if(w&&!w.p20Location){w.p20Location=loc;saveWords()}}};
// Reader settings remain tucked away and do not add a top bar.
const p20Toggle=p20E('button','btn alt small',localStorage.getItem(P20.highlightKey)==='off'?'○ Підсвічувати вивчені':'✓ Підсвічувати вивчені');p20Toggle.type='button';p20Toggle.onclick=()=>{const off=localStorage.getItem(P20.highlightKey)!=='off';localStorage.setItem(P20.highlightKey,off?'off':'on');p20Toggle.textContent=off?'○ Підсвічувати вивчені':'✓ Підсвічувати вивчені';refreshHighlights();};$('readerMore').querySelector('.row')?.append(p20Toggle);
// CANADA: replace the arbitrary phrase-matching generator with coherent authored conversations.
// Every assessed learner phrase must be previously studied; prompts are written to fit answers.
(function setupCanada20(){
 const details=$('ep18CanadaDetails');details.querySelector('summary').textContent='🇨🇦 Діалоги з життя в Канаді';
 const container=details.querySelector('.ep18-content');const legacy=p20E('div');legacy.hidden=true;while(container.firstChild)legacy.append(container.firstChild);container.append(legacy);
 const intro=p20E('p','smallhint','Справжня логіка розмови: слухай → відповідай → отримай реакцію. Практикуємо лише пройдені картки.');container.append(intro);
 const picker=p20E('select','input');picker.id='p20Scene';picker.setAttribute('aria-label','Життєва ситуація');
 for(const sc of P20_SCENES)picker.add(new Option(`${sc.icon} ${sc.name}`,sc.id));container.append(picker);
 const state=p20E('div','p20-scene-state'),actions=p20E('div','row wrap'),body=p20E('div','p20-scene-body');container.append(state,actions,body);
 function scene(){return P20_SCENES.find(s=>s.id===picker.value)||P20_SCENES[0]}
 function ready(sc,includeExtra=false){const seq=includeExtra?[...sc.steps,...sc.extra]:sc.steps;return seq.map(t=>({...t,card:p20Has(t.en)}))}
 function refresh(){P20.dialog=null;const sc=scene(),turns=ready(sc);state.replaceChildren();
  const available=turns.filter(x=>x.card).length;state.append(p20E('strong','',`${available}/${turns.length} реплік уже вивчено`),p20E('p','smallhint',sc.goal),p20E('p','p20-scene-note',sc.note));
  actions.replaceChildren();actions.append(BTN('＋ Додати репліки до навчання',()=>{
   const data=[...sc.steps,...sc.extra].map(t=>({text:t.en,meaning:t.uk,example:t.en,source:'canada:'+sc.name,level:sc.level}));
   const r=mergeWords(data);for(const t of [...sc.steps,...sc.extra]){const w=wordMatch(t.en);if(w){w.p201Included=true;if(!ep181Studied(w))w.p20Priority=Date.now()}}saveWords();toast(`Додано ${r.added} карток. Вони будуть першими серед нових.`);refresh();
  },'btn alt small'));
  const start=BTN('Почати діалог',()=>begin(false),'btn');start.disabled=!(turns[0].card&&turns[1].card);actions.prepend(start);
  const extra=BTN('Ускладнена ситуація',()=>begin(true),'btn alt small');extra.disabled=!(turns[0].card&&turns[1].card&&ready(sc,true).every(t=>!!t.card));actions.append(extra);
  body.replaceChildren();if(!(turns[0].card&&turns[1].card))body.append(p20E('div','p20-scene-help','Щоб почати, пройди хоча б перші дві репліки цієї ситуації в «Навчанні». Додані картки не вважатимуться вивченими, доки ти не завершиш їхній навчальний цикл.'));
 }
 function begin(challenge){const sc=scene(),steps=ready(sc,challenge);let count=0;while(count<steps.length&&steps[count].card)count++;
  if(count<2){refresh();return}
  P20.dialog={id:sc.id,sc,steps:steps.slice(0,count),index:0,correct:0,challenge};render();
 }
 function render(){const d=P20.dialog;if(!d)return;body.replaceChildren();if(d.index>=d.steps.length){
    const txt=`Діалог завершено: ${d.correct}/${d.steps.length} реплік містили потрібну фразу.`;
    body.append(p20E('div','p20-dialog-end',txt),p20E('p','smallhint','Це перевірка використання фраз, а не автоматична оцінка всієї граматики.'));const hist=parseLS(EP18.dialogueKey,[]);hist.push({name:d.sc.name,date:Date.now(),correct:d.correct,total:d.steps.length,version:'20.0',mode:d.challenge?'challenge':'basic'});putLS(EP18.dialogueKey,hist.slice(-40));
    body.append(BTN('Повторити',()=>begin(d.challenge),'btn alt'),BTN('Інша ситуація',()=>{const idx=P20_SCENES.findIndex(s=>s.id===d.sc.id);picker.value=P20_SCENES[(idx+1)%P20_SCENES.length].id;refresh()},'btn ghost small'));
    if(d.steps.length<d.sc.steps.length)body.append(p20E('p','smallhint','Ще репліки чекають на вивчення — тоді діалог стане довшим.'));return}
  const t=d.steps[d.index];body.append(p20E('div','p20-kicker',`${d.sc.role} · ${d.index+1}/${d.steps.length}`));
  const other=p20E('div','p20-partner',t.other);body.append(other,BTN('🔊 Послухати',()=>speakEnglish(t.other),'btn alt small'));
  body.append(p20E('p','p20-task','Твоя відповідь українською:'),p20E('div','p20-ukcue',t.uk));
  const input=p20E('textarea','input');input.rows=2;input.placeholder='Напиши відповідь англійською…';input.autocomplete='off';input.autocapitalize='off';input.spellcheck=false;body.append(input);
  const feed=p20E('div','p20-feedback');body.append(feed);
  let attempts=0,solved=false;
  const controls=p20E('div','row wrap');body.append(controls);
  const check=BTN('Відповісти',()=>{
   if(!clean(input.value))return toast('Напиши свою відповідь');attempts++;
   const actual=p20DialogNorm(input.value),target=p20DialogNorm(t.en);
   const matched=actual===target||(target.length>=4&&(' '+actual+' ').includes(' '+target+' '));
   feed.replaceChildren();
   if(!matched){feed.append(p20E('strong','','Зараз потрібна інша репліка.'),p20E('p','smallhint','Підказка: '+t.hint));
    feed.append(BTN('Показати природний зразок',()=>{feed.append(p20E('div','p20-ukcue',t.en),BTN('🔊',()=>speakEnglish(t.en),'btn ghost small'))},'btn ghost small'));
    if(attempts>=2)feed.append(BTN('Продовжити зі зразком',()=>next(false),'btn alt small'));
    return;
   }
   solved=true;d.correct++;
   t.card.p20Skill={...(t.card.p20Skill||{}),reproduce:true};ep17Recall(t.card,true,'p20-dialogue');saveWords();
   feed.append(p20E('strong','','✓ Використано потрібну фразу.'),p20E('p','smallhint','Оцінено наявність виразу, а не всю граматику.'));
   feed.append(p20E('div','p20-partner p20-reaction',t.reply));
   feed.append(BTN('🔊 Реакція співрозмовника',()=>speakEnglish(t.reply),'btn alt small'));
   controls.replaceChildren(BTN('Наступна репліка →',()=>next(true),'btn'));
  },'btn');
  controls.append(check,BTN('Підказка',()=>{feed.replaceChildren(p20E('p','smallhint',t.hint))},'btn ghost small'));
  function next(ok){if(!ok&&t.card){ep17Recall(t.card,false,'p20-dialogue');if(t.card.srs)t.card.srs.due=Math.min(Number(t.card.srs.due)||Infinity,Date.now()+DAY);saveWords()}d.index++;render()}
 }
 picker.addEventListener('change',refresh);
 details.addEventListener('toggle',()=>{if(details.open)refresh()});
 refresh();
 window.Pocket20Canada={refresh,scenes:P20_SCENES,ready};
})();
// Video Studio: publisher links, topic-specific prompts, a short after-watch response.
(function initVideo20(){
 const extras=[{id:'bob-daily20',topic:'listening',name:'Bob the Canadian — Everyday Objects',source:'Bob the Canadian',level:'A2',desc:'30 звичних предметів і приклади речень: корисно для щоденного життя.',url:'https://www.youtube.com/watch?v=YRFXfJQLkPA'}];
 extras.forEach(v=>{if(!CATALOG.some(x=>x.id===v.id))CATALOG.push(v)});
 EP18_GUIDES['bob-daily20']={before:'Назви 3 звичайні речі вдома англійською.',question:'Назви три предмети з відео та склади власне речення з одним із них.',example:'I leave my bag next to the chair.'};
 const pane=$('watchPane');const videoTop=p20E('div','p20-video-feature');videoTop.append(p20E('strong','','🇨🇦 Bob the Canadian · щоденна англійська'),p20E('p','smallhint','Коротка добірка уроків A2–B1 із завданнями до та після перегляду. Відео відкриваються на каналі автора.'));
 const r=p20E('div','row wrap');r.append(BTN('Показати уроки Bob',()=>{$('videoSearch').value='Bob the Canadian';drawVideos();$('videoList').scrollIntoView({behavior:'smooth',block:'start'})},'btn alt small'),BTN('Усі відео',()=>{$('videoSearch').value='';$('videoLevel').value='all';$('videoFilter').value='all';drawVideos()},'btn ghost small'));videoTop.append(r);
 pane.querySelector('.explain')?.after(videoTop);
})();
// Storage safety panel, with user-triggered persistent storage request.
(function initSafety20(){const dialog=$('settingsDialog');const safety=p20E('details','box p20-safety');safety.append(p20E('summary','','Надійність даних'));
 const desc=p20E('p','smallhint','Книги та картки зберігаються локально. Резервна копія — найнадійніший спосіб захистити прогрес.');const state=p20E('p','smallhint');safety.append(desc,state);
 safety.append(BTN('Перевірити дані',async()=>{try{const books=await dbList();const dup=words.length-new Set(words.map(w=>keyText(w.text))).size;const bad=words.filter(w=>!clean(w.text)).length;let use='';if(navigator.storage?.estimate){const e=await navigator.storage.estimate();use=` · Пам’ять ~${Math.round((e.usage||0)/1024/1024)} МБ`}state.textContent=`Книг: ${books.length} · Карток: ${words.length} · Дублікати: ${dup} · Некоректні: ${bad}${use}. Для повного захисту експортуй JSON.`}catch(err){state.textContent='Помилка перевірки: '+err.message}},'btn alt small'));
 safety.append(BTN('Зберігати дані на пристрої',async()=>{if(!navigator.storage?.persist){state.textContent='Браузер не підтримує цей дозвіл.';return}try{const yes=await navigator.storage.persist();state.textContent=yes?'Браузер дозволив постійне зберігання. Все одно роби копії.':'Браузер не надав гарантію зберігання. Регулярно експортуй JSON.'}catch{state.textContent='Не вдалося отримати дозвіл. Зроби резервну копію.'}},'btn alt small'));
 dialog.querySelector('.actions')?.before(safety);
})();
// Minimal re-render hooks when switching to words tab or opening a resumed lesson.
const p20DrawWords=drawWords;
drawWords=function(){p20DrawWords();if(wordTab==='review')p20RenderCoach()};
window.EnglishPocket20={version:'20.0',mastery:p20Skill,counts:p20Count,scenes:P20_SCENES,studied:p20Studied};
p20RenderCoach();

const p20PriorReset=ep181ResetWords;
ep181ResetWords=function(items){p20PriorReset(items);for(const w of items){delete w.p20Skill;delete w.p20Memory;w.p20Priority=Date.now()}saveWords();if(window.Pocket20Canada)Pocket20Canada.refresh();p20RenderCoach()};
