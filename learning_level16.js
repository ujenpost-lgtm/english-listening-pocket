/* English Pocket 16 — A2+ to B1; keeps v15 storage and existing user vocabulary. */
'use strict';
const LEVEL16_KEY='elp-16-today-v1';
const taughtToday=()=>parseLS(LEVEL16_KEY,{day:dateKey(),completed:0});
const learningStats=()=>({due:availableReview().length,newCount:newCandidates().length});

// New cards with an explicit A2+/B1 tag are learned before advanced/unclassified imports.
// Nothing is removed or secretly reclassified.
newCandidates=function(){
 return words.filter(w=>w.meaning&&!w.srs).sort((a,b)=>{
  const rank=w=>w.level==='A2+'?0:w.level==='B1'?1:w.level==='B2'?3:2;
  return rank(a)-rank(b)||(Number(a.created)||0)-(Number(b.created)||0);
 });
};
function addA2B1(){
 const records=A2B1_CARDS.map(w=>({...w,source:'starter:a2-b1',created:Date.now()}));
 const r=mergeWords(records);toast(`Додано ${r.added} базових фраз без дублікатів`);renderLesson();
 return r;
}
function quickButton(label,fn,style='btn'){return BTN(label,fn,style)}
function l16Store(){persistLesson()}
startLesson=function(n){
 if(lessonForToday())return;
 const selected=newCandidates().slice(0,Math.max(1,Math.min(10,n)));
 if(!selected.length){toast('Додай нові картки з перекладом');return;}
 lessonState={day:dateKey(),ids:selected.map(w=>w.id),stage:'learn',index:0,revealed:false,checked:false,practiceResults:{},testResults:{},firstTestResults:{},retryIds:[],usedRetries:false};
 dueView=false;l16Store();drawReview();
};
function l16Complete(){
 const s=lessonState;if(!s||s.finalized)return;
 const now=Date.now();s.finalized=true;
 for(const id of s.ids){
  const w=words.find(x=>x.id===id);if(!w)continue;
  const passed=!!s.testResults[id],trouble=s.firstTestResults[id]===false||s.practiceResults[id]===false;
  const interval=passed?(trouble?0.25:1):10/1440;
  w.srs={step:passed?1:0,streak:passed?1:0,interval,due:now+interval*DAY,last:now,ease:passed?(trouble?2.1:2.4):2.0,reps:1,lapses:passed?0:1};
 }
 const prev=taughtToday();putLS(LEVEL16_KEY,{day:dateKey(),completed:(prev.day===dateKey()?Number(prev.completed)||0:0)+s.ids.length});
 saveWords();l16Store();
}
nextStage=function(){
 const s=lessonState;if(!s)return;
 s.index++;s.revealed=false;s.checked=false;s.currentInput='';
 const total=(s.stage==='retry'?s.retryIds.length:s.ids.length);
 if(s.index>=total){
  s.index=0;
  if(s.stage==='learn')s.stage='practice';
  else if(s.stage==='practice')s.stage='test';
  else if(s.stage==='test'){
   s.firstTestResults={...s.testResults};
   s.retryIds=s.ids.filter(id=>!s.testResults[id]);
   s.stage=s.retryIds.length?'retry':'done';
  }else if(s.stage==='retry')s.stage='done';
  if(s.stage==='done')l16Complete();
 }
 l16Store();renderLesson();
};
function l16PageTitle(s){return s.stage==='learn'?'1 · Знайомство':s.stage==='practice'?'2 · Тренування':s.stage==='test'?'3 · Мінітест':'4 · Ще раз складне'}
function l16CurrentCards(s){return (s.stage==='retry'?s.retryIds:s.ids).map(id=>words.find(w=>w.id===id)).filter(Boolean)}
function l16Check(s,w){
 const value=clean(s.currentInput||'');if(!value){toast('Спочатку напиши відповідь');return}
 s.checked=true;const passed=compareAnswer(value,w.text);
 if(s.stage==='practice')s.practiceResults[w.id]=passed;
 else s.testResults[w.id]=passed;
 trackPractice(passed,s.stage==='practice'?'practice':s.stage==='retry'?'retry':'test');l16Store();renderLesson();
}
function l16AcceptOwn(s,w){
 if(s.stage==='practice')s.practiceResults[w.id]=true;else s.testResults[w.id]=true;
 const history=statsLog(); if(history.length&&history[history.length-1].type!=='self-checked')history.pop(); history.push({at:Date.now(),correct:true,type:'self-checked'}); putLS(K.practiceLog,history.slice(-500));drawWordStats();l16Store();renderLesson();
}
renderLesson=function(){
 const area=$('lessonFlow');area.replaceChildren();
 const s=lessonForToday(),due=availableReview().length;
 show('oldReviewBox',dueView);
 if(dueView){
  const top=node('div','row between wrap');top.append(node('strong','','Повторити знайомі фрази'),quickButton('← До заняття',()=>{dueView=false;renderLesson()},'btn alt small'));area.append(top);
  originalDrawReview();const target=words.find(w=>w.id===currentReviewId);
  const buttons=$('reviewBox').querySelector('.studycontrols');if(target&&buttons)buttons.prepend(quickButton('🔊 Слухати',()=>speakEnglish(target.text),'btn alt small'));
  return;
 }
 if(!s){
  const count=newCandidates().length;
  const box=node('div','box focus-start');
  box.append(node('div','kicker','Твій рівень · A2+ → B1'),node('h2','focus-heading','Сьогодні — короткий урок'));
  box.append(node('p','smallhint','5 нових фраз → ці ж фрази у вправах → короткий тест. Якщо складно, повторимо ще раз.'));
  const actions=node('div','lesson-actions');
  if(due){const dueBtn=quickButton(`Спочатку повторити · ${due}`,launchDue,'btn');actions.append(dueBtn)}
  if(count){
   const line=node('div','row between wrap mini-settings');const label=node('span','smallhint','Нових карток:');const select=node('select','input slim');
   select.setAttribute('aria-label','Карток у занятті');for(const n of [3,5,7,10])select.add(new Option(String(n),String(n)));
   select.value=String([3,5,7,10].includes(reviewPrefs.daily)?reviewPrefs.daily:5);
   select.onchange=()=>{reviewPrefs.daily=Number(select.value);$('dailyLimit').value=select.value;putLS(K.reviewConfig,reviewPrefs)};
   line.append(label,select);box.append(line);
   actions.append(quickButton(`Вивчити ${Math.min(count,Number(select.value))} фраз →`,()=>startLesson(Number(select.value)),due?'btn alt':'btn'));
   select.onchange=()=>{reviewPrefs.daily=Number(select.value);$('dailyLimit').value=select.value;putLS(K.reviewConfig,reviewPrefs);actions.lastElementChild.textContent=`Вивчити ${Math.min(count,Number(select.value))} фраз →`};
  }else{
   box.append(node('p','smallhint','Нових фраз поки немає. Можна додати добірку повсякденної англійської або фразу з книги.'));
  }
  if(!words.length||!count)actions.append(quickButton('＋ 32 практичні фрази A2+–B1',addA2B1,'btn alt'));
  box.append(actions);area.append(box);
  if(count&&!newCandidates().some(w=>w.level==='A2+'||w.level==='B1')){
   area.append(quickButton('Додати базову добірку A2+–B1',addA2B1,'btn ghost small'));
  }
  return;
 }
 if(s.stage==='done'){
  const cards=lessonCards(),passed=s.ids.filter(id=>s.testResults[id]).length;
  const box=node('div','box');box.append(node('div','kicker','На сьогодні — готово'),node('div','studytitle',`${passed} із ${s.ids.length} фраз`));
  box.append(node('p','smallhint','Ці фрази вже у SRS. Ті, що далися важко, повернуться раніше. Наступного разу спробуй пригадати їх без перекладу.'));
  const sample=cards[Math.floor(Date.now()/DAY)%Math.max(1,cards.length)];
  if(sample){const practice=node('div','level16-reuse');practice.append(node('strong','','Спробуй сказати вголос своє речення:'),node('div','wordtext',sample.text));
   if(sample.example)practice.append(node('p','smallhint','Приклад: '+sample.example));practice.append(quickButton('🔊 Послухати вимову',()=>speakEnglish(sample.text),'btn alt small'));box.append(practice)}
  const actions=node('div','lesson-actions');if(due)actions.append(quickButton(`Повторити · ${due}`,launchDue));
  actions.append(quickButton('Мої картки',()=>chooseWordTab('list'),'btn alt'));box.append(actions);area.append(box);return;
 }
 const batch=l16CurrentCards(s);if(!batch.length){lessonState=null;l16Store();renderLesson();return}
 let item=batch[s.index]||batch[0];
 const hdr=node('div','lesson-badge');hdr.append(node('strong','',l16PageTitle(s)),node('span','lesson-sub',`${s.index+1} / ${batch.length}`));area.append(hdr);
 const progress=node('div','lesson-progress');const fill=node('div');fill.style.width=`${(s.index+1)/batch.length*100}%`;progress.append(fill);area.append(progress);
 const card=node('div','studycard');const actions=node('div','lesson-actions');
 if(s.stage==='learn'){
  card.append(node('div','smallhint','Подумай, що означає фраза'),node('div','studytitle',item.text));
  actions.append(quickButton('🔊 Слухати',()=>speakEnglish(item.text),'btn alt small'));
  if(!s.revealed){actions.append(quickButton('Показати значення',()=>{s.revealed=true;l16Store();renderLesson()}));}
  else{
   card.append(node('div','answer',item.meaning));if(item.example)card.append(node('div','studyexample',item.example));
   if(item.example)actions.append(quickButton('🔊 Приклад',()=>speakEnglish(item.example),'btn alt small'));
   actions.append(quickButton('Далі →',nextStage));
  }
 }else{
  const cloze=s.stage==='practice'?sampleCloze(item):null;
  card.append(node('div','smallhint',s.stage==='practice'?'Пригадай фразу з контексту':s.stage==='retry'?'Спробуй ще раз без підказки':'Напиши англійською без підказки'));
  card.append(node('div','studytitle',cloze||item.meaning));
  if(s.stage==='practice'&&!cloze)card.append(node('p','smallhint','Відтвори фразу англійською.'));
  const field=node('textarea','input lesson-field');field.rows=2;field.placeholder='Напиши фразу англійською…';field.autocapitalize='off';field.spellcheck=false;
  field.value=s.currentInput||'';field.disabled=!!s.checked;field.oninput=()=>{s.currentInput=field.value;l16Store()};card.append(field);
  if(!s.checked){actions.append(quickButton('Перевірити',()=>l16Check(s,item)));}
  else{
   const state=s.stage==='practice'?s.practiceResults:s.testResults,passed=!!state[item.id];
   const note=node('div','lesson-notice');note.append(node('strong','',passed?'✓ Зараховано':'Правильна фраза: '+item.text));
   if(item.example)note.append(node('p','smallhint','У контексті: '+item.example));
   card.append(note);
   actions.append(quickButton('🔊 Слухати',()=>speakEnglish(item.text),'btn alt small'));
   if(!passed){actions.append(quickButton('Моя відповідь теж підходить',()=>l16AcceptOwn(s,item),'btn ghost small'))}
   actions.append(quickButton(s.stage==='retry'&&s.index===batch.length-1?'Завершити ✓':s.index===batch.length-1&&s.stage==='test'?'Далі →':'Далі →',nextStage));
  }
 }
 area.append(card,actions);
};
// A2+ catalog: video-first official material. B2 content is deliberately out of the default route.
