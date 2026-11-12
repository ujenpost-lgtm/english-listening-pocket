/* English Pocket 21.0 — targeted consolidation. No network/AI; uses only user-studied cards.
 * Nine improvements: Error Clinic, flexible checks, confusable pairs, chapter reviews,
 * evidence-based grammar tips, authored mini-stories, purposeful Canada branches,
 * card quality tools, and weekly consolidation. */
'use strict';
const EP21={version:'21.0',clinic:null,weekly:null,storyId:null,branch:null,qa:null};
const ep21El=(tag,cls='',txt)=>node(tag,cls,txt);
const ep21Studied=()=>words.filter(w=>ep181Studied(w)&&clean(w.text)&&clean(w.meaning));
const ep21Norm=x=>clean(x).normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/\bi'm\b/g,'i am').replace(/\bi'll\b/g,'i will').replace(/\bi'd\b/g,'i would').replace(/\bit's\b/g,'it is').replace(/\bthat's\b/g,'that is').replace(/\bwe're\b/g,'we are').replace(/\byou're\b/g,'you are').replace(/\bdon't\b/g,'do not').replace(/\bdoesn't\b/g,'does not').replace(/[^\p{L}\p{N}' -]+/gu,'').replace(/\s+/g,' ').trim();
function ep21Alternatives(w){const a=w?.ep21Alternatives;return Array.isArray(a)?a.filter(x=>typeof x==='string').map(clean).filter(Boolean).slice(0,12):[]}
function ep21OneEdit(a,b){
 if(a===b)return false;if(Math.abs(a.length-b.length)>1||Math.min(a.length,b.length)<5)return false;
 let i=0,j=0,miss=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue}if(++miss>1)return false;
  if(a.length>b.length)i++;else if(b.length>a.length)j++;else {i++;j++}}
 return miss+(i<a.length?1:0)+(j<b.length?1:0)===1;
}
function ep21Judge(input,w,context=false){
 const x=ep21Norm(input);if(!x)return 'empty';const targets=[w.text,...ep21Alternatives(w)];
 if(context){const surface=ep201Context(w)?.surface;if(surface)targets.push(surface)}
 if(targets.some(t=>ep21Norm(t)===x))return 'correct';
 if(targets.some(t=>ep21OneEdit(x,ep21Norm(t))))return 'typo';
 return 'wrong';
}
// Only recognized grammar errors. No speculative grading of open-ended sentences.
const EP21_GRAMMAR=[
 {id:'look-forward',title:'look forward to + -ing',wrong:/look(?:ing)? forward to (?:see|meet|visit|hear)(?:\b|\s)/i,expected:/look(?:ing)? forward to/i,rule:'Після look forward to ставимо іменник або дієслово із -ing.',bad:'I look forward to see you.',good:'I look forward to seeing you.'},
 {id:'interested',title:'interested in',wrong:/interested (?:on|at|for)\b/i,expected:/interested in\b/i,rule:'Після interested у значенні «зацікавлений» зазвичай уживаємо in.',bad:'I am interested on this job.',good:'I am interested in this job.'},
 {id:'depend-on',title:'depend on',wrong:/depend(?:s|ed|ing)? of\b/i,expected:/depend(?:s|ed|ing)? on\b/i,rule:'Після depend уживаємо прийменник on.',bad:'It depends of the weather.',good:'It depends on the weather.'},
 {id:'listen-to',title:'listen to',wrong:/listen(?:ing|s|ed)? (?:music|the radio|a podcast)\b/i,expected:/listen(?:ing|s|ed)? to\b/i,rule:'Після listen перед об’єктом потрібен to.',bad:'I listen music every day.',good:'I listen to music every day.'},
 {id:'agree',title:'I agree',wrong:/\bi (?:am|was) agree\b/i,expected:/\bi agree\b/i,rule:'Agree — це дієслово. Зазвичай кажемо I agree, не I am agree.',bad:'I am agree with you.',good:'I agree with you.'},
 {id:'vacation',title:'on vacation',wrong:/\b(?:go|went|be|was|am) in vacation\b/i,expected:/\bon vacation\b/i,rule:'В англійській кажемо on vacation або on holiday.',bad:'I was in vacation.',good:'I was on vacation.'}
];
function ep21DetectGrammar(input,expected){return EP21_GRAMMAR.find(r=>r.wrong.test(input)&&(r.expected.test(expected)||r.expected.test(input.replace(r.wrong,''))))||null}
function ep21GrammarRecord(w,rule){if(!w||!rule)return;const old=w.ep21Grammar||{};old[rule.id]={count:(old[rule.id]?.count||0)+1,lastAt:Date.now()};w.ep21Grammar=old;saveWords()}
// Strict checking stays strict; explicit alternatives work in the original lesson.
const ep21PriorLessonCheck=l16Check;
l16Check=function(s,w){
 const answer=clean(s.currentInput||'');if(!answer)return ep21PriorLessonCheck(s,w);
 const judgment=ep21Judge(answer,w,s.stage==='practice');
 if(judgment==='typo'){toast('Майже! Перевір написання та спробуй ще раз — помилку поки не зараховано.');return}
 if(judgment==='wrong'){const rule=ep21DetectGrammar(answer,w.text);if(rule)ep21GrammarRecord(w,rule)}
 if(judgment==='correct'&&!compareAnswer(answer,w.text)){
  const old=s.currentInput;s.currentInput=w.text;ep21PriorLessonCheck(s,w);s.currentInput=old;return;
 }
 ep21PriorLessonCheck(s,w);
};
// Existing supplementary tasks can now recognize explicitly approved alternatives.
const ep21OldE18Match=ep18Match;
ep18Match=function(answer,target){const w=wordMatch(target);return w?ep21Judge(answer,w,false)==='correct':ep21OldE18Match(answer,target)};
// Optional accepted forms in the existing card editor, no extra screen.
const ep21CardVariants=document.createElement('details');ep21CardVariants.className='ep21-card-variants';
const ep21VarTitle=ep21El('summary','','Інші правильні варіанти (необов’язково)');
const ep21VarInput=ep21El('textarea','input');ep21VarInput.id='ep21Variants';ep21VarInput.rows=2;ep21VarInput.placeholder='Один варіант у рядку (до 12)';
ep21CardVariants.append(ep21VarTitle,ep21VarInput);$('cardForm').querySelector('.actions').before(ep21CardVariants);
const ep21PrevOpenCard=openCard;
openCard=function(candidate={},id=null){ep21PrevOpenCard(candidate,id);const w=editingId?words.find(x=>x.id===editingId):null;ep21VarInput.value=ep21Alternatives(w).join('\n');ep21CardVariants.open=false};
$('cardForm').addEventListener('submit',()=>{if($('cardDialog').open)return;const w=wordMatch($('cardText').value);if(!w)return;const extra=ep21VarInput.value.split(/\n+/).map(clean).filter(Boolean).slice(0,12).filter(v=>ep21Norm(v)!==ep21Norm(w.text));w.ep21Alternatives=[...new Set(extra)];saveWords()});
// Targeted micro-practice: one compact expandable panel, no new main navigation.
const ep21Hub=ep21El('details','ep18-details ep21-hub');ep21Hub.id='ep21Hub';
ep21Hub.append(ep21El('summary','','🎯 Закріплення'));
const ep21HubBody=ep21El('div','ep21-hub-body');const ep21Tabs=ep21El('div','ep21-modes');
const ep21Display=ep21El('div','ep21-display');let ep21Mode='clinic';
for(const [key,label] of [['clinic','Складні'],['pairs','Схожі'],['stories','Історії'],['week','Тиждень']]){
 const b=BTN(label,()=>{ep21Mode=key;ep21DrawHub()},'btn alt small');b.dataset.ep21Mode=key;ep21Tabs.append(b);
}ep21HubBody.append(ep21Tabs,ep21Display);ep21Hub.append(ep21HubBody);
$('ep18CanadaDetails').after(ep21Hub);ep21Hub.addEventListener('toggle',()=>{if(ep21Hub.open)ep21DrawHub()});
function ep21DrawHub(){for(const b of ep21Tabs.querySelectorAll('button'))b.classList.toggle('active',b.dataset.ep21Mode===ep21Mode);
 if(ep21Mode==='clinic')ep21DrawClinic();else if(ep21Mode==='pairs')ep21DrawPairs();else if(ep21Mode==='stories')ep21DrawStories();else ep21DrawWeek();}
function ep21WeakScore(w){return (Number(ep202State(w).misses)||0)+Object.values(ep203Skills(w)).reduce((n,s)=>n+(Number(s.misses)||0),0)}
function ep21Plural(n,one,few,many){const m=n%100,k=n%10;return m>=11&&m<=14?many:k===1?one:k>=2&&k<=4?few:many}
function ep21ClinicPool(){return ep21Studied().filter(w=>ep21WeakScore(w)>=3||ep202Hard(w)&&ep21WeakScore(w)>=1).sort((a,b)=>ep21WeakScore(b)-ep21WeakScore(a))}
function ep21DrawClinic(){ep21Display.replaceChildren();const pool=ep21ClinicPool();
 ep21Display.append(ep21El('p','smallhint',pool.length?`У фокусі ${pool.length} ${ep21Plural(pool.length,'фраза','фрази','фраз')}. Спочатку пригадування, потім слухання та контекст.`:'Складних фраз поки немає. Після кількох помилок вони з’являться тут.'));
 if(!pool.length)return;
 const state=EP21.clinic;if(!state||!pool.some(w=>w.id===state.id)){EP21.clinic={id:pool[0].id,stage:0};}
 const selected=EP21.clinic;const w=words.find(x=>x.id===selected.id);if(!w)return;
 const select=ep21El('select','input');select.setAttribute('aria-label','Складна фраза');for(const card of pool.slice(0,25))select.add(new Option(`${card.text} · ${ep21WeakScore(card)} ${ep21Plural(ep21WeakScore(card),'помилка','помилки','помилок')}`,card.id));select.value=w.id;select.onchange=()=>{EP21.clinic={id:select.value,stage:0};ep21DrawClinic()};ep21Display.append(select);
 const step=selected.stage,contexts=ep203Contexts(w),cue=contexts[0];const box=ep21El('div','ep21-exercise');
 box.append(ep21El('span','smallhint',`Крок ${step+1}/3 · ${['Значення','На слух','У контексті'][step]}`));
 if(step===0){box.append(ep21El('p','ep21-prompt',w.meaning));}
 if(step===1){box.append(ep21El('p','smallhint','Послухай і напиши англійську фразу. Текст приховано.'));box.append(BTN('🔊 Прослухати',()=>speakEnglish(w.text),'btn alt small'));}
 if(step===2){if(cue?.masked)box.append(ep21El('p','ep21-prompt',cue.masked));else box.append(ep21El('p','ep21-prompt',w.meaning));}
 const field=ep21El('input','input');field.placeholder='Пригадай фразу англійською';field.autocomplete='off';field.spellcheck=false;field.autocapitalize='off';box.append(field);
 const feedback=ep21El('div','ep21-feedback');box.append(feedback);let submitted=false;
 const submit=BTN('Перевірити',()=>{if(submitted)return;
  const result=ep21Judge(field.value,w,step===2);if(result==='empty')return toast('Введи відповідь');if(result==='typo'){feedback.textContent='Майже! Перевір одну літеру й спробуй ще.';return}
  submitted=true;field.disabled=true;submit.disabled=true;const kind=step===1?'audio':step===2?'context':'recall';ep202Record(w,result==='correct',kind);
  feedback.replaceChildren(ep21El('strong','',result==='correct'?'✓ Правильно':'Зразок: '+w.text));
  if(cue?.example&&step===2)feedback.append(ep21El('p','smallhint',cue.example));
  const rule=ep21DetectGrammar(field.value,w.text);if(result!=='correct'&&rule){ep21GrammarRecord(w,rule);feedback.append(ep21El('p','smallhint',rule.rule))}
  field.disabled=true;
  feedback.append(BTN(step===2?'Завершити ↻':'Далі →',()=>{EP21.clinic={id:w.id,stage:step===2?0:step+1};ep21DrawClinic()},'btn alt small'));
 },'btn');box.append(submit);
 ep21Display.append(box);
}
// Confusable expressions are only eligible if BOTH expressions have been learned.
const EP21_PAIRS=[
 {a:'get along with',b:'put up with',q:'I ___ my new neighbours because they are very friendly.',correct:'get along with',why:'get along with = мати добрі стосунки; put up with = терпіти'},
 {a:'come across',b:'keep up with',q:'I often ___ interesting expressions while reading books.',correct:'come across',why:'come across = випадково натрапити; keep up with = встигати за кимось чи чимось'},
 {a:'look for',b:'look after',q:'I am trying to ___ my missing keys.',correct:'look for',why:'look for = шукати; look after = доглядати'},
 {a:'borrow',b:'lend',q:'Could I ___ your book for a week?',correct:'borrow',why:'borrow = позичати в когось; lend = позичати комусь'},
 {a:'say',b:'tell',q:'Please ___ me the truth.',correct:'tell',why:'tell someone; say something'},
 {a:'used to',b:'be used to',q:'I ___ work late, but now I finish at five.',correct:'used to',why:'used to + дієслово = звичка в минулому; be used to + -ing = бути звиклим'},
 {a:'cut down on',b:'cut back on',q:'I need to ___ sugary drinks.',correct:'cut down on',why:'Обидва означають скорочувати; у цьому реченні природні обидва. Не оцінюємо його як тест на одну відповідь.',ambiguous:true},
 {a:'pick up',b:'drop off',q:'Can you ___ the parcel from the post office?',correct:'pick up',why:'pick up = забрати; drop off = відвезти й залишити'}
];
function ep21EligiblePairs(){const studied=new Set(ep21Studied().map(w=>ep21Norm(w.text)));return EP21_PAIRS.filter(p=>studied.has(ep21Norm(p.a))&&studied.has(ep21Norm(p.b))&&!p.ambiguous)}
function ep21DrawPairs(){ep21Display.replaceChildren();const candidates=ep21EligiblePairs();if(!candidates.length){ep21Display.append(ep21El('p','smallhint','Коли вивчиш обидва схожі вирази, тут з’явиться коротке порівняння. Невивчені фрази не тестуємо.'));return}
 const box=ep21El('div','ep21-exercise');const pair=candidates[(EP21.pairIndex||0)%candidates.length];box.append(ep21El('p','smallhint',`Пара ${(EP21.pairIndex||0)%candidates.length+1}/${candidates.length}`),ep21El('p','ep21-prompt',pair.q));
 const feedback=ep21El('div','ep21-feedback');let chosen=false;for(const text of [pair.a,pair.b])box.append(BTN(text,()=>{if(chosen)return;chosen=true;
  const ok=ep21Norm(text)===ep21Norm(pair.correct);const w=wordMatch(pair.correct);if(w)ep202Record(w,ok,'context');
  feedback.replaceChildren(ep21El('strong','',ok?'✓ Правильно':'Зразок: '+pair.correct),ep21El('p','smallhint',pair.why+(pair.surface?' · У цьому реченні форма минулого часу: '+pair.surface+'.':'')),BTN('Наступна пара →',()=>{EP21.pairIndex=(EP21.pairIndex||0)+1;ep21DrawPairs()},'btn alt small'));
 },'btn alt small'));
 box.append(feedback);ep21Display.append(box);
}
// Original short stories, authored as coherent reading material, never assembled from random cards.
const EP21_STORIES=[
 {id:'neighbourhood',title:'A New Neighbourhood',target:['get along with','come across','within walking distance','look forward to'],text:`When I moved to a new neighbourhood, I was a little nervous. I didn't know anyone, and I had to learn where everything was. On my first walk, I came across a small library near the park. It was within walking distance of my apartment, so I decided to visit it every week. I also met a neighbour called Sam. We get along with each other because we both like books and long walks. One Saturday, Sam showed me a quiet café that I had never noticed before. We talked about our plans for the winter. I still miss my old home sometimes, but I'm looking forward to discovering more places and meeting new people here.`,question:'Why did the narrator decide to visit the library regularly?',options:['It was close to home.','Sam worked there.','It was only open on Saturday.'],right:0},
 {id:'errands',title:'A Busy Saturday',target:['pick up a prescription','find a parking spot','grab a coffee','pick up a few things','make a deposit'],text:`Saturday was busy, but I had a simple plan. First, I went to the pharmacy to pick up a prescription. Then I drove to the town centre, where it took me ten minutes to find a parking spot. I wanted to grab a coffee before doing anything else, but the café was full. I decided to visit the supermarket first and pick up a few things for dinner. After that, I walked to the bank to make a deposit. By the time I finished, I was hungry and tired. Luckily, a small café near the bank had a free table. I sat down, ordered a sandwich, and finally enjoyed my coffee. The day was busy, but everything was done.`,question:'What did the narrator do before visiting the bank?',options:['Went shopping.','Drove home.','Visited a friend.'],right:0},
 {id:'work',title:'A Problem at Work',target:['keep up with','get to the bottom of it','think over','as a consequence'],text:`Our small team had a difficult week at work. New requests arrived every morning, and it was hard to keep up with them. On Wednesday, we noticed that some customers had received the wrong information. Nobody knew why it had happened. Our manager asked us to get to the bottom of it before Friday. We checked the emails and found an old document with incorrect details. We decided to think over two possible solutions rather than change everything immediately. On Thursday, we updated the document and contacted the affected customers. As a consequence, the team had to stay a little later than usual. It was stressful, but we learned to check information more carefully.`,question:'What caused the wrong information?',options:['An outdated document.','A broken phone.','A missing manager.'],right:0},
 {id:'apartment',title:'The Apartment Question',target:['put up with','bring up','cut down on','just in case'],text:`My friend and I shared an apartment for a year. At first, everything seemed fine, but the heating was very noisy at night. We tried to put up with it because we didn't want to cause trouble. After a few weeks, my friend decided to bring up the problem with the landlord. We explained the situation politely and asked for a repair. The landlord promised to send someone on Monday. Meanwhile, we decided to cut down on electricity use because our last bill was higher than expected. We also wrote down the dates when the noise was worst, just in case the repair person needed more information. The problem was fixed, and the apartment became much more comfortable.`,question:'Why did they record the dates of the noise?',options:['To help explain the problem.','To move immediately.','To send a rent payment.'],right:0},
 {id:'unexpected',title:'An Unexpected Afternoon',target:['out and about','a short while later','on top of the world','came across'],text:`I had no special plans for Sunday, so I decided to go out and about in the city. The weather was pleasant, and the streets were quiet. I came across a small outdoor market next to the river. One stall sold handmade postcards, and I bought one for my sister. A short while later, I heard music coming from a nearby square. A group of students was performing songs for the public. I stopped to listen and met an old colleague who had moved away years earlier. We talked for almost an hour and exchanged phone numbers. When I went home, I felt on top of the world. An ordinary afternoon had turned into a lovely surprise.`,question:'What made the afternoon special?',options:['Meeting an old colleague.','Finding a new job.','Taking a long flight.'],right:0}
];
function ep21KnownTargets(story){const learned=ep21Studied();return story.target.filter(t=>learned.some(w=>ep21Norm(w.text)===ep21Norm(t)||w.text.toLowerCase()==='come across'&&t.toLowerCase()==='came across'))}
function ep21StoryReady(){return EP21_STORIES.map(s=>({...s,known:ep21KnownTargets(s)})).filter(s=>s.known.length>=2)}
function ep21DrawStories(){ep21Display.replaceChildren();const ready=ep21StoryReady();if(!ready.length){ep21Display.append(ep21El('p','smallhint','Історії відкриються, коли у твоєму словнику буде хоча б дві потрібні вивчені фрази з однієї історії.'));return}
 const selected=ready.find(x=>x.id===EP21.storyId)||ready[0];EP21.storyId=selected.id;const sel=ep21El('select','input');sel.setAttribute('aria-label','Коротка історія');for(const s of ready)sel.add(new Option(`${s.title} · ${s.known.length} знайомих виразів`,s.id));sel.value=selected.id;sel.onchange=()=>{EP21.storyId=sel.value;ep21DrawStories()};ep21Display.append(sel);
 const box=ep21El('div','ep21-exercise');box.append(ep21El('p','smallhint','Підготовлена історія A2+–B1. Практикуємо лише знайомі цільові фрази.'),ep21El('p','ep21-story',selected.text));
 box.append(BTN('🔊 Слухати історію',()=>speakEnglish(selected.text),'btn alt small'));box.append(ep21El('p','smallhint','Твої вивчені фрази: '+selected.known.join(' · ')));
 box.append(ep21El('strong','',selected.question));const feedback=ep21El('div','ep21-feedback');for(let i=0;i<selected.options.length;i++){const option=selected.options[i];box.append(BTN(option,()=>{feedback.textContent=i===selected.right?'✓ Вірно за змістом':'Зразок: '+selected.options[selected.right]},'btn alt small'))}box.append(feedback);
 const target=selected.known[0],card=ep21Studied().find(w=>ep21Norm(w.text)===ep21Norm(target)||(ep21Norm(w.text)==='come across'&&ep21Norm(target)==='came across'));if(card){const cloze=ep21MaskStory(selected.text,target);if(cloze){const task=ep21El('details','ep21-story-task');task.append(ep21El('summary','','Закріпити одну знайому фразу'));task.append(ep21El('p','smallhint',cloze));const input=ep21El('input','input');input.placeholder='Згадай англійську фразу';task.append(input);task.append(BTN('Перевірити',()=>{const result=ep21Judge(input.value,card,true);if(result==='typo')return toast('Перевір написання');if(result==='empty')return;ep202Record(card,result==='correct','context');task.append(ep21El('p','ep21-feedback',result==='correct'?'✓ Правильно':'Зразок: '+card.text));},'btn alt small'));box.append(task)}}
 ep21Display.append(box);
}
function ep21MaskStory(text,target){const escaped=target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const re=new RegExp('\\b'+escaped+'\\b','i');return re.test(text)?text.replace(re,'________'):''}
// Weekly review: stable selection (6 studied), weak phrases before easy ones, persisted progress.
const EP21_WEEK_KEY='elp-21-week-session';
function ep21WeekKey(){const d=new Date();d.setHours(0,0,0,0);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return dateKeyFrom(d)}
function dateKeyFrom(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function ep21GetWeek(){if(EP21.weekly&&EP21.weekly.week!==ep21WeekKey())EP21.weekly=null;if(!EP21.weekly){const saved=parseLS(EP21_WEEK_KEY,null);if(saved?.week===ep21WeekKey()&&Array.isArray(saved.ids))EP21.weekly=saved;}return EP21.weekly}
function ep21StartWeek(){const pool=ep21Studied().sort((a,b)=>ep21WeakScore(b)-ep21WeakScore(a)||(Number(a.srs?.due)||0)-(Number(b.srs?.due)||0));const chosen=pool.slice(0,6);
 EP21.weekly={week:ep21WeekKey(),ids:chosen.map(w=>w.id),index:0,done:[],completed:false};putLS(EP21_WEEK_KEY,EP21.weekly);ep21DrawWeek();}
function ep21DrawWeek(){ep21Display.replaceChildren();const pool=ep21Studied();if(!pool.length){ep21Display.append(ep21El('p','smallhint','Спочатку пройди хоча б одну картку. У тижневій практиці немає нових фраз.'));return}
 let w=ep21GetWeek();if(!w){ep21Display.append(ep21El('p','smallhint','Раз на тиждень: до шести вивчених фраз із пріоритетом складних. Пригадування, слухання, контекст.'));ep21Display.append(BTN('Почати тижневе закріплення',ep21StartWeek,'btn'));return}
 const cards=w.ids.map(id=>words.find(x=>x.id===id)).filter(x=>x&&ep181Studied(x));if(!cards.length){EP21.weekly=null;ep21StartWeek();return}
 if(w.completed||w.index>=cards.length){ep21Display.append(ep21El('strong','',`Готово: ${w.done.filter(x=>x.ok).length}/${w.done.length} правильних відповідей`),ep21El('p','smallhint','Складні фрази повернуться за планом повторень. Можна пройти інший набір наступного тижня.'));ep21Display.append(BTN('Повторити добірку',()=>{w.index=0;w.done=[];w.completed=false;putLS(EP21_WEEK_KEY,w);ep21DrawWeek()},'btn alt small'));return}
 const card=cards[w.index],mode=['recall','audio','context'][w.index%3],c=ep201Context(card);const finalMode=mode==='context'&&!c.masked?'recall':mode;
 const box=ep21El('div','ep21-exercise');box.append(ep21El('span','smallhint',`Картка ${w.index+1}/${cards.length} · ${finalMode==='recall'?'Пригадай':finalMode==='audio'?'Послухай':'Контекст'}`));
 if(finalMode==='recall')box.append(ep21El('p','ep21-prompt',card.meaning));
 else if(finalMode==='audio')box.append(ep21El('p','smallhint','Слухай і запиши фразу, не дивлячись на текст.'),BTN('🔊 Прослухати',()=>speakEnglish(card.text),'btn alt small'));
 else box.append(ep21El('p','ep21-prompt',c.masked),ep21El('p','smallhint',card.meaning));
 const input=ep21El('input','input');input.placeholder='Англійська фраза';input.autocomplete='off';input.autocapitalize='off';input.spellcheck=false;box.append(input);
 const resultBox=ep21El('div','ep21-feedback');box.append(resultBox);let checked=false;box.append(BTN('Перевірити',()=>{if(checked)return;const result=ep21Judge(input.value,card,finalMode==='context');if(result==='empty')return;if(result==='typo'){resultBox.textContent='Майже! Уточни написання.';return}
  checked=true;ep202Record(card,result==='correct',finalMode==='audio'?'audio':'context');w.done.push({id:card.id,ok:result==='correct',mode:finalMode});w.index++;w.completed=w.index>=cards.length;putLS(EP21_WEEK_KEY,w);
  resultBox.replaceChildren(ep21El('strong','',result==='correct'?'✓ Правильно':'Зразок: '+card.text),BTN(w.completed?'Підсумок':'Наступна →',ep21DrawWeek,'btn alt small'));input.disabled=true;
 },'btn'));ep21Display.append(box);
}
// Show grammar notes only for actual recognized errors, never claim all mistakes were parsed.
const ep21GrammarPanel=ep21El('details','ep21-grammar');ep21GrammarPanel.append(ep21El('summary','','Граматика з моїх помилок'));
const ep21GrammarBody=ep21El('div','ep21-grammar-body');ep21GrammarPanel.append(ep21GrammarBody);ep21HubBody.append(ep21GrammarPanel);
function ep21RenderGrammar(){ep21GrammarBody.replaceChildren();const seen=[];for(const card of ep21Studied())for(const [id,stats] of Object.entries(card.ep21Grammar||{})){const rule=EP21_GRAMMAR.find(x=>x.id===id);if(rule)seen.push({card,rule,count:stats.count||0})}
 seen.sort((a,b)=>b.count-a.count);if(!seen.length){ep21GrammarBody.append(ep21El('p','smallhint','Пояснення з’являться після конкретних розпізнаних помилок. Автоматично перевірити всю граматику без AI ми не можемо.'));return}
 for(const x of seen.slice(0,5)){const b=ep21El('div','ep21-grammar-item');b.append(ep21El('strong','',x.rule.title),ep21El('p','smallhint',x.rule.rule),ep21El('p','',`✗ ${x.rule.bad}  →  ✓ ${x.rule.good}`));ep21GrammarBody.append(b)}
}
ep21GrammarPanel.addEventListener('toggle',()=>{if(ep21GrammarPanel.open)ep21RenderGrammar()});
// Card quality: local validation, never silently delete or change user's vocabulary.
const ep21Quality=ep21El('details','ep21-quality');ep21Quality.append(ep21El('summary','','Перевірити якість карток'));
const ep21QualityBody=ep21El('div','ep21-quality-body');ep21Quality.append(ep21QualityBody);$('wordListPane').append(ep21Quality);
function ep21QualityIssues(){const seen=new Map(),issues=[];for(const w of words){const key=ep21Norm(w.text);if(seen.has(key)){issues.push({w,type:'duplicate',other:seen.get(key),msg:'Можливий дублікат'});}else seen.set(key,w);
  if(!clean(w.meaning))issues.push({w,type:'translation',msg:'Немає перекладу'});
  else if(!clean(w.example)&&!clean(w.context))issues.push({w,type:'example',msg:'Немає прикладу для контекстних вправ'});
  else if(!ep201Context(w).masked)issues.push({w,type:'mismatch',msg:'У прикладі не знайдено цієї фрази (або її форми)'});
 }return issues}
function ep21MergeDuplicate(old,extra){if(!old||!extra||old.id===extra.id)return false;
 for(const k of ['meaning','example','context','note','source'])if(!clean(old[k])&&clean(extra[k]))old[k]=extra[k];
 if(extra.srs&&(!old.srs||(Number(extra.srs.reps)||0)>(Number(old.srs.reps)||0)))old.srs=extra.srs;
 for(const key of ['recallHistory']){const a=Array.isArray(old[key])?old[key]:[],b=Array.isArray(extra[key])?extra[key]:[];old[key]=[...a,...b].slice(-90)}
 for(const key of ['ep202Focus','ep21Grammar','p20Memory','p20Skill'])if(!old[key]&&extra[key])old[key]=extra[key];
 if(extra.ep203Skills){old.ep203Skills=old.ep203Skills||{};for(const [skill,stats] of Object.entries(extra.ep203Skills)){if(!old.ep203Skills[skill])old.ep203Skills[skill]=stats;else{const dest=old.ep203Skills[skill];for(const prop of ['attempts','correct','misses'])dest[prop]=(Number(dest[prop])||0)+(Number(stats[prop])||0);dest.needsWork=!!dest.needsWork||!!stats.needsWork;dest.correctDays=[...new Set([...(dest.correctDays||[]),...(stats.correctDays||[])])].slice(-12)}}}
 old.ep21Alternatives=[...new Set([...ep21Alternatives(old),...ep21Alternatives(extra)])];
 if(lessonState?.ids?.includes(extra.id)){lessonState.ids=lessonState.ids.map(id=>id===extra.id?old.id:id);lessonState.ids=[...new Set(lessonState.ids)];persistLesson()}
 words=words.filter(x=>x.id!==extra.id);saveWords();return true;
}
function ep21DrawQuality(){ep21QualityBody.replaceChildren();const issues=ep21QualityIssues();ep21QualityBody.append(ep21El('p','smallhint',`${issues.length} зауважень · усе виправляється тільки за твоєю дією.`));
 for(const issue of issues.slice(0,25)){const b=ep21El('div','ep21-quality-row'),txt=ep21El('div','');txt.append(ep21El('strong','',issue.w.text),ep21El('p','smallhint',issue.msg));b.append(txt);
  b.append(BTN('Змінити',()=>openCard({},issue.w.id),'btn alt small'));
  if(issue.type==='duplicate')b.append(BTN('Об’єднати',()=>{const target=issue.other,duplicate=issue.w;
   if(!confirm(`Об’єднати дублікати «${duplicate.text}»? Буде збережено картку «${target.text}», другу прибрано. Перед операцією експортуй резервну копію.`))return;
   ep21MergeDuplicate(target,duplicate);ep21DrawQuality();toast('Картки об’єднано');},'btn ghost small'));
  ep21QualityBody.append(b);
 }
 if(issues.length>25)ep21QualityBody.append(ep21El('p','smallhint',`Показано 25 із ${issues.length} зауважень.`));
}
ep21Quality.addEventListener('toggle',()=>{if(ep21Quality.open)ep21DrawQuality()});
// Source-only chapter review: saved book positions, never invented reading comprehension facts.
const ep21ReaderBtn=BTN('✓ Закріпити розділ',()=>ep21OpenChapterReview(),'btn alt small');ep21ReaderBtn.id='ep21ChapterButton';$('readerMore').querySelector('.row')?.append(ep21ReaderBtn);
const ep21ReaderPanel=ep21El('div','reader-floating ep21-reader-review');ep21ReaderPanel.hidden=true;ep21ReaderPanel.id='ep21ChapterReview';$('readerSearchPanel').after(ep21ReaderPanel);
function ep21ChapterCards(){if(!book)return[];return ep21Studied().filter(w=>w.p20Location?.bookId===book.id&&Number(w.p20Location.chapter)===chapter&&ep201Context(w).masked).slice(0,5)}
function ep21OpenChapterReview(){const area=ep21ReaderPanel;area.replaceChildren();for(const id of ['readerTools','readerMore','readerSearchPanel','bookmarksPanel'])show(id,false);
 const title=ep21El('div','row between wrap');title.append(ep21El('strong','','Закріплення розділу'),BTN('×',()=>area.hidden=true,'btn ghost small'));area.append(title);
 const set=ep21ChapterCards();if(!set.length){area.append(ep21El('p','smallhint','У цьому розділі поки немає вивчених фраз зі збереженою позицією та контекстом. Зберігай фрази під час читання й повертайся після навчання.'));area.hidden=false;return}
 const brief=ep21El('p','smallhint',`Коротке закріплення: ${set.length} власних фраз із розділу, без нових.`);area.append(brief);
 let idx=0;const task=ep21El('div','ep21-reader-task');area.append(task);
 const render=()=>{task.replaceChildren();if(idx>=set.length){task.append(ep21El('p','','✓ Фрази повторено. Що відбулося в цьому розділі? Сформулюй 1–2 речення англійською — це самоперевірка, не автоматичне оцінювання.'));const t=ep21El('textarea','input');t.rows=2;t.placeholder='My short summary...';task.append(t);return}
  const w=set[idx],c=ep201Context(w);task.append(ep21El('p','smallhint',`${idx+1}/${set.length} · ${w.meaning}`),ep21El('p','ep21-prompt',c.masked));const field=ep21El('input','input');field.placeholder='Віднови фразу';task.append(field);
  const feedback=ep21El('div','ep21-feedback');task.append(feedback);let checked=false;task.append(BTN('Перевірити',()=>{if(checked)return;const j=ep21Judge(field.value,w,true);if(j==='empty')return;if(j==='typo'){feedback.textContent='Майже! Перевір написання.';return}checked=true;ep202Record(w,j==='correct','context');feedback.replaceChildren(ep21El('strong','',j==='correct'?'✓ Правильно':'Зразок: '+w.text),BTN('Далі →',()=>{idx++;render()},'btn alt small'));field.disabled=true},'btn alt small'))};render();area.hidden=false;
}
// Canada: authored alternate turns and two plausible conversational paths; no random substitution.
const EP21_BRANCHES={
 rent:{name:'Оренда квартири',paths:[
  {name:'Уточнити витрати',goal:'З’ясувати, які платежі включені в оренду',steps:[{en:'Are utilities included in the rent?',other:'The listing shows the monthly rent. Do you have any questions about the cost?',reply:'Water is included, but electricity is extra.'},{en:'Could you send me the address, please?',other:'Would you like to arrange a viewing?',reply:'Of course. I’ll send the address and available times.'}]},
  {name:'Домовитись про перегляд',goal:'Узгодити час перегляду',steps:[{en:'Is this apartment still available?',other:'Hello! Are you calling about the apartment?',reply:'Yes, we are still scheduling viewings.'},{en:'Could I come on Saturday morning?',other:'We have a few times available this weekend. What would work for you?',reply:'Saturday morning should work. I’ll confirm the time.'}]}]},
 pharmacy:{name:'В аптеці',paths:[
  {name:'Уточнити інструкцію',goal:'Отримати чітку інформацію про приймання',steps:[{en:'I need to pick up a prescription.',other:'Hello. How can I help you today?',reply:'Certainly. Let me find your prescription.'},{en:'Could you explain how to take this medicine?',other:'Is there anything you would like to ask the pharmacist?',reply:'Yes. The pharmacist can explain the instructions.'}]},
  {name:'Попросити повторити',goal:'Ввічливо попросити говорити повільніше',steps:[{en:'Could you explain how to take this medicine?',other:'Do you have questions about the instructions?',reply:'Yes, let’s go through them together.'},{en:'Could you please speak more slowly?',other:'I’m sorry if I spoke too quickly.',reply:'Of course. I’ll slow down.'}]}]},
 bank:{name:'У банку',paths:[
  {name:'Дізнатись про комісії',goal:'Уточнити платежі та документи',steps:[{en:'Is there a monthly fee?',other:'We have several types of accounts. What would you like to know?',reply:'Some accounts have a monthly fee. Let me explain.'},{en:'What documents do I need to bring?',other:'Would you like to start an application?',reply:'I can show you the current list of identification we accept.'}]},
  {name:'Уточнити деталі',goal:'Попросити роз’яснення',steps:[{en:'I would like to open a bank account.',other:'Hello! How can I help you?',reply:'Of course. Let’s look at your options.'},{en:'Could you explain the fees again?',other:'Would you like me to go over the costs once more?',reply:'Certainly. Let’s review them together.'}]}]},
 cafe:{name:'У кафе',paths:[
  {name:'Завершити замовлення',goal:'Ввічливо завершити замовлення та оплатити',steps:[{en:'No, thanks. That is all.',other:'Sorry, we are out of muffins. Would you like anything else?',reply:'No problem. Your total is on the screen.'},{en:'Yes, I will pay by card.',other:'Would you like to pay by card?',reply:'Sure. You can tap your card when you’re ready.'}]},
  {name:'Взяти із собою',goal:'Уточнити формат замовлення',steps:[{en:'Could I have a medium coffee, please?',other:'Hi there! What can I get started for you?',reply:'Absolutely. Would you like milk or sugar?'},{en:'To go, please.',other:'Will that be for here or to go?',reply:'Certainly. I’ll put a lid on it.'}]}]},
 clinic:{name:'Запис до клініки',paths:[
  {name:'Домовитися про час',goal:'Знайти зручний час прийому',steps:[{en:'I would like to make an appointment.',other:'Good morning. How may I help you?',reply:'Certainly. Let’s see what is available.'},{en:'Is there anything available in the morning?',other:'I have an afternoon opening on Thursday. Would that work?',reply:'Let me check for morning appointments.'}]},
  {name:'Перепитати деталі',goal:'Підтвердити час запису',steps:[{en:'Yes, Friday morning works for me.',other:'We have an opening on Friday morning. Is that okay?',reply:'Great. I’ll reserve that time.'},{en:'Could you repeat the time, please?',other:'Your appointment is booked. Any questions?',reply:'Of course. It’s at nine thirty.'}]}]}
};
const ep21CanadaDetails=ep21El('details','ep21-canada-branches');ep21CanadaDetails.append(ep21El('summary','','Ситуація змінилася · 2 варіанти розмови'));
const ep21CanadaBody=ep21El('div','ep21-canada-body');ep21CanadaDetails.append(ep21CanadaBody);$('ep18CanadaDetails').querySelector('.ep18-content').append(ep21CanadaDetails);
function ep21FindLearned(text){return ep21Studied().find(w=>ep21Norm(w.text)===ep21Norm(text))}
function ep21DrawCanada(){ep21CanadaBody.replaceChildren();const items=Object.entries(EP21_BRANCHES);const select=ep21El('select','input');select.setAttribute('aria-label','Тема ускладненої розмови');items.forEach(([key,s])=>select.add(new Option(s.name,key)));select.value=EP21.sceneId&&EP21_BRANCHES[EP21.sceneId]?EP21.sceneId:items[0][0];EP21.sceneId=select.value;select.onchange=()=>{EP21.sceneId=select.value;EP21.pathIndex=0;EP21.branch=null;ep21DrawCanada()};ep21CanadaBody.append(select);
 const scene=EP21_BRANCHES[select.value],pathPick=ep21El('select','input');pathPick.setAttribute('aria-label','Розвиток ситуації');scene.paths.forEach((p,i)=>pathPick.add(new Option(p.name,String(i))));pathPick.value=String(EP21.pathIndex||0);pathPick.onchange=()=>{EP21.pathIndex=Number(pathPick.value);EP21.branch=null;ep21DrawCanada()};ep21CanadaBody.append(pathPick);
 const path=scene.paths[EP21.pathIndex||0];const ready=path.steps.filter(t=>ep21FindLearned(t.en)).length;ep21CanadaBody.append(ep21El('p','smallhint',`${path.goal} · пройдено ${ready}/${path.steps.length} потрібних фраз`));
 if(ready<path.steps.length){ep21CanadaBody.append(ep21El('p','smallhint','Спочатку вивчи всі цільові репліки. Невивчені фрази не потрапляють у діалог.'));
  ep21CanadaBody.append(BTN('Додати репліки до моїх карток',()=>{const records=path.steps.map(t=>({text:t.en,meaning:(P20_SCENES.flatMap(s=>[...s.steps,...s.extra]).find(x=>ep21Norm(x.en)===ep21Norm(t.en))?.uk)||'',example:t.en,source:'canada:обраний сценарій',p201Included:true}));
   const r=mergeWords(records);for(const t of path.steps){const w=wordMatch(t.en);if(w)w.p201Included=true}saveWords();toast(`Додано ${r.added} реплік; спочатку пройди їхній урок.`);ep21DrawCanada()},'btn alt small'));return}
 const body=ep21El('div','ep21-canada-turn');ep21CanadaBody.append(body);let at=0,score=0;
 const render=()=>{body.replaceChildren();if(at>=path.steps.length){body.append(ep21El('strong','',score===path.steps.length?'✓ Мету розмови досягнуто':`Використано ${score}/${path.steps.length} цільових реплік`),ep21El('p','smallhint',path.goal));body.append(BTN('Повторити',()=>{at=0;score=0;render()},'btn alt small'));return}
  const t=path.steps[at],w=ep21FindLearned(t.en);body.append(ep21El('p','smallhint',`Репліка ${at+1}/${path.steps.length}`),ep21El('p','ep21-partner',t.other),BTN('🔊 Співрозмовник',()=>speakEnglish(t.other),'btn alt small'));
  const cue=P20_SCENES.flatMap(s=>[...s.steps,...s.extra]).find(x=>ep21Norm(x.en)===ep21Norm(t.en));if(cue)body.append(ep21El('p','smallhint','Потрібно сказати: '+cue.uk));
  const input=ep21El('textarea','input');input.rows=2;input.placeholder='Відповідь англійською';body.append(input);const feedback=ep21El('div','ep21-feedback');body.append(feedback);
  const controls=ep21El('div','row wrap');let checked=false;controls.append(BTN('Перевірити',()=>{if(checked)return;const j=ep21Judge(input.value,w);if(j==='empty')return;if(j==='typo'){feedback.textContent='Майже! Перевір написання.';return}
   checked=true;ep202Record(w,j==='correct','p20-dialogue');if(j==='correct')score++;
   feedback.replaceChildren(ep21El('strong','',j==='correct'?'✓ Потрібну репліку використано':'Зразок: '+t.en));feedback.append(ep21El('p','ep21-partner',t.reply));feedback.append(BTN('🔊 Реакція',()=>speakEnglish(t.reply),'btn alt small'));
   controls.replaceChildren(BTN('Далі →',()=>{at++;render()},'btn'));input.disabled=true;
  },'btn'),BTN('Підказка',()=>{if(cue)feedback.textContent=cue.uk||'Сформулюй ввічливу відповідь.'},'btn ghost small'));body.append(controls)
 };render();
}
ep21CanadaDetails.addEventListener('toggle',()=>{if(ep21CanadaDetails.open)ep21DrawCanada()});
// A reset also clears new tracked flags and sessions, preserving card contents and book positions.
const ep21PreviousReset=ep181ResetWords;
ep181ResetWords=function(items){for(const w of items){delete w.ep21Grammar;}EP21.clinic=null;EP21.weekly=null;localStorage.removeItem(EP21_WEEK_KEY);ep21PreviousReset(items);if(ep21Hub.open)ep21DrawHub()};
// Keep written instructions and mobile footer accurate.
window.EnglishPocket21={judge:ep21Judge,oneEdit:ep21OneEdit,clinic:ep21ClinicPool,stories:ep21StoryReady,pairs:ep21EligiblePairs,quality:ep21QualityIssues,chapter:ep21ChapterCards,branches:EP21_BRANCHES,weekly:ep21GetWeek};
