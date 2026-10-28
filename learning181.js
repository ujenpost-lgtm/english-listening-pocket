/* English Pocket 18.1 — focused UX, study-only practice, restart lessons,
 * adaptive Canadian dialogues and opt-in automatic translation in reader.
 * No paid API or embedded language model. */
'use strict';
const EP181={cacheKey:'elp-181-translate-cache', consentKey:'elp-181-online-consent',themeKey:'elp-181-theme',request:0,abort:null,dialog:null};
const ep181Studied=w=>!!(w&&w.meaning&&w.srs&&(Number(w.srs.reps)>0||Number(w.srs.last)>0||(Array.isArray(w.recallHistory)&&w.recallHistory.length>0)));
const ep181StudiedCards=()=>words.filter(ep181Studied);
// Only cards already introduced and finished in an actual study session can enter extra practice.
practiceCandidates=function(){return ep181StudiedCards()};
ep18FocusWords=function(){
 const s=lessonForToday(),studied=ep181StudiedCards(),ids=new Set(s?.ids||[]);
 const recent=studied.filter(w=>ids.has(w.id));
 const due=studied.filter(w=>!w.srs.due||Number(w.srs.due)<=Date.now());
 const weak=studied.filter(w=>(w.ep18Train?.wrong||0)>0).sort((a,b)=>(b.ep18Train?.wrong||0)-(a.ep18Train?.wrong||0));
 const result=[];for(const w of [...recent,...due,...weak,...studied]){if(!result.some(v=>v.id===w.id))result.push(w);if(result.length>=10)break}
 return result;
};
// Show only simple language practice. Correct absence of learned cards has a helpful explanation.
const ep181OriginalTrainer=ep18RenderTrainer;
ep18RenderTrainer=function(){
 if(!ep181StudiedCards().length){const box=$('ep18TrainingArea');box.replaceChildren();box.append(node('p','smallhint','Спочатку заверши навчання хоча б однієї картки. Лише після цього вона з’явиться тут.'));return}
 ep181OriginalTrainer();
};
const ep181OriginalUpdateFocus=ep18UpdateFocus;
ep18UpdateFocus=function(){const count=ep181StudiedCards().length;const label=$('ep18FocusLabel');if(label)label.textContent=count?`${count} вивчених карток`:'Спочатку вивчи картки';};
// Reset keeps the card, source, notes and books. It intentionally clears learning history.
function ep181ResetWords(items){
 const ids=new Set(items.map(w=>w.id));
 for(const w of items){delete w.srs;delete w.recallHistory;delete w.ep18Train;delete w.ep18Seen;delete w.ep18LastSeen;delete w.ep181Ready;}
 if(lessonState&&lessonState.ids.some(id=>ids.has(id))){lessonState=null;persistLesson()}
 dueView=false;currentReviewId=null;currentPracticeId=null;ep18Active=0;
 saveWords();drawWords();ep18UpdateFocus();EP181.dialog=null;$('ep18DialogueBody').replaceChildren();ep181FillScenarioSelect();
}
const ep181OldOpenCard=openCard;
openCard=function(candidate={},id=null){ep181OldOpenCard(candidate,id);const w=editingId?words.find(x=>x.id===editingId):null;show('ep181ResetOne',!!w&&ep181Studied(w));};
$('ep181ResetOne').onclick=()=>{
 const w=words.find(x=>x.id===editingId);if(!w)return;
 if(!confirm(`Почати вивчення «${w.text}» заново? Картка та її переклад залишаться.`))return;
 $('cardDialog').close();ep181ResetWords([w]);toast('Картку повернуто до нових');
};
$('ep181ResetAll').onclick=()=>{
 const studied=words.filter(w=>w.srs||w.recallHistory?.length||w.ep18Train?.attempts);
 if(!studied.length)return toast('Навчальних результатів поки немає');
 if(!confirm(`Скинути результати ${studied.length} карток? Усі вони знову стануть новими. Книги, переклади та тексти карток залишаться.`))return;
 if(!confirm('Підтверди скидання всього навчання. Рекомендуємо спершу зробити резервну копію.'))return;
 ep181ResetWords(studied);
 for(const key of [K.practiceLog,K.daily,LEVEL16_KEY,EP18.practiceKey,EP18.dialogueKey,'elp-17-daily-check'])localStorage.removeItem(key);
 $('settingsDialog').close();toast('Результати скинуто — можна вивчати заново');
};
// Blue-and-ink appearance; optional bright theme without an extra navigation tab.
function ep181ThemeApply(){const v=localStorage.getItem(EP181.themeKey)==='light'?'light':'dark';document.documentElement.dataset.ep181Theme=v;$('ep181Theme').textContent=v==='light'?'☾ Темна тема':'☀ Світла тема';}
$('ep181Theme').onclick=()=>{const next=document.documentElement.dataset.ep181Theme==='light'?'dark':'light';localStorage.setItem(EP181.themeKey,next);ep181ThemeApply();};
ep181ThemeApply();
// Adaptive scenes: target prompts and every possible reply come ONLY from completed cards.
const EP181_SCENARIOS=[
 {id:'housing',name:'🏠 Оренда житла',terms:/apartment|rent|landlord|lease|deposit|tenant|utility|utilities|available|move in|housing|квартир|оренд|застав|комуналь|житл/i,lines:['Hello! Are you interested in the apartment?','Do you have any questions about the apartment?','When would you like to move in?']},
 {id:'pharmacy',name:'💊 Аптека і лікар',terms:/prescription|pharmacy|medicine|doctor|health|appointment|clinic|sick|symptom|рецепт|ліки|аптек|лікар|прийом/i,lines:['Hi! How can I help you today?','Do you need anything else?','What would you like to ask?']},
 {id:'work',name:'💼 Робота та співбесіда',terms:/job|work|interview|employer|employee|experience|role|shift|vacancy|apply|прац|співбесід|ваканс|досвід/i,lines:['Hello! Tell me a little about yourself.','What experience do you have?','Do you have any questions about the role?']},
 {id:'cafe',name:'☕ Кафе й магазин',terms:/coffee|food|order|restaurant|menu|bill|receipt|refund|cash|cashier|store|buy|price|кафе|кав|рахунок|магазин|чек|ціна/i,lines:['Hi! What can I get for you?','Would you like anything else?','How would you like to pay?']},
 {id:'transport',name:'🚌 Транспорт',terms:/bus|subway|station|stop|downtown|ticket|transfer|direction|route|parking|транспорт|автобус|метро|зупин|маршрут/i,lines:['Excuse me, where are you trying to go?','Do you have a question about the route?','Can I help you find your stop?']},
 {id:'bank',name:'🏦 Банк',terms:/bank|account|deposit|payment|paycheque|transfer|card|банк|рахунок|переказ|внесок/i,lines:['Hello! What can I do for you?','Do you have any questions about your account?','Is there anything else you need?']},
 {id:'neighbour',name:'👋 Знайомство й побут',terms:/neighbou?r|hello|meet|nice to|introduc|live|recently moved|friend|познайом|сусід|привіт/i,lines:['Hi! I think we are neighbours.','How are you finding life here?','Is there anything you need help with?']},
 {id:'general',name:'💬 Повсякденна розмова',terms:/.*/,lines:['Hi there! What would you like to say?','Could you explain a little more?','Thanks! What else would you like to add?']}
];
function ep181SceneCards(scene){return ep181StudiedCards().filter(w=>scene.terms.test(`${w.text} ${w.meaning}`)).sort((a,b)=>(Number(b.srs?.last)||0)-(Number(a.srs?.last)||0)).slice(0,8)}
function ep181FillScenarioSelect(){const sel=$('ep181Scenario'),was=sel.value;sel.replaceChildren();EP181_SCENARIOS.forEach(sc=>{const count=ep181SceneCards(sc).length;sel.add(new Option(`${sc.name} · ${count}`,sc.id))});sel.value=EP181_SCENARIOS.some(s=>s.id===was)?was:(EP181_SCENARIOS.find(s=>s.id!=='general'&&ep181SceneCards(s).length)?.id||'general')}
function ep181StartDialogue(){ep181FillScenarioSelect();const sc=EP181_SCENARIOS.find(s=>s.id===$('ep181Scenario').value)||EP181_SCENARIOS.at(-1),cards=ep181SceneCards(sc).slice(0,5);
 EP181.dialog={scene:sc,cards,index:0,correct:0};ep181RenderDialogue();}
function ep181Prompt(scene,word,index){
 const t=keyText(word.text);
 const rules=[
  [/rent|utility|utilities|deposit|lease|landlord|apartment|available/, 'Hello! What would you like to know about this apartment?'],
  [/prescription|pharmacy|medicine|clinic|appointment|doctor/, 'Hello! How can I help you at the clinic or pharmacy?'],
  [/experience|interview|apply|job|work|shift|role/, 'Welcome to the interview. What can you tell me about your work?'],
  [/coffee|order|bill|receipt|refund|food|store/, 'Hello! What would you like to order or ask for?'],
  [/bus|downtown|subway|station|stop|direction|transfer/, 'Where are you going today? Can I help you?'],
  [/bank|account|payment|paycheque/, 'Hello! What banking service can I help you with?'],
  [/neighbou?r|meet|hello|live|moved/, 'Hi! Nice to meet you. Tell me about yourself!'],
 ];
 for(const [re,prompt] of rules)if(re.test(t))return prompt;
 return scene.lines[index%scene.lines.length];
}
function ep181RenderDialogue(){const box=$('ep18DialogueBody');box.replaceChildren();const d=EP181.dialog;if(!d)return;
 if(!d.cards.length){box.append(node('p','smallhint','У цій темі ще немає пройдених карток. Вивчи 2–5 відповідних фраз у «Навчанні», після чого діалог відкриється. Невивчені слова не підставляються автоматично.'));return}
 if(d.index>=d.cards.length){const total=d.cards.length,history=parseLS(EP18.dialogueKey,[]);history.push({name:d.scene.name,date:Date.now(),correct:d.correct,total,onlyStudied:true});putLS(EP18.dialogueKey,history.slice(-40));box.append(node('div','ep18-cue',`Діалог завершено: ${d.correct}/${total}`),node('p','smallhint','Ти використав тільки фрази зі свого пройденого словника. Спробуй іншу ситуацію або повернись до складних фраз.'));
 box.append(BTN('Повторити ситуацію',()=>{d.index=0;d.correct=0;ep181RenderDialogue()},'btn alt'));return}
 const w=d.cards[d.index],line=ep181Prompt(d.scene,w,d.index);
 box.append(node('div','kicker',`${d.scene.name} · ${d.index+1}/${d.cards.length}`));
 const question=node('div','ep18-cue','🇨🇦 '+line);box.append(question,BTN('🔊 Слухати співрозмовника',()=>speakEnglish(line),'btn alt small'));
 box.append(node('p','smallhint','Твоя репліка — використай вивчену фразу:'));
 box.append(node('div','ep18-cue',w.meaning));
 const input=node('textarea','input');input.rows=2;input.placeholder='Відповідай англійською…';input.autocapitalize='off';input.autocomplete='off';input.spellcheck=false;box.append(input);
 const feedback=node('div','ep18-feedback');box.append(feedback);
 const controls=node('div','row wrap');box.append(controls);
 let checked=false;
 controls.append(BTN('Перевірити',()=>{
  if(checked)return;if(!clean(input.value))return toast('Напиши свою відповідь');checked=true;
  const answer=ep18Norm(input.value),target=ep18Norm(w.text);
  const ok=answer===target||(target.length>=4&&answer.includes(target));
  if(ok)d.correct++;
  feedback.replaceChildren();feedback.append(node('strong','',ok?'✓ Використав потрібну фразу':'Порівняй із вивченою карткою:'));
  feedback.append(node('p','ep181-note',w.text));if(w.example)feedback.append(node('p','ep181-note','Приклад: '+w.example));
  feedback.append(BTN('🔊 Послухати відповідь',()=>speakEnglish(w.text),'btn alt small'));
  // The text check detects the target phrase; grammar outside it is not automatically assessed.
  feedback.append(node('p','ep181-note','Автоматично перевірено лише наявність вивченого виразу. Решту речення перевір самостійно.'));
  const next=BTN('Наступна репліка →',()=>{d.index++;ep181RenderDialogue()},'btn');controls.replaceChildren(next);
  if(!ok)controls.prepend(BTN('Спробувати ще ↻',()=>ep181RenderDialogue(),'btn alt'));
 },'btn'));
 // Retry can be done through a direct handler without advancing to the next prompt.
 controls.append(BTN('Показати фразу',()=>{feedback.textContent=w.text},'btn ghost small'));
}
$('ep18DialogueStart').onclick=ep181StartDialogue;
$('ep181Scenario').addEventListener('change',()=>{EP181.dialog=null;$('ep18DialogueBody').replaceChildren()});
// Separate translation cache. The previous versions only translated exact stored phrases.
const ep181Cache=()=>parseLS(EP181.cacheKey,{});
function ep181CacheGet(input){const v=ep181Cache()[keyText(input)];return typeof v==='string'?v:''}
function ep181CacheSet(input,translated){const entries=ep181Cache();entries[keyText(input)]=translated;const keys=Object.keys(entries);for(const k of keys.slice(0,Math.max(0,keys.length-200)))delete entries[k];putLS(EP181.cacheKey,entries)}
function ep181Chunk(text){const encoder=new TextEncoder(),chunks=[];let line='';for(const part of clean(text).split(/\s+/)){
 const candidate=line?line+' '+part:part;
 if(encoder.encode(candidate).length>440){if(line){chunks.push(line);line=''}if(encoder.encode(part).length>440)throw Error('Задовгий фрагмент. Виділи коротшу частину тексту.');line=part;}else line=candidate;
 }if(line)chunks.push(line);if(chunks.length>4)throw Error('Виділи до 2–3 речень за раз.');return chunks}
function ep181Decode(input){const div=document.createElement('textarea');div.innerHTML=String(input);return div.value}
async function ep181FromNetwork(text,signal){const chunks=ep181Chunk(text),all=[];for(const part of chunks){
 const url='https://api.mymemory.translated.net/get?'+new URLSearchParams({q:part,langpair:'en|uk',mt:'1'}).toString();
 const res=await fetch(url,{method:'GET',mode:'cors',signal,headers:{Accept:'application/json'}});
 if(!res.ok)throw Error(`Сервіс перекладу: помилка ${res.status}`);
 const data=await res.json();const result=clean(ep181Decode(data?.responseData?.translatedText||''));
 if(Number(data?.responseStatus)!==200||!result||keyText(result)===keyText(part)||/^NO QUERY|^MYMEMORY WARNING/i.test(result))throw Error('Сервіс не повернув переклад. Спробуй пізніше.');
 all.push(result)
 }return all.join(' ')
}
function ep181CancelTranslation(){EP181.request++;if(EP181.abort){EP181.abort.abort();EP181.abort=null}if($('ep181Translate')){$('ep181Translate').disabled=false;$('ep181Translate').textContent='Перекласти'}}
async function ep181Translate(force=false){if(!trayValue)return;const text=clean(trayValue.text);if(!text)return;
 const cached=ep181CacheGet(text);if(cached&&!force){$('trayMeaning').value=cached;$('trayStatus').textContent='Кешований переклад · можна редагувати';return}
 if(!localStorage.getItem(EP181.consentKey)){
  if(!confirm('Для перекладу невідомих слів і речень їхній текст надсилатиметься до безплатного онлайн-сервісу MyMemory. Це потребує інтернету; доступність і точність не гарантуються. Увімкнути переклад у застосунку?'))return;
  localStorage.setItem(EP181.consentKey,'yes');
 }
 ep181CancelTranslation();const my=EP181.request,controller=new AbortController();EP181.abort=controller;
 $('ep181Translate').disabled=true;$('ep181Translate').textContent='Перекладаю…';$('trayStatus').textContent='Онлайн-переклад…';
 const timeout=setTimeout(()=>controller.abort(),10000);
 try{const translated=await ep181FromNetwork(text,controller.signal);ep181CacheSet(text,translated);
  if(my!==EP181.request||!trayValue||keyText(trayValue.text)!==keyText(text))return;
  $('trayMeaning').value=translated;$('trayStatus').textContent='Онлайн-переклад · перевір значення перед збереженням';show('trayExternal',false);
 }catch(err){if(my!==EP181.request)return;
  if(err.name==='AbortError')$('trayStatus').textContent='Не вдалося отримати переклад за 10 с. Перевір інтернет.';
  else $('trayStatus').textContent='Переклад недоступний: '+(err?.message||'помилка сервісу');
  show('trayExternal',true);
 }finally{clearTimeout(timeout);if(my===EP181.request){EP181.abort=null;$('ep181Translate').disabled=false;$('ep181Translate').textContent='Перекласти'}}
}
$('ep181Translate').onclick=()=>ep181Translate(true);
const ep181OriginalLookup=readerLookup;
readerLookup=function(text,context=''){
 ep181CancelTranslation();ep181OriginalLookup(text,context);
 show('trayExternal',false);
 const local=clean($('trayMeaning').value),cached=ep181CacheGet(text);
 if(!local&&cached){$('trayMeaning').value=cached;$('trayStatus').textContent='Збережений переклад · можна виправити'}
 else if(!local&&localStorage.getItem(EP181.consentKey)==='yes')ep181Translate();
 else if(!local)$('trayStatus').textContent='Натисни «Перекласти» — онлайн-переклад у цій панелі';
};
const ep181OriginalTurn=turn;
turn=function(n){ep181CancelTranslation();ep181OriginalTurn(n)};
$('trayClose').addEventListener('click',ep181CancelTranslation);
$('backToLibrary').addEventListener('click',ep181CancelTranslation);
// Keep the reader tools as two simple, progressive layers instead of many persistent buttons.
$('readerToolsToggle').setAttribute('title','Налаштування книги');
$('readerOptions').textContent='Aa Шрифт і вигляд';
$('readerMore').querySelector('#readerCloseMore').textContent='Готово';
// Move rarely used controls into «Aa Шрифт і вигляд», leaving only four primary actions.
const extras=$('readerMore').querySelector('.row');
for(const id of ['fontMinus','fontPlus','ep17RateDown','ep17RateUp','bookSearchButton']){
 const element=$(id);if(element)extras.append(element);
}

// Hide redundant plan copy and move the optional seed deck to settings.
const ep181BaseLesson=renderLesson;
renderLesson=function(){ep181BaseLesson();const area=$('lessonFlow');area.querySelectorAll('.ep17-daily-summary').forEach(n=>n.remove());for(const b of area.querySelectorAll('button'))if(b.textContent.includes('Додати базову добірку'))b.remove();};
$('ep181AddBase').onclick=()=>{addA2B1();$('settingsDialog').close();nav('words');chooseWordTab('review');};
// First open on the concise lesson screen.
wordTab='review';
ep181FillScenarioSelect();ep181ThemeApply();
window.EnglishPocket181={studied:ep181StudiedCards,reset:ep181ResetWords,translate:ep181FromNetwork,scenarios:EP181_SCENARIOS};
