/* English Pocket 23.1 — stable recall and one fixed reading story.
 * No AI, no generated vocabulary, no changed storage schemas for books or SRS.
 * Load after all previous scripts. */
'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const mk=(tag,cls='',text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
 const button=(label,click,cls='btn alt small')=>{const b=mk('button',cls,label);b.type='button';b.addEventListener('click',click);return b};
 const RECALL_KEY='elp-231-recall-session';
 const STORY_KEY='elp-231-fixed-story-progress';
 let recall=null;
 function studied(){return words.filter(w=>ep181Studied(w)&&clean(w.text)&&clean(w.meaning))}
 function difficult(w){return ep202Hard(w)||ep203Weak(w,'recall')}
 function score(w){const due=Number(w.srs?.due||0);return ep203Priority(w,'context')+(difficult(w)?40:0)+(due&&due<Date.now()?10:0)}
 function pickCards(){
  const pool=studied(),hard=pool.filter(difficult).sort((a,b)=>score(b)-score(a)),regular=pool.filter(w=>!difficult(w)).sort((a,b)=>score(b)-score(a));
  const n=Math.min(6,pool.length),quota=Math.min(hard.length,Math.ceil(n*.75));
  const chosen=hard.slice(0,quota);
  for(const w of [...regular,...hard.slice(quota)]){if(chosen.length>=n)break;chosen.push(w)}
  return chosen.map(w=>w.id);
 }
 function freshSession(){const ids=pickCards();return {day:dateKey(),initial:ids,queue:[...ids],index:0,retry:[],answers:[],finished:false,round:Math.max(1,Number(recall?.round||0)+1)};}
 function session(){
  const available=new Set(studied().map(w=>w.id));
  if(!recall){const old=parseLS(RECALL_KEY,null);if(old&&typeof old==='object'&&Array.isArray(old.initial)&&Array.isArray(old.queue))recall=old;}
  if(!recall||recall.day!==dateKey()||recall.initial.some(id=>!available.has(id))||recall.queue.some(id=>!available.has(id)))recall=freshSession();
  if(recall.index>recall.queue.length||recall.index<0)recall=freshSession();
  putLS(RECALL_KEY,recall);return recall;
 }
 function clearSession(){recall=null;localStorage.removeItem(RECALL_KEY)}
 function chooseCue(w,isRetry){
  const examples=ep203Contexts(w);
  if(!examples.length)return ep201Context(w);
  return examples[(Math.max(0,Number(w.ep203ContextIndex)||0)+(isRetry?1:0))%examples.length];
 }
 function checkAnswer(answer,w,cue){
  const judged=ep21Judge(answer,w,false);
  if(judged==='correct'||judged==='typo'||judged==='empty')return judged;
  return cue?.surface&&ep21Norm(answer)===ep21Norm(cue.surface)?'correct':'wrong';
 }
 function displayRecall(){
  const area=$('ep18TrainingArea');if(!area)return;
  area.replaceChildren();const pool=studied();
  if(!pool.length){area.append(mk('p','smallhint','Спочатку заверши навчання хоча б однієї власної картки. Невивчені фрази сюди не потрапляють.'));return}
  const s=session(),count=s.initial.length,firstResults=s.answers.filter(x=>!x.retry),mistakes=firstResults.filter(x=>!x.ok).length;
  if(s.finished||s.index>=s.queue.length){
   s.finished=true;putLS(RECALL_KEY,s);
   const summary=mk('div','ep231-recall-card');summary.append(mk('strong','','Добірку завершено'),mk('p','smallhint',`Перше пригадування: ${firstResults.length-mistakes}/${firstResults.length} · помилок: ${mistakes}. Складні фрази залишаться у фокусі й повернуться пізніше.`));
   const failures=[...new Set(s.answers.filter(a=>!a.ok).map(a=>a.id))].map(id=>words.find(w=>w.id===id)).filter(Boolean);
   if(failures.length)summary.append(mk('p','ep231-recall-hint','Потребують уваги: '+failures.map(w=>w.text).join(' · ')));
   summary.append(button('Ще одна добірка',()=>{recall=freshSession();putLS(RECALL_KEY,recall);displayRecall()},'btn alt small'));area.append(summary);return;
  }
  const id=s.queue[s.index],w=words.find(x=>x.id===id),isRetry=s.index>=count;
  if(!w||!ep181Studied(w)){clearSession();return displayRecall()}
  const cue=chooseCue(w,isRetry),hasCloze=!!cue?.masked;
  const wrapper=mk('div','ep231-recall-card');
  const top=mk('div','row between wrap');top.append(mk('strong','',isRetry?'Повтор складної фрази':'Пригадування'),mk('span','smallhint',`${s.index+1}/${s.queue.length}`));wrapper.append(top);
  const progress=mk('div','ep231-track');const fill=mk('div','ep231-track-fill');fill.style.width=`${Math.min(100,100*s.index/Math.max(1,s.queue.length))}%`;progress.append(fill);wrapper.append(progress);
  const weak=ep203One(w,'recall');
  if(difficult(w))wrapper.append(mk('p','ep231-recall-hint',`🎯 Складна фраза · попередніх помилок: ${weak.misses||ep202State(w).misses||0}`));
  wrapper.append(mk('p','smallhint',hasCloze?'Доповни речення з прикладу твоєї картки':'Пригадай англійську за українським значенням'));
  if(hasCloze)wrapper.append(mk('div','ep231-context',cue.masked));
  wrapper.append(mk('p','ep231-meaning','🇺🇦 '+w.meaning));
  if(!hasCloze)wrapper.append(mk('p','smallhint','Для цієї картки немає прикладу з потрібною фразою. За потреби додай його в «Мої картки».'));
  const input=mk('input','input');input.placeholder='Напиши англійську фразу';input.autocomplete='off';input.autocapitalize='off';input.spellcheck=false;wrapper.append(input);
  const result=mk('div','ep231-recall-feedback');result.setAttribute('aria-live','polite');wrapper.append(result);
  const actions=mk('div','row wrap ep231-recall-actions');wrapper.append(actions);
  let completed=false;
  function finish(ok,wasShown=false){
   if(completed)return;completed=true;
   s.answers.push({id:w.id,ok,retry:isRetry,day:dateKey(),at:Date.now(),shown:wasShown});
   if(!ok&&!isRetry&&!s.retry.includes(w.id))s.retry.push(w.id);
   // One canonical outcome; records in ep202Focus and ep203Skills are preserved in normal JSON backups.
   ep202Record(w,ok,'context');
   if(typeof ep17Recall==='function')ep17Recall(w,ok,'ep231-recall');
   if(typeof trackPractice==='function')trackPractice(ok,'context');
   input.disabled=true;actions.replaceChildren();
   if(cue?.example)result.append(mk('p','smallhint','Речення повністю: '+cue.example));
   if(!ok)result.prepend(mk('strong','','Правильна фраза: '+(cue?.surface||w.text)));
   else result.prepend(mk('strong','','✓ Правильно'));
   // Commit the cursor immediately: reloading after an answer cannot count it twice.
   s.index++;if(s.index===count&&s.retry.length){s.queue.push(...s.retry)}
   if(s.index>=s.queue.length)s.finished=true;
   putLS(RECALL_KEY,s);
   actions.append(button(s.finished?'Підсумок →':'Далі →',displayRecall,'btn small'));
  }
  actions.append(button('Перевірити',()=>{
   if(completed)return;const judgement=checkAnswer(input.value,w,cue);
   if(judgement==='empty'){result.textContent='Спочатку введи фразу.';return}
   if(judgement==='typo'){result.textContent='Майже правильно: перевір одну літеру й спробуй ще. Помилку поки не записано.';return}
   result.replaceChildren();finish(judgement==='correct');
  },'btn small'));
  actions.append(button('Не пам’ятаю',()=>{result.replaceChildren();finish(false,true)},'btn ghost small'));
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!completed){e.preventDefault();actions.querySelector('.btn.small')?.click()}});
  area.append(wrapper);
 }
 // The other modes (dictation/pronunciation) retain their existing working implementations.
 const previousTrainer=ep18RenderTrainer;
 ep18RenderTrainer=function(){if(EP18.mode==='context')return displayRecall();return previousTrainer()};
 const priorReset=ep181ResetWords;
 ep181ResetWords=function(items){clearSession();return priorReset(items)};
 $('ep18TrainingDetails').querySelector('summary').firstChild.textContent='🎯 Тренування ';
 const contextBtn=document.querySelector('[data-ep18-mode="context"]');if(contextBtn)contextBtn.textContent='✎ Пригадування';
 // No Canada dialogues in Words or Daily Coach; the video catalogue (including Bob) is untouched.
 const canada=$('ep18CanadaDetails');if(canada){canada.hidden=true;canada.style.display='none';canada.open=false;canada.setAttribute('aria-hidden','true')}
 const shortCanada=$('ep17Canada');if(shortCanada){shortCanada.hidden=true;shortCanada.style.display='none'}
 const previousCoach=p20RenderCoach;
 p20RenderCoach=function(){previousCoach();$('p20Coach')?.querySelectorAll('.p20-step').forEach(b=>{if(/діалог із життя/i.test(b.textContent))b.remove()})};
 p20RenderCoach();
 // ONE authored story, always the same text. No random story choice or carousel.
 const story=EP21_STORIES[0];
 const QUESTIONS=[
  {q:'Чому спочатку герой хвилювався?',opts:['Не знав нікого в новому районі.','Загубив бібліотечну картку.','Запізнився на автобус.'],correct:0,why:'На початку сказано: I didn’t know anyone.'},
  {q:'Чому герой вирішив часто ходити до бібліотеки?',opts:['Вона була поруч із домом.','Сам працював там.','Вона працювала тільки у вихідні.'],correct:0,why:'Бібліотека була within walking distance.'},
  {q:'Що спільного в героя та Сема?',opts:['Люблять книжки й довгі прогулянки.','Працюють у бібліотеці.','Навчалися в одному класі.'],correct:0,why:'У тексті: we both like books and long walks.'},
  {q:'Чи іноді герой сумує за старим домом?',opts:['Так','Ні'],correct:0,why:'I still miss my old home sometimes.'},
  {q:'Хто показав герою тихе кафе?',opts:['Новий сусід Сем.','Бібліотекар.','Старий друг.'],correct:0,why:'One Saturday, Sam showed me a quiet café.'}
 ];
 function storyProgress(){const s=parseLS(STORY_KEY,{});return s&&typeof s==='object'?s:{}}
 function saveStory(s){putLS(STORY_KEY,{...s,updatedAt:Date.now()})}
 function storyExerciseSurface(target){return ({'come across':'came across','look forward to':'looking forward to'}[ep21Norm(target)]||target)}
 function storySentence(target){const surface=storyExerciseSurface(target),sentences=story.text.match(/[^.!?]+[.!?]+/g)||[];
  const sentence=sentences.find(s=>s.toLowerCase().includes(surface.toLowerCase()));if(!sentence)return null;
  const at=sentence.toLowerCase().indexOf(surface.toLowerCase());return {masked:sentence.slice(0,at).trimStart()+'________'+sentence.slice(at+surface.length),sentence:sentence.trim(),surface};
 }
 ep21StoryReady=function(){return [{...story,known:ep21KnownTargets(story)}]};
 ep21DrawStories=function(){
  ep21Display.replaceChildren();const progress=storyProgress(),known=ep21KnownTargets(story);
  const wrap=mk('div','ep231-story');wrap.append(mk('p','smallhint','Одна постійна історія A2+ → B1 · без автоматичної зміни тексту'),mk('h3','','A New Neighbourhood'),mk('p','ep231-story-text',story.text));
  wrap.append(button('🔊 Прослухати текст',()=>speakEnglish(story.text),'btn alt small'));
  const qSection=mk('details','ep231-story-section');qSection.open=true;qSection.append(mk('summary','','1. Перевір розуміння · 5 запитань'));
  QUESTIONS.forEach((q,i)=>{
   const entry=mk('div','ep231-story-question');entry.append(mk('strong','',`${i+1}. ${q.q}`));
   const sel=mk('select','input');sel.setAttribute('aria-label',q.q);sel.add(new Option('Обери відповідь',''));q.opts.forEach((o,j)=>sel.add(new Option(o,String(j))));
   const saved=progress.questions?.[i];if(saved&&Number.isInteger(saved.selected))sel.value=String(saved.selected);
   entry.append(sel);const result=mk('p','smallhint');entry.append(result);
   if(saved){result.textContent=(saved.ok?'✓ Правильно. ':'Не зовсім. ')+q.why;sel.disabled=true}
   else entry.append(button('Перевірити',()=>{if(sel.value==='')return;const selected=Number(sel.value),ok=selected===q.correct;const s=storyProgress();s.questions={...(s.questions||{}),[i]:{selected,ok}};saveStory(s);result.textContent=(ok?'✓ Правильно. ':'Правильна відповідь: '+q.opts[q.correct]+'. ')+q.why;sel.disabled=true;entry.querySelector('button').disabled=true},'btn alt small'));
   qSection.append(entry);
  });wrap.append(qSection);
  const vocab=mk('details','ep231-story-section');vocab.append(mk('summary','','2. Пригадай фрази з історії'));
  const eligible=known.map(target=>({target,card:studied().find(w=>ep21Norm(w.text)===ep21Norm(target))})).filter(x=>x.card).slice(0,4);
  if(!eligible.length)vocab.append(mk('p','smallhint','Спочатку вивчи хоча б одну фразу з тексту. До вправ потрапляють лише пройдені картки. Саму історію можна читати вже зараз.'));
  eligible.forEach(({target,card})=>{
   const cue=storySentence(target);if(!cue)return;const item=mk('div','ep231-story-question');item.append(mk('p','ep231-context',cue.masked),mk('p','smallhint','🇺🇦 '+card.meaning));
   const input=mk('input','input');input.placeholder='Пригадай фразу';input.autocomplete='off';input.autocapitalize='off';input.spellcheck=false;
   const status=mk('p','smallhint');const previously=progress.phrases?.[card.id];
   if(previously){input.value=previously.answer||'';input.disabled=true;status.textContent=(previously.ok?'✓ Правильно. ':'Зразок: '+cue.surface+'. ')+'Контекст: '+cue.sentence}
   item.append(input,status);
   if(!previously)item.append(button('Перевірити',()=>{
    const val=input.value.trim();if(!val)return;const r=ep21Judge(val,card,false),ok=r==='correct'||ep21Norm(val)===ep21Norm(cue.surface);
    if(r==='typo'){status.textContent='Перевір одну літеру й спробуй ще.';return}
    ep202Record(card,ok,'context');if(typeof ep17Recall==='function')ep17Recall(card,ok,'ep231-story');
    const s=storyProgress();s.phrases={...(s.phrases||{}),[card.id]:{answer:val,ok}};saveStory(s);status.textContent=(ok?'✓ Правильно. ':'Зразок: '+cue.surface+'. ')+'Контекст: '+cue.sentence;input.disabled=true;item.querySelector('button').disabled=true;
   },'btn alt small'));
   vocab.append(item);
  });wrap.append(vocab);
  const writing=mk('details','ep231-story-section');writing.append(mk('summary','','3. Переказ і власна думка'));
  writing.append(mk('p','smallhint','Напиши 2–3 речення англійською: куди переїхав герой, кого зустрів і що планує далі.'));
  const summary=mk('textarea','input');summary.rows=3;summary.placeholder='The narrator moved to...';summary.value=progress.summary||'';writing.append(summary);
  writing.append(mk('p','smallhint','А тепер про себе: яке цікаве місце ти знайшов біля дому?'));
  const opinion=mk('textarea','input');opinion.rows=2;opinion.placeholder='I once came across...';opinion.value=progress.opinion||'';writing.append(opinion);
  const model=mk('p','ep231-model');model.hidden=true;model.textContent='Зразок переказу: The narrator moved to a new neighbourhood and found a library near home. They met Sam, who liked books and walks. Now the narrator is looking forward to exploring more places.';
  writing.append(button('Зберегти відповіді',()=>{const s=storyProgress();s.summary=summary.value.trim();s.opinion=opinion.value.trim();saveStory(s);toast('Переказ збережено')},'btn alt small'),button('Показати зразок',()=>{model.hidden=!model.hidden},'btn ghost small'),model);
  wrap.append(writing);
  wrap.append(button('↻ Повторити завдання до цього тексту',()=>{if(!confirm('Очистити відповіді до історії? Сам текст і твій словник залишаться.'))return;const s=storyProgress();delete s.questions;delete s.phrases;saveStory(s);ep21DrawStories()},'btn ghost small'));
  ep21Display.append(wrap);
 };
 if(window.EnglishPocket21)window.EnglishPocket21.stories=ep21StoryReady;
 window.EnglishPocket231={version:'23.1',select:pickCards,studied,session,reset:clearSession,story:()=>story,storyProgress};
 const footer=document.querySelector('.app > footer.footnote');if(footer)footer.textContent=footer.textContent.replace('23.0','23.1');
})();
