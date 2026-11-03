/* English Pocket 20.3 — skill-specific mistake memory, source-only context variety,
   targeted listening and coherent Canada replay. No AI, no generated examples. */
'use strict';
const EP203={version:'20.3',dayKey:'elp-203-today',daily:null,modeOrder:null};
const ep203Types={recall:'Пригадування',listening:'На слух',usage:'У реченні'};
function ep203Type(kind){
 if(kind==='audio')return 'listening';
 if(kind==='p20-use'||kind==='p20-dialogue'||kind==='dialogue')return 'usage';
 return 'recall';
}
function ep203EmptySkill(){return {attempts:0,correct:0,misses:0,streak:0,correctDays:[],lastWrong:0,lastAt:0,needsWork:false};}
function ep203Skills(w){return w?.ep203Skills&&typeof w.ep203Skills==='object'?w.ep203Skills:{};}
function ep203One(w,type){return {...ep203EmptySkill(),...(ep203Skills(w)[type]||{})};}
function ep203Weak(w,type){const s=ep203One(w,type);return s.needsWork===true||s.misses>0&&s.streak<2;}
function ep203Priority(w,mode='context'){
 const type=mode==='audio'?'listening':mode==='speak'?'usage':'recall';
 const s=ep203One(w,type);let score=ep202Weight(w)+Math.min(56,s.misses*13)+(s.needsWork?45:0);
 // Older, non-weak phrases get occasional maintenance, but not priority over errors.
 const last=Number(ep202State(w).lastShownAt)||0;
 if(last&&Date.now()-last<5*60*1000)score-=35;
 return score;
}
function ep203RecordSkill(w,ok,kind){
 const type=ep203Type(kind),skills={...ep203Skills(w)},s=ep203One(w,type),day=dateKey(),now=Date.now();
 s.attempts++;s.lastAt=now;
 if(ok){
  s.correct++;s.streak++;
  if(!Array.isArray(s.correctDays))s.correctDays=[];
  if(!s.correctDays.includes(day))s.correctDays.push(day);
  s.correctDays=s.correctDays.slice(-12);
  if(s.needsWork&&s.streak>=2&&s.correctDays.length>=2)s.needsWork=false;
 }else{
  s.misses++;s.streak=0;s.correctDays=[];s.lastWrong=now;s.needsWork=true;
 }
 skills[type]=s;w.ep203Skills=skills;
 if(kind==='context'){
  const options=ep203Contexts(w);
  if(options.length>1)w.ep203ContextIndex=((Number(w.ep203ContextIndex)||0)+1)%options.length;
 }
 const daily=ep203Day(),hard=ep202Hard(w)||s.needsWork||s.misses>0;
 daily.events.push({id:w.id,t:now,day,type,kind,ok:!!ok,weak:hard});
 daily.events=daily.events.slice(-160);putLS(EP203.dayKey,daily);
 saveWords();ep203RenderSummary();
}
function ep203Day(){
 const key=dateKey();if(!EP203.daily||EP203.daily.day!==key){const stored=parseLS(EP203.dayKey,null);EP203.daily=stored?.day===key&&Array.isArray(stored.events)?stored:{day:key,events:[]};}
 return EP203.daily;
}
// Wrap the one canonical outcome logger; don't count the same exercise twice.
const ep203PriorRecord=ep202Record;
ep202Record=function(w,ok,kind){
 if(!w)return ep203PriorRecord(w,ok,kind);
 const permitted=ep181Studied(w)||['lesson-practice','lesson-test','lesson-retry'].includes(kind);
 ep203PriorRecord(w,ok,kind);
 if(permitted)ep203RecordSkill(w,!!ok,kind);
};
// Prefer the most vulnerable of the existing, studied words while retaining rotation.
EP202.sessionKey='elp-203-practice-batch';EP202.session=null;
ep202NewBatch=function(){
 const pool=ep202Pool(),size=Math.min(EP202.batchSize,pool.length);
 const priority=(a,b)=>ep203Priority(b)-ep203Priority(a)||(Number(ep202State(a).lastShownAt)||0)-(Number(ep202State(b).lastShownAt)||0);
 const hard=pool.filter(w=>ep202Hard(w)||Object.keys(ep203Skills(w)).some(k=>ep203Weak(w,k))).sort(priority);
 const regular=pool.filter(w=>!hard.includes(w)).sort(priority);
 const hardQuota=Math.min(hard.length,Math.ceil(size*.8));let chosen=hard.slice(0,hardQuota);
 for(const w of [...regular,...hard.slice(hardQuota)]){if(chosen.length>=size)break;chosen.push(w)}
 for(const w of hard){if(chosen.length>=size)break;if(!chosen.includes(w))chosen.push(w)}
 const now=Date.now();for(const w of chosen)w.ep202Focus={...ep202State(w),lastShownAt:now};
 if(chosen.length)putLS(K.words,words);
 return chosen.map(w=>w.id);
};
// Context 2.0 never fabricates text: only the card's own fields may supply an example.
const ep203OriginalContext=ep201Context;
function ep203Contexts(w){
 const sources=[w?.example,w?.context];
 // Notes may contain a personal sentence; non-sentence grammar notes are ignored.
 if(w?.note)for(const line of String(w.note).split(/\n+/)){if(/[.!?]$/.test(line.trim()))sources.push(line.trim())}
 const unique=new Set(),examples=[];
 for(const text of sources){const s=clean(text||'');if(!s||unique.has(s.toLocaleLowerCase()))continue;unique.add(s.toLocaleLowerCase());
  const c=ep203OriginalContext({...w,example:s,context:''});if(c.masked)examples.push(c);
 }
 return examples;
}
ep201Context=function(w){
 const examples=ep203Contexts(w);
 if(!examples.length)return ep203OriginalContext(w);
 const at=Math.abs(Number(w.ep203ContextIndex)||0)%examples.length;
 return examples[at];
};
// A listening exercise should start with the hardest auditory phrases in its stable batch.
const ep203ExistingFocus=ep18FocusWords;
ep18FocusWords=function(){const batch=ep203ExistingFocus();if(EP18.mode!=='audio')return batch;
 const session=EP202.session||{},key=[session.day,session.round,batch.map(w=>w.id).join(',')].join('|');
 if(!EP203.modeOrder||EP203.modeOrder.key!==key){
  const ordered=[...batch].sort((a,b)=>{
   const sa=ep203One(a,'listening'),sb=ep203One(b,'listening');
   return Number(sb.needsWork)-Number(sa.needsWork)||sb.misses-sa.misses;
  });
  EP203.modeOrder={key,ids:ordered.map(w=>w.id)};
 }
 return EP203.modeOrder.ids.map(id=>batch.find(w=>w.id===id)).filter(Boolean);
};
const ep203BaseMode=ep18SetMode;
ep18SetMode=function(mode){ep18Active=0;ep203BaseMode(mode)};
// One small session summary, not another dashboard or main tab.
const ep203Box=document.createElement('div');ep203Box.id='ep203Summary';ep203Box.className='ep203-summary';
$('ep18TrainingDetails').after(ep203Box);
function ep203RenderSummary(){
 const el=ep203Box;if(!el)return;
 const events=ep203Day().events;
 if(!events.length){el.hidden=true;el.replaceChildren();return;}el.hidden=false;
 const successes=events.filter(x=>x.ok).length,weakWon=new Set(events.filter(x=>x.weak&&x.ok).map(x=>x.id)).size;
 const missed=new Set(events.filter(x=>!x.ok).map(x=>x.id)).size;
 const listening=events.filter(x=>x.type==='listening');
 el.replaceChildren();el.append(node('strong','',`Сьогодні: ${successes}/${events.length} правильних`),node('span','',` · ${weakWon} складних фраз пригадано · ${missed} потребують повторення`));
 if(listening.length)el.append(node('span','',` · На слух: ${listening.filter(x=>x.ok).length}/${listening.length}`));
 const misses=events.filter(x=>!x.ok),byType=Object.keys(ep203Types).map(k=>({k,n:misses.filter(x=>x.type===k).length})).sort((a,b)=>b.n-a.n);
 if(byType[0]?.n)el.append(node('div','',`Фокус наступної практики: ${ep203Types[byType[0].k].toLowerCase()}.`));
}
// Per-skill label appears in one compact location, with no additional permanent buttons.
const ep203PriorTrainer=ep18RenderTrainer;
ep18RenderTrainer=function(){ep203PriorTrainer();const card=$('ep18TrainingArea')?.querySelector('.ep18-trainer-card');
 const w=ep18FocusWord();if(!card||!w)return;
 const type=EP18.mode==='audio'?'listening':EP18.mode==='speak'?'usage':'recall';
 const s=ep203One(w,type);
 if(s.misses>0){const tag=node('div','ep203-skill-hint',`${ep203Types[type]} · ${s.needsWork?'Потрібно закріпити':'Повторення'} · помилок: ${s.misses}`);card.prepend(tag)}
};
// A focused Canada replay uses ONLY authored dialogue turns, with original partner line
// and reaction. It never matches unrelated vocabulary to generic dialogue prompts.
(function ep203CanadaReplay(){
 const host=$('ep18CanadaDetails')?.querySelector('.ep18-content');if(!host||!window.Pocket20Canada)return;
 const select=$('p20Scene'),body=host.querySelector('.p20-scene-body'),actions=host.querySelector('.p20-scene-state')?.nextElementSibling;
 if(!select||!body||!actions)return;
 const replay=node('div','ep203-replay');replay.hidden=true;body.after(replay);
 const oldRefresh=Pocket20Canada.refresh;
 function weakTurns(){const sc=P20_SCENES.find(s=>s.id===select.value)||P20_SCENES[0];
  return Pocket20Canada.ready(sc).filter(t=>t.card&&(ep202Hard(t.card)||ep203Weak(t.card,'usage')||ep203Weak(t.card,'recall')));
 }
 function attach(){const old=actions.querySelector('#ep203ReplayBtn');
  const turns=weakTurns(),label=`↻ Складні репліки${turns.length?' · '+turns.length:''}`;
  if(!turns.length){old?.remove();replay.hidden=true;replay.replaceChildren();return;}
  if(old&&old.textContent===label)return;old?.remove();
  const btn=BTN(label,()=>startReplay(),'btn alt small');
  btn.id='ep203ReplayBtn';btn.disabled=!turns.length;actions.append(btn);
  if(!turns.length){replay.hidden=true;replay.replaceChildren()}
 }
 function startReplay(){const turns=weakTurns();if(!turns.length)return;
  let index=0;function render(){
   const t=turns[index];replay.hidden=false;replay.replaceChildren();
   if(!t){replay.append(node('strong','','Складні репліки повторено. Повернися до повного діалогу, коли будеш готовий.'));attach();return}
   replay.append(node('p','smallhint',`Складна репліка ${index+1}/${turns.length} · ${ep203Types.usage}`),node('div','p20-partner',t.other));
   replay.append(BTN('🔊 Послухати співрозмовника',()=>speakEnglish(t.other),'btn alt small'));
   replay.append(node('div','p20-ukcue',t.uk));
   const input=node('textarea','input');input.rows=2;input.placeholder='Відповідь англійською…';input.autocapitalize='off';input.spellcheck=false;replay.append(input);
   const feedback=node('div','p20-feedback');replay.append(feedback);
   let closed=false;
   const row=node('div','row wrap');replay.append(row);
   row.append(BTN('Перевірити',()=>{
    if(closed||!clean(input.value))return;
    const actual=p20DialogNorm(input.value),target=p20DialogNorm(t.en),ok=actual===target||(target.length>=4&&(' '+actual+' ').includes(' '+target+' '));
    ep17Recall(t.card,ok,'p20-dialogue');saveWords();
    feedback.replaceChildren(node('strong','',ok?'✓ Потрібну фразу використано':'Потрібну фразу поки не відтворено'));
    if(ok){closed=true;feedback.append(node('div','p20-partner p20-reaction',t.reply),BTN('🔊 Відповідь',()=>speakEnglish(t.reply),'btn alt small'));row.replaceChildren(BTN('Наступна →',()=>{index++;render()},'btn'))}
    else feedback.append(node('p','smallhint','Спробуй ще раз або подивися підказку.'));
   },'btn'));
   row.append(BTN('Підказка',()=>{if(closed)return;feedback.replaceChildren(node('p','smallhint',t.hint||t.uk));},'btn ghost small'));
   row.append(BTN('Зразок',()=>{if(closed)return;closed=true;feedback.replaceChildren(node('div','p20-ukcue',t.en));row.replaceChildren(BTN('Наступна →',()=>{index++;render()},'btn alt small'))},'btn ghost small'));
  }
  render();replay.scrollIntoView({block:'nearest',behavior:'smooth'});
 }
 // Original refresh rebuilds the action row; reattach after every actual refresh.
 Pocket20Canada.refresh=function(){oldRefresh();attach()};
 select.addEventListener('change',()=>{replay.hidden=true;replay.replaceChildren();attach()});
 $('ep18CanadaDetails').addEventListener('toggle',()=>{if($('ep18CanadaDetails').open)attach()});
 const observer=new MutationObserver(()=>{if(weakTurns().length&&!actions.querySelector('#ep203ReplayBtn'))attach()});observer.observe(actions,{childList:true});
 attach();
})();
// Reset must remove old skill categories and stale daily data for the affected cards.
const ep203PriorReset=ep181ResetWords;
ep181ResetWords=function(items){const ids=new Set(items.map(w=>w.id));
 for(const w of items){delete w.ep203Skills;delete w.ep203ContextIndex;}
 const daily=ep203Day();daily.events=daily.events.filter(e=>!ids.has(e.id));putLS(EP203.dayKey,daily);
 ep203PriorReset(items);ep203RenderSummary();
};
// Keep report accurate after returning to the vocabulary tab or reloading.
const ep203PriorChoose=chooseWordTab;
chooseWordTab=function(tab){ep203PriorChoose(tab);if(tab==='review')ep203RenderSummary()};
ep203RenderSummary();
window.EnglishPocket203={skills:ep203Skills,one:ep203One,weak:ep203Weak,priority:ep203Priority,contexts:ep203Contexts,day:ep203Day};
