/* English Pocket 20.1 — source-accurate lessons and context-recall repair.
   This module intentionally adds NO cards, sentences, examples, or external data.
   Existing user data and SRS history are preserved. */
'use strict';
const EP201={version:'20.1'};
const ep201Source=s=>String(s||'').trim().toLowerCase();
function ep201IsOwnCard(w){
 if(!w||!clean(w.text)||!clean(w.meaning))return false;
 if(w.p201Included===true||w.p201Uploaded===true)return true;
 if(w.p201Included===false)return false;
 const src=ep201Source(w.source);
 // Prepared generic packs and generated Canada scripts are not user-imported cards.
 // They remain in My Cards, and previously studied cards retain all review data.
 return !(/^(starter:|canada:)/.test(src));
}
function ep201NewCandidates(){
 // Preserve the same order in which the user added/imported the cards.
 // No random shuffling, topic substitution, or preferential starter deck.
 return words.filter(w=>ep201IsOwnCard(w)&&!ep181Studied(w));
}
newCandidates=ep201NewCandidates;
// An imported card can contain an untouched SRS placeholder (reps=0, last=0).
// Such a card has NOT been learned: teach it first, do not send it to reviews.
availableReview=function(){const now=Date.now();return words.filter(w=>ep181Studied(w)&&(!Number(w.srs.due)||Number(w.srs.due)<=now)).sort((a,b)=>(Number(a.srs.due)||0)-(Number(b.srs.due)||0))};
const ep201PriorCount=p20Count;
p20Count=function(){return {...ep201PriorCount(),new:ep201NewCandidates().length,due:availableReview().length}};

// Old in-progress lessons may contain cards from the template packs.
// Repair only the draft session, never remove a vocabulary card or SRS record.
function ep201RepairLesson(){
 const s=lessonState;
 if(!s||s.stage==='done'||!Array.isArray(s.ids))return false;
 const ids=s.ids.filter(id=>{const w=words.find(x=>x.id===id);return ep201IsOwnCard(w)&&!ep181Studied(w)});
 if(ids.length===s.ids.length)return false;
 if(!ids.length)lessonState=null;
 else lessonState={...s,ids,day:dateKey(),stage:'learn',index:0,revealed:false,checked:false,currentInput:'',practiceResults:{},testResults:{},firstTestResults:{},retryIds:[],usedRetries:false,finalized:false};
 persistLesson();
 return true;
}

const EP201_IRREGULAR={came:'come',comes:'come',coming:'come',got:'get',getting:'get',went:'go',gone:'go',ran:'run',running:'run',made:'make',took:'take',taken:'take',gave:'give',given:'give',brought:'bring',bought:'buy',thought:'think',found:'find',felt:'feel',kept:'keep',paid:'pay',left:'leave',said:'say',told:'tell',saw:'see',seen:'see',ate:'eat',eaten:'eat',wrote:'write',written:'write',knew:'know',known:'know',was:'be',were:'be',is:'be',are:'be',am:'be',did:'do',does:'do',had:'have',has:'have',been:'be'};
function ep201Lemma(t){
 const s=String(t).toLowerCase().replace(/[’]/g,"'");
 if(EP201_IRREGULAR[s])return EP201_IRREGULAR[s];
 if(s.endsWith('ies')&&s.length>4)return s.slice(0,-3)+'y';
 if(s.endsWith('ing')&&s.length>5){let x=s.slice(0,-3);if(x.length>2&&x.at(-1)===x.at(-2))x=x.slice(0,-1);return x}
 if(s.endsWith('ied')&&s.length>4)return s.slice(0,-3)+'y';
 if(s.endsWith('ed')&&s.length>4){let x=s.slice(0,-2);if(x.length>2&&x.at(-1)===x.at(-2))x=x.slice(0,-1);return x}
 if(s.endsWith('es')&&s.length>4)return s.slice(0,-2);
 if(s.endsWith('s')&&s.length>3&&!s.endsWith('ss'))return s.slice(0,-1);
 return s;
}
function ep201FormsMatch(a,b){
 if(a===b)return true;
 const x=ep201Lemma(a),y=ep201Lemma(b);
 if(x===y)return true;
 // 'look' / 'looking', 'move' / 'moving', 'use' / 'used'.
 return (x+'e'===y||y+'e'===x)&&Math.min(x.length,y.length)>=3;
}
function ep201Context(w){
 const example=clean(w?.example||w?.context||'');const target=clean(w?.text||'');
 if(!example||!target)return {example,masked:'',surface:''};
 let i=example.toLowerCase().indexOf(target.toLowerCase());
 if(i>=0){const before=example[i-1]||' ',after=example[i+target.length]||' ';
  if(!/[\p{L}\p{N}]/u.test(before)&&!/[\p{L}\p{N}]/u.test(after))return {example,masked:example.slice(0,i)+'________'+example.slice(i+target.length),surface:example.slice(i,i+target.length)};}
 const tokens=s=>[...s.matchAll(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)].map(x=>({text:x[0],at:x.index,end:x.index+x[0].length}));
 const all=tokens(example),q=tokens(target);
 if(!q.length||q.length>all.length)return {example,masked:'',surface:''};
 for(let j=0;j<=all.length-q.length;j++){
  if(q.every((t,k)=>ep201FormsMatch(t.text.toLowerCase(),all[j+k].text.toLowerCase()))){
   const start=all[j].at,end=all[j+q.length-1].end;
   return {example,masked:example.slice(0,start)+'________'+example.slice(end),surface:example.slice(start,end)};
  }
 }
 return {example,masked:'',surface:''};
}
// The lesson's cloze and the supplementary Context practice use the same source text.
sampleCloze=w=>ep201Context(w).masked||null;
// Accept the cited inflected form in the context stage; tests still assess the card's canonical phrase.
const ep201OldCheck=l16Check;
l16Check=function(s,w){
 const found=ep201Context(w);
 if(s.stage==='practice'&&clean(s.currentInput||'')&&found.surface&&compareAnswer(s.currentInput,found.surface)){
  s.checked=true;s.practiceResults[w.id]=true;trackPractice(true,'practice');l16Store();renderLesson();return;
 }
 ep201OldCheck(s,w);
};

const ep201OldRender=renderLesson;
renderLesson=function(){
 const repaired=ep201RepairLesson();
 ep201OldRender();
 const s=lessonForToday(),area=$('lessonFlow');
 if(repaired)toast('Прибрано шаблонні фрази з незавершеного уроку. Картки не видалено.');
 // Remove the inaccurate instruction to learn generic A2 packs before uploaded vocabulary.
 area.querySelectorAll('.ep18-tip').forEach(x=>x.remove());
 if(!s){
  const box=area.querySelector('.focus-start');
  if(box){
   const extra=node('p','smallhint ep201-source-note','Нові картки беруться тільки з твого словника, у порядку додавання. Шаблонні добірки й автоматично підготовлені репліки не змішуються з ними.');
   box.append(extra);
   for(const p of box.querySelectorAll('p.smallhint'))if(p!==extra&&p.textContent.includes('додати добірку повсякденної англійської'))p.textContent='Нові картки можна імпортувати через налаштування або додати з книги.';
  }
  // Don't invite generic cards that the user did not request in this lesson.
  for(const b of area.querySelectorAll('button'))if(/32 практичні|базову добірку/i.test(b.textContent))b.remove();
  return;
 }
 if(s.stage==='practice'&&!dueView){
  const item=l16CurrentCards(s)[s.index],card=area.querySelector('.studycard');
  if(item&&card){
   const cue=ep201Context(item),anchor=card.querySelector('.studytitle');
   if(anchor){
    if(cue.masked){anchor.textContent=cue.masked;
     const meaning=node('p','ep201-translation','Значення: '+item.meaning);
     anchor.after(meaning);
    }else{
     anchor.textContent=item.meaning;
     const note=node('p','smallhint ep201-no-context',cue.example?'У прикладі не вдалося приховати саме цю форму фрази. Пригадай словникову форму за значенням.':'Для цієї картки ще немає речення-контексту. Пригадай фразу за перекладом.');
     anchor.after(note);
    }
   }
  }
 }
};

// Extra practice: a direct, explicit clue from an ALREADY STUDIED card.
// If no safe cloze can be made, display its Ukrainian meaning instead of a blank exercise.
const ep201OldTrainer=ep18RenderTrainer;
ep18RenderTrainer=function(){
 if(EP18.mode!=='context')return ep201OldTrainer();
 const area=$('ep18TrainingArea');if(!area)return;
 area.replaceChildren();
 const set=ep18FocusWords().filter(ep181Studied);
 if(!set.length){area.append(node('p','smallhint','Спочатку заверши навчання своїх карток. Після цього вони з’являться тут.'));return}
 ep18Active=Math.min(ep18Active,set.length-1);
 const w=set[ep18Active],context=ep201Context(w);
 const top=node('div','row between wrap');top.append(node('span','smallhint',`Тренування · ${ep18Active+1}/${set.length}`),BTN('Інша фраза →',ep18Next,'btn alt small'));
 const box=node('div','ep18-trainer-card ep201-context-card');
 box.append(node('p','smallhint',context.masked?'Згадай фразу з речення своєї картки':'Згадай англійську фразу за значенням'));
 if(context.masked)box.append(node('div','ep18-cue ep201-context-text',context.masked));
 box.append(node('div','ep201-translation','🇺🇦 '+w.meaning));
 if(!context.masked)box.append(node('p','smallhint',context.example?'Приклад із картки покажемо після відповіді, щоб не підказувати готову фразу.':'У картці немає прикладу. Його можна додати через «Мої картки».'));
 const input=node('input','input');input.placeholder='Напиши фразу англійською…';input.autocapitalize='off';input.autocomplete='off';input.spellcheck=false;
 const feedback=node('div','ep18-feedback');const check=BTN('Перевірити',()=>{
  if(!clean(input.value))return toast('Спочатку напиши англійську фразу');
  const ok=compareAnswer(input.value,w.text)||(!!context.surface&&compareAnswer(input.value,context.surface));
  input.disabled=true;check.disabled=true;
  feedback.replaceChildren();feedback.append(node('strong','',ok?'✓ Правильно':'Правильна фраза: '+w.text));
  if(context.example)feedback.append(node('p','smallhint','Оригінальний контекст: '+context.example));
  ep18TrainUpdate(w,ok,'context');
  feedback.append(BTN('Наступна →',ep18Next,'btn alt small'));
 },'btn');
 box.append(input,check,feedback);area.append(top,box);
};

// A card imported from a separate JSON deck is explicitly user-provided even if
// its preserved source field resembles a catalog tag. Never mark whole backup vaults.
const ep201Import=$('backupFile');
if(ep201Import){
 const originalImport=ep201Import.onchange;
 ep201Import.onchange=async function(event){
  const f=event.target.files?.[0];
  // Let the existing validation/import routine own the transaction.
  if(!f)return originalImport?.call(this,event);
  let supplied=[];
  try{const parsed=JSON.parse(await f.text());
   if(Array.isArray(parsed))supplied=parsed;
   else if(!parsed?.local&&!parsed?.app&&Array.isArray(parsed?.cards))supplied=parsed.cards;
   else if(!parsed?.local&&!parsed?.app&&Array.isArray(parsed?.words))supplied=parsed.words;
  }catch{}
  const outcome=await originalImport?.call(this,event);
  if(supplied.length&&$('settingsStatus')?.textContent?.startsWith('Готово:')){
   let touched=0;
   for(const entry of supplied){const w=wordMatch(entry?.text||entry?.en||'');if(w&&!w.p201Uploaded){w.p201Uploaded=true;touched++}}
   if(touched)saveWords();
  }
  return outcome;
 };
}
// Keep the user's personal 80-card deck available by explicit choice; hide the generic 32-card shortcut.
const baseBtn=$('ep181AddBase');if(baseBtn)baseBtn.hidden=true;
// If user explicitly adds a prepared Canada scene, their deliberate choice makes it learnable.
// The scene source retains its category, with no spontaneous card creation.
// Allow user to opt individual excluded cards into their own lessons from the existing editor.
const ep201CardOpen=openCard;
openCard=function(candidate={},id=null){ep201CardOpen(candidate,id);const w=editingId?words.find(x=>x.id===editingId):null;
 let button=$('ep201Include');if(!button){button=BTN('Додати до моїх уроків',()=>{
  const current=words.find(x=>x.id===editingId);if(!current)return;
  current.p201Included=true;saveWords();$('cardDialog').close();toast('Цю картку додано до твоєї навчальної черги');renderLesson();
 },'btn alt small');button.id='ep201Include';$('cardForm').querySelector('.actions')?.prepend(button)}
 button.hidden=!(w&&!ep181Studied(w)&&!ep201IsOwnCard(w));
};
window.EnglishPocket201={isOwn:ep201IsOwnCard,newCards:ep201NewCandidates,context:ep201Context,repair:ep201RepairLesson};
// Late initialization: repair any stale saved lesson and keep the user's cards intact.
ep201RepairLesson();
// Refresh exercises when opened: otherwise the panel can keep its pre-lesson
// empty state even after the user has completed the lesson.
$('ep18TrainingDetails').addEventListener('toggle',()=>{
 if($('ep18TrainingDetails').open){ep18UpdateFocus();ep18RenderTrainer()}
});
const ep201Complete=l16Complete;
l16Complete=function(){ep201Complete();if($('ep18TrainingDetails').open){ep18UpdateFocus();ep18RenderTrainer()}};
const ep201OldDrawWords=drawWords;
drawWords=function(){ep201OldDrawWords();if(wordTab==='review')renderLesson()};
