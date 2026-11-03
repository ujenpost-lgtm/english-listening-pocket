/* English Pocket 20.2 — focused, source-only vocabulary practice.
   All progress is stored on the existing word records and included in full JSON backups.
   No generated vocabulary, remote model, or new required app permissions. */
'use strict';
const EP202={batchSize:6,sessionKey:'elp-202-practice-batch',version:'20.2',session:null};
const ep202Min=24*60*60*1000;
const ep202Stamp=()=>Date.now();
const ep202History=w=>Array.isArray(w?.recallHistory)?w.recallHistory:[];
function ep202LegacyWeak(w){
 const log=ep202History(w),lastFail=log.map((x,i)=>!x.ok?i:-1).filter(i=>i>=0).at(-1);
 // Two successes on distinct days since the last recorded mistake recover an old card.
 const recovered=lastFail===undefined?false:new Set(log.slice(lastFail+1).filter(x=>x.ok).map(x=>x.day)).size>=2;
 const fromLog=lastFail!==undefined&&!recovered;
 const oldWrong=Math.max(0,Number(w?.ep18Train?.wrong)||0);
 const oldGood=Math.max(0,Number(w?.ep18Train?.correct)||0);
 const lapses=Math.max(0,Number(w?.srs?.lapses)||0);
 return fromLog||(oldWrong>0&&oldGood<oldWrong*2)||(lapses>0&&!log.length);
}
function ep202State(w){
 const d=w?.ep202Focus;
 if(d&&typeof d==='object')return d;
 const legacyFails=Math.max(Number(w?.ep18Train?.wrong)||0,Number(w?.srs?.lapses)||0,ep202History(w).filter(x=>!x.ok).length);
 return {attempts:0,misses:0,correct:0,streak:0,needsWork:ep202LegacyWeak(w),days:[],lastAt:0,lastWrongAt:0,lastShownAt:0,legacyFails};
}
function ep202Hard(w){return ep202State(w).needsWork===true}
function ep202Weight(w){
 const d=ep202State(w),due=Number(w?.srs?.due)||0;
 const overdue=due>0&&due<=ep202Stamp()?2:0;
 const missed=Number(d.misses||0)+Number(d.legacyFails||0);
 return (d.needsWork?100:0)+Math.min(18,missed*3)+overdue+(d.lastWrongAt&&ep202Stamp()-d.lastWrongAt<7*ep202Min?8:0);
}
function ep202Record(w,ok,kind){
 if(!w||!ep181Studied(w)&&!['lesson-practice','lesson-test','lesson-retry'].includes(kind))return;
 const previous=ep202State(w),d={...previous};const now=ep202Stamp(),day=dateKey();
 d.attempts=Math.max(0,Number(d.attempts)||0)+1;
 d.lastAt=now;d.lastKind=kind;
 if(ok){
  d.correct=Math.max(0,Number(d.correct)||0)+1;
  d.streak=Math.max(0,Number(d.streak)||0)+1;
  d.days=Array.isArray(d.days)?d.days.filter(x=>typeof x==='string').slice(-8):[];
  if(!d.days.includes(day))d.days.push(day);
  // Recovering a difficult phrase needs successful retrieval on at least two days.
  if(d.needsWork&&d.streak>=2&&d.days.length>=2)d.needsWork=false;
 }else{
  d.misses=Math.max(0,Number(d.misses)||0)+1;
  d.streak=0;d.days=[];d.needsWork=true;d.lastWrongAt=now;
  // A mistake is not just a statistic: it advances the next SRS review when studied.
  if(w.srs){const soon=now+(kind==='srs'?10*60*1000:12*60*60*1000);w.srs.due=Math.min(Number(w.srs.due)||Infinity,soon)}
 }
 w.ep202Focus=d;saveWords();
}
function ep202Pool(){return ep181StudiedCards().filter(w=>clean(w.text)&&clean(w.meaning))}
function ep202Order(a,b){
 const ad=ep202State(a),bd=ep202State(b);
 // Prefer neglected items at the same difficulty, but never mix in unstudied cards.
 return (Number(ad.lastShownAt)||0)-(Number(bd.lastShownAt)||0) || ep202Weight(b)-ep202Weight(a) || (Number(a.created)||0)-(Number(b.created)||0);
}
function ep202NewBatch(){
 const pool=ep202Pool(),hard=pool.filter(ep202Hard).sort(ep202Order),steady=pool.filter(w=>!ep202Hard(w)).sort(ep202Order);
 const size=Math.min(EP202.batchSize,pool.length),maxHard=Math.min(hard.length,Math.max(1,Math.ceil(size*.8)));
 // Four/five difficult phrases per six cards when enough difficult material exists.
 const chosen=[...hard.slice(0,maxHard)];
 for(const w of [...steady,...hard.slice(maxHard)]){if(chosen.length>=size)break;chosen.push(w)}
 // If every card is hard, use all available slots, not only the 80% reservation.
 for(const w of hard){if(chosen.length>=size)break;if(!chosen.some(x=>x.id===w.id))chosen.push(w)}
 const now=ep202Stamp();for(const w of chosen){w.ep202Focus={...ep202State(w),lastShownAt:now}}
 if(chosen.length)putLS(K.words,words);
 return chosen.map(w=>w.id);
}
function ep202Batch(){
 const available=new Set(ep202Pool().map(w=>w.id));
 if(!available.size){EP202.session=null;localStorage.removeItem(EP202.sessionKey);return []}
 if(!EP202.session){const stored=parseLS(EP202.sessionKey,null);
  if(stored&&stored.day===dateKey()&&Array.isArray(stored.ids)&&stored.ids.some(id=>available.has(id)))EP202.session=stored;
 }
 if(!EP202.session||EP202.session.day!==dateKey()||EP202.session.ids.some(id=>!available.has(id))){
  EP202.session={day:dateKey(),ids:ep202NewBatch(),round:(Number(EP202.session?.round)||0)+1};
  putLS(EP202.sessionKey,EP202.session);ep18Active=0;
 }
 return EP202.session.ids.map(id=>words.find(w=>w.id===id)).filter(w=>w&&available.has(w.id));
}
function ep202AdvanceBatch(){
 EP202.session={day:dateKey(),ids:ep202NewBatch(),round:(Number(EP202.session?.round)||0)+1};
 putLS(EP202.sessionKey,EP202.session);ep18Active=0;
}
// Every supplementary exercise and audio session uses this same consistent selection.
ep18FocusWords=ep202Batch;
const ep202OldNext=ep18Next;
ep18Next=function(){const old=ep202Batch();if(!old.length){ep18RenderTrainer();return}
 if(ep18Active+1>=old.length){ep202AdvanceBatch();ep18SoundHidden=false;ep18RenderTrainer();ep18UpdateFocus()}
 else ep202OldNext();
};
// Due SRS cards retain their due-date eligibility; difficult due cards are first.
const ep202OldDue=availableReview;
availableReview=function(){return ep202OldDue().sort((a,b)=>Number(ep202Hard(b))-Number(ep202Hard(a)) || ep202Weight(b)-ep202Weight(a) || (Number(a.srs?.due)||0)-(Number(b.srs?.due)||0))};
// Capture the original lesson check result, including inflected context answers (20.1).
const ep202OldLessonCheck=l16Check;
l16Check=function(s,w){
 const before=s.checked,stage=s.stage;ep202OldLessonCheck(s,w);
 if(!before&&s.checked&&w&&['practice','test','retry'].includes(stage)){
  const ok=stage==='practice'?s.practiceResults[w.id]===true:s.testResults[w.id]===true;
  ep202Record(w,ok,'lesson-'+stage);
 }
};
// Supplementary context and dictation: actual right/wrong result, not just time spent.
const ep202OldTrainUpdate=ep18TrainUpdate;
ep18TrainUpdate=function(w,ok,type){ep202OldTrainUpdate(w,ok,type);ep202Record(w,!!ok,type)};
// SRS grading, own-sentence self-assessment and scenario outcomes.
const ep202OldRecall=ep17Recall;
ep17Recall=function(w,ok,kind){ep202OldRecall(w,ok,kind);
 if(['srs','p20-use','p20-dialogue','dialogue'].includes(kind))ep202Record(w,!!ok,kind);
};
// A deliberate reset must also reset focus records and invalidate the current selection.
const ep202OldReset=ep181ResetWords;
ep181ResetWords=function(items){for(const w of items)delete w.ep202Focus;
 EP202.session=null;localStorage.removeItem(EP202.sessionKey);ep202OldReset(items)
};
const ep202OldComplete=l16Complete;
l16Complete=function(){EP202.session=null;localStorage.removeItem(EP202.sessionKey);ep202OldComplete()};
// Nonintrusive hint: explain why today's exercises select these phrases.
ep18UpdateFocus=function(){
 const label=$('ep18FocusLabel');if(!label)return;
 const pool=ep202Pool(),hard=pool.filter(ep202Hard).length;
 label.textContent=!pool.length?'Спершу вивчи картки':hard?`${hard} складних у пріоритеті`:`${pool.length} вивчених фраз`;
};
const ep202OldTrainer=ep18RenderTrainer;
ep18RenderTrainer=function(){ep202OldTrainer();const area=$('ep18TrainingArea');if(!area||!ep202Pool().length)return;
 const batch=ep202Batch(),hard=batch.filter(ep202Hard).length;
 const first=area.querySelector('.ep18-trainer-card, .ep201-context-card');
 if(first){const note=node('div','ep202-hint',hard?`🎯 Підібрано ${batch.length} фраз · ${hard} складних у пріоритеті`:`✓ Складних фраз наразі немає · повторюємо вивчене`);
  first.prepend(note)
 }
};
// On resume, restore an existing same-day batch; no new lesson or vocabulary created.
ep18UpdateFocus();
window.EnglishPocket202={pool:ep202Pool,hard:ep202Hard,state:ep202State,weight:ep202Weight,batch:ep202Batch,record:ep202Record,nextBatch:ep202AdvanceBatch};
