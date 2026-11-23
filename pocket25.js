/* English Pocket 25.0 — Personal fluency loop.
   Inherits the 24.3.1 app. No external AI, no synthetic proof of CEFR or pronunciation.
   Card outcomes are stored on card records, preserving the existing JSON backup. */
'use strict';
(()=>{
const $=id=>document.getElementById(id), el=(tag,cls='',text)=>node(tag,cls,text), btn=(text,fn,cls='btn alt small')=>BTN(text,fn,cls);
const note=(text)=>el('p','smallhint',text), section=(text,id)=>{const d=el('details','ep25-details');d.id=id;d.append(el('summary','',text));return d};
const key='elp-25-week-review',storyKey='elp-25-story-deep', now=()=>Date.now();
function currentWeek(){const d=new Date(),day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return d.toISOString().slice(0,10)}
const get=(k,f)=>parseLS(k,f), set=(k,v)=>putLS(k,v);
const norm=s=>String(s||'').normalize('NFKC').replace(/[’‘ʼ]/g,"'").trim().toLowerCase().replace(/\s+/g,' ');
const known=()=>words.filter(w=>ep181Studied(w)&&clean(w.text)&&clean(w.meaning));
const skillFor=kind=>kind==='audio'?'listening':['p20-use','builder','use','dialogue','p20-dialogue'].includes(kind)?'usage':'recall';
const brain=w=>w.ep25Brain&&typeof w.ep25Brain==='object'?w.ep25Brain:{events:[],updated:0};
const evidence=(w,skill)=>{const events=(brain(w).events||[]).filter(e=>e.skill===skill);const current=events.slice(-8);const solo=current.filter(e=>e.ok&&!e.assisted);const miss=current.filter(e=>!e.ok||e.assisted);const lastFail=[...events].reverse().findIndex(e=>!e.ok||e.assisted),after=lastFail<0?events:events.slice(events.length-lastFail);const days=new Set(after.filter(e=>e.ok&&!e.assisted).map(e=>e.day));return {events:events.length,independent:solo.length,errors:miss.length,days:days.size,mastered:days.size>=2&&solo.length>=3&&miss.length===0}};
// One canonical collector: captures only the actual graded ep202Record outcome.
// Legacy evidence remains intact and is displayed separately if no 25.0 events exist.
const previousRecord=ep202Record;
ep202Record=function(w,ok,kind,meta=null){const eligible=!!w&&ep181Studied(w);const result=previousRecord(w,ok,kind);if(!eligible||!kind)return result;
 const skill=skillFor(kind),event={skill,kind,ok:!!ok,assisted:!!meta?.assisted,at:now(),day:dateKey()};
 const data=brain(w),events=Array.isArray(data.events)?data.events:[];
 // The same skill outcome can be logged through multiple layers in one synchronous turn.
 const last=events.at(-1);if(!last||last.kind!==kind||last.ok!==event.ok||event.at-last.at>250){events.push(event);w.ep25Brain={events:events.slice(-100),updated:event.at};saveWords()}
 return result;
};
// Reset really clears 25.0 mastery evidence, without deleting card content.
const oldReset=ep181ResetWords;ep181ResetWords=function(items){for(const w of items||[])delete w.ep25Brain;return oldReset(items)};
function grade(w){const r=evidence(w,'recall'),l=evidence(w,'listening'),u=evidence(w,'usage');return {recall:r,listening:l,usage:u,ready:[r,l,u].filter(x=>x.mastered).length};}
function weakList(limit=6){return known().map(w=>{const g=grade(w),due=Number(w.srs?.due||0)>0&&w.srs.due<=now(),s=ep202State(w);return {w,g,score:(due?30:0)+(ep202Hard(w)?25:0)+[rScore(g.recall),rScore(g.listening),rScore(g.usage)].reduce((a,b)=>a+b,0)+(s.lastWrongAt?12:0)}}).sort((a,b)=>b.score-a.score).slice(0,limit)}
function rScore(x){return x.events?Math.min(x.errors*13,45)+(x.mastered?0:7):5}
function rowFor(w){const wrap=el('div','ep25-source-row'),title=el('strong','',w.text),sub=note(w.meaning);wrap.append(title,sub);return wrap}
// One Phrase Journey: an inspectable progress ladder linked to authentic card evidence.
const phrase=section('🧭 Шлях однієї фрази','ep25Phrase');const phraseBody=el('div','ep25-inner');phrase.append(phraseBody);
$('ep18TrainingDetails')?.append(phrase);
let selectedId='',taskHost=null;
function sourceLinks(w,parent){const sources=Array.isArray(w.ep24VideoSources)?w.ep24VideoSources:[];
 if(w.source)parent.append(note('Походження: '+String(w.source).slice(0,90)));
 if(w.p20Location)parent.append(note('Збережено з книги'));
 for(const s of sources.slice(0,2)){const url=window.EnglishPocket24?.parseVideo(s.url);if(!url)continue;const a=el('a','btn alt small','▶ До відео · '+Math.floor(s.seconds/60)+':'+String(s.seconds%60).padStart(2,'0'));a.href=url.url+'&t='+Number(s.seconds||0)+'s';a.target='_blank';a.rel='noopener noreferrer';parent.append(a)}
}
function showPhrase(){phraseBody.replaceChildren();const pool=known();if(!pool.length){phraseBody.append(note('Спочатку пройди навчання хоча б однієї картки.'));return}
 if(!pool.some(w=>w.id===selectedId))selectedId=weakList(1)[0]?.w.id||pool[0].id;
 const select=el('select','input');select.setAttribute('aria-label','Вивчена фраза');pool.forEach(w=>{const o=new Option(w.text,w.id);select.add(o)});select.value=selectedId;select.onchange=()=>{selectedId=select.value;showPhrase()};phraseBody.append(select);
 const w=pool.find(w=>w.id===selectedId),g=grade(w);phraseBody.append(rowFor(w));
 const skillRow=el('div','ep25-skills');for(const [type,label] of [['recall','Пригадування'],['listening','На слух'],['usage','У мовленні']]){const st=g[type],cell=el('div','ep25-skill');cell.append(el('strong','',st.mastered?'✓':String(st.independent)+' ✓'),el('span','',label),note(st.events?`Спроб ${st.events} · складно ${st.errors}`:'Ще немає спроб'));skillRow.append(cell)}phraseBody.append(skillRow,note('Навичка підтверджується лише кількома самостійними успіхами у різні дні. Читання та збереження картки самі собою не означають засвоєння.'));
 const links=el('div','row wrap');sourceLinks(w,links);phraseBody.append(links);
 taskHost=el('div','ep25-tasks');phraseBody.append(btn('Практикувати цю фразу',()=>startPhrase(w,taskHost),'btn small'),taskHost);
}
function startPhrase(w,host){if(!ep181Studied(w))return;const list=[{id:w.id,kind:'recall',text:w.text,meaning:w.meaning,masked:'',surface:w.text,example:w.example||''}];
 if('speechSynthesis'in window)list.push({...list[0],kind:'audio'});
 if(w.example?.split(/\s+/).length>=3&&w.example?.split(/\s+/).length<=18)list.push({...list[0],kind:'use'});
 let i=0,results=[];function next(){host.replaceChildren();if(i>=list.length){host.append(el('strong','','Завершено'),note('Самостійно '+results.filter(r=>r.ok&&!r.assisted).length+'/'+results.length+'. Результати враховані в загальній системі.'),btn('Оновити прогрес',showPhrase,'btn small'),btn('До картки',()=>openCard({},w.id),'btn alt small'));return}
 host.append(note('Завдання '+(i+1)+'/'+list.length));const surface=el('div');host.append(surface);window.EnglishPocket24.renderTask(surface,list[i],r=>{results.push(r);i++;return ()=>next()})}next()}
phrase.addEventListener('toggle',()=>{if(phrase.open)showPhrase()});
// Compact weekly evidence; never awards an official CEFR level.
const progress=section('📈 Мій прогрес · без XP','ep25Progress'),progressBody=el('div','ep25-inner');progress.append(progressBody);phrase.after(progress);
function showProgress(){progressBody.replaceChildren();const pool=known(),g=pool.map(grade);const indicators=[['Вивчені картки',pool.length],['Пригадування',g.filter(x=>x.recall.mastered).length],['Слухання',g.filter(x=>x.listening.mastered).length],['Використання',g.filter(x=>x.usage.mastered).length]];
 const grid=el('div','ep25-skills');indicators.forEach(([label,num])=>{const cell=el('div','ep25-skill');cell.append(el('strong','',String(num)),el('span','',label));grid.append(cell)});progressBody.append(grid,note('«Вивчені» — картки, які пройшли навчання. Інші лічильники — підтверджені навички за новою системою, тому спершу можуть бути нульовими.'));
 const hard=weakList(4);if(hard.length){progressBody.append(el('strong','','На що звернути увагу'));for(const {w} of hard)progressBody.append(btn(w.text,()=>{selectedId=w.id;phrase.open=true;showPhrase();phrase.scrollIntoView({block:'center'})},'btn ghost small'))}
 const week=get(key,{}),current=Array.isArray(week.tasks)?week:null;
 progressBody.append(btn(current?.finished?'Повторити тижневу перевірку':'Тижнева самоперевірка · до 5 фраз',()=>{if(current?.finished&&current.week===currentWeek()&&!confirm('Цього тижня ти вже проходив перевірку. Пройти ще раз?'))return;weeklyStart()},'btn small'));
 if(current?.finished)progressBody.append(note('Попередня перевірка: '+current.day+' · самостійно '+current.outcomes.filter(o=>o.ok&&!o.assisted).length+'/'+current.outcomes.length));
 const host=el('div','ep25-week');host.id='ep25Week';progressBody.append(host);if(current?.tasks?.length)weeklyResume(host,current)
}
function weeklyStart(){const items=weakList(5).map(x=>x.w);if(!items.length)return toast('Спочатку вивчи картки');const s={day:dateKey(),week:currentWeek(),tasks:items.map(w=>w.id),i:0,outcomes:[],finished:false};set(key,s);weeklyResume($('ep25Week'),s)}
function weeklyResume(host,s){host.replaceChildren();if(!s||!s.tasks)return;
 if(s.finished||s.i>=s.tasks.length){s.finished=true;set(key,s);host.append(el('strong','','Підсумок'),note('Самостійно: '+s.outcomes.filter(o=>o.ok&&!o.assisted).length+'/'+s.outcomes.length+'. Складні картки повернуться на повторення.'));return}
 const w=known().find(w=>w.id===s.tasks[s.i]);if(!w){s.i++;set(key,s);weeklyResume(host,s);return}
 host.append(note('Питання '+(s.i+1)+'/'+s.tasks.length));const area=el('div');host.append(area);
 window.EnglishPocket24.renderTask(area,{id:w.id,kind:'recall',text:w.text,meaning:w.meaning,example:w.example||'',surface:w.text,masked:''},r=>{s.outcomes.push(r);s.i++;s.finished=s.i>=s.tasks.length;set(key,s);return ()=>weeklyResume(host,s)})
}
progress.addEventListener('toggle',()=>{if(progress.open)showProgress()});
// Story Mastery: one fixed active story, explicit self-check, no auto-rotation.
const priorStories=ep21DrawStories;
ep21DrawStories=function(...args){const result=priorStories(...args);const s=window.EnglishPocket24?.story?.();if(!s?.text)return result;
 const deep=section('✨ Поглиблена робота з цією історією','ep25StoryMastery');const body=el('div','ep25-inner');deep.append(body);ep21Display.append(deep);
 deep.addEventListener('toggle',()=>{if(!deep.open)return;const k=s.id||'default',all=get(storyKey,{}),saved=all[k]||{};body.replaceChildren();body.append(note('Лише цей активний текст. Ніякої ротації або автоматичного переписування. Усні відповіді — самоперевірка.'));
 const tasks=[['retell','Перекажи без підглядання','What happened first, next and finally?'],['rephrase','Перефразуй одну думку','Choose a sentence from the story and explain it with other words.'],['ending','Альтернативне завершення','Write a different ending in 2–4 sentences.']];
 const fields={};for(const [id,label,prompt] of tasks){const wrap=el('label','ep25-label',label),field=el('textarea','input');field.rows=2;field.placeholder=prompt;field.value=saved[id]||'';wrap.append(field);body.append(wrap);fields[id]=field}
 const done=el('label','ep25-check'),check=el('input');check.type='checkbox';check.checked=!!saved.spoken;done.append(check,el('span','','Я переказав уголос, не читаючи текст'));body.append(done,btn('Зберегти власні відповіді',()=>{const v={spoken:check.checked,updatedAt:now()};Object.keys(fields).forEach(id=>v[id]=fields[id].value.trim().slice(0,2000));set(storyKey,{...get(storyKey,{}),[k]:v});toast('Збережено · без автоматичної оцінки граматики')},'btn small'),btn('🎙 Записати переказ',()=>openSpeaking('Retell this story in your own words.',`story:${k}`),'btn alt small'));
 });return result;
};
// Native recording in the browser. Audio is stored in a dedicated IndexedDB database
// and NOT included in JSON backups. No microphone access until an explicit click.
const speaking=section('🎙 Speaking Studio · записи без оцінок','ep25Speaking'),spBody=el('div','ep25-inner');speaking.append(spBody);progress.after(speaking);
let recorder=null,stream=null,chunks=[],currentBlob=null,currentURL=null,savedURLs=[],sourceTag='personal',startedAt=0,stopTimer=null,transcriptText='',recognizer=null,promptText='What did you do last weekend?';
const prompts=['What did you do last weekend?','Describe your daily routine.','Tell me about a recent English lesson.','What would you like to do in Canada?','What did you learn from the last video?'];
function dbVoice(){return new Promise((resolve,reject)=>{if(!indexedDB)return reject(Error('База записів недоступна'));const req=indexedDB.open('EnglishPocket25Voice',1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('recordings'))db.createObjectStore('recordings',{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('DB error'))})}
async function voiceAll(){const db=await dbVoice();return new Promise((resolve,reject)=>{const req=db.transaction('recordings','readonly').objectStore('recordings').getAll();req.onsuccess=()=>{db.close();resolve((req.result||[]).sort((a,b)=>b.at-a.at))};req.onerror=()=>{db.close();reject(req.error)}})}
async function voiceSave(value){const db=await dbVoice();return new Promise((resolve,reject)=>{const tx=db.transaction('recordings','readwrite');tx.objectStore('recordings').put(value);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function voiceDelete(id){const db=await dbVoice();return new Promise((resolve,reject)=>{const tx=db.transaction('recordings','readwrite');tx.objectStore('recordings').delete(id);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
function startDictation(){
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Recognition)return speechStatus('Твій браузер не підтримує розпізнавання мовлення');
 if(recorder?.state==='recording')return speechStatus('Спочатку зупини аудіозапис');
 if(!confirm('Розпізнавання мовлення може надсилати голос на сервер браузера. Дозволяєш почати окрему диктовку англійською? Без оцінки вимови.'))return;
 try{if(recognizer)recognizer.abort();recognizer=new Recognition();recognizer.lang='en-CA';recognizer.interimResults=false;recognizer.maxAlternatives=1;
 recognizer.onresult=e=>{transcriptText=[...e.results].map(r=>r[0]?.transcript||'').join(' ').trim();renderSpeech();speechStatus('Отримано текст від браузера. Це не оцінка правильної вимови.')};
 recognizer.onerror=e=>speechStatus('Розпізнавання не вдалося: '+(e.error||'помилка'));
 recognizer.onend=()=>{recognizer=null};recognizer.start();speechStatus('Слухаю через розпізнавання браузера…');
 }catch(e){speechStatus('Розпізнавання недоступне: '+e.message)}
}
function clearVoiceURL(){if(currentURL){URL.revokeObjectURL(currentURL);currentURL=null}}
function releaseMic(){clearTimeout(stopTimer);stopTimer=null;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
function stopMic(){if(recorder?.state==='recording')recorder.stop();else releaseMic()}
function speechStatus(msg){const node=$('ep25SpeechStatus');if(node)node.textContent=msg}
async function startMic(){if(recorder?.state==='recording')return;try{
 if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw Error('Запис не підтримується цим браузером');
 stream=await navigator.mediaDevices.getUserMedia({audio:true});
 const options=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(x=>MediaRecorder.isTypeSupported?.(x));
 recorder=new MediaRecorder(stream,options?{mimeType:options}:undefined);chunks=[];currentBlob=null;clearVoiceURL();startedAt=now();
 recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
 recorder.onerror=()=>{releaseMic();speechStatus('Помилка записування, дозвіл мікрофона можна перевірити в налаштуваннях браузера')};
 recorder.onstop=()=>{releaseMic();const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});if(!blob.size){speechStatus('Аудіо не записалося. Спробуй ще раз.');return}currentBlob=blob;speechStatus('Записано '+Math.max(1,Math.round((now()-startedAt)/1000))+' с. Прослухай та збережи за бажанням.');renderSpeech()};
 recorder.start();stopTimer=setTimeout(()=>stopMic(),120000);speechStatus('Запис іде… максимум 2 хвилини.');renderSpeech();
 }catch(e){releaseMic();speechStatus(e.name==='NotAllowedError'?'Доступ до мікрофона заборонено. Дозвіл змінюється в браузері.':String(e.message||e))}}
function downloadAudio(blob,title,at){const ext=blob.type.includes('mp4')?'m4a':blob.type.includes('ogg')?'ogg':'webm';const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=`english-pocket-speaking-${String(title||'practice').replace(/[^\w-]/g,'_').slice(0,18)}-${new Date(at).toISOString().slice(0,10)}.${ext}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
async function saveMic(){if(!currentBlob)return;if(currentBlob.size>15*1024*1024){speechStatus('Запис завеликий (15 МБ). Завантаж його на пристрій замість збереження.');return}
 try{await voiceSave({id:crypto.randomUUID?.()||String(now()),at:now(),prompt:promptText,source:sourceTag,blob:currentBlob});speechStatus('Аудіо збережене тільки на цьому пристрої. Воно не входить до JSON резервної копії.');currentBlob=null;clearVoiceURL();renderSpeech()}catch(e){speechStatus('Не вдалося зберегти аудіо: '+e.message)}}
function openSpeaking(prompt,source='personal'){promptText=prompt||prompts[0];sourceTag=source;speaking.open=true;nav('words');chooseWordTab('review');$('ep18TrainingDetails').open=true;renderSpeech();speaking.scrollIntoView({block:'start',behavior:'smooth'})}
function renderSpeech(){savedURLs.forEach(u=>URL.revokeObjectURL(u));savedURLs=[];spBody.replaceChildren();spBody.append(note('Вибирай коротке питання, говори 1–2 хвилини та прослуховуй свій запис. Оцінка вимови — твоя власна; аудіо нікуди не надсилається.'));
 const selector=el('select','input');selector.setAttribute('aria-label','Тема говоріння');for(const p of [promptText,...prompts.filter(p=>p!==promptText)])selector.add(new Option(p,p));selector.value=promptText;selector.onchange=()=>{promptText=selector.value;sourceTag='personal';renderSpeech()};spBody.append(selector);
 const actions=el('div','row wrap');const recording=recorder?.state==='recording';actions.append(btn(recording?'■ Зупинити':'🎙 Записати',()=>recording?stopMic():startMic(),recording?'btn danger small':'btn small'),btn('🔊 Послухати питання',()=>speakEnglish(promptText)));
 if(window.SpeechRecognition||window.webkitSpeechRecognition)actions.append(btn('Диктовка*',startDictation,'btn ghost small'));
 spBody.append(actions);const status=note(recording?'Запис іде… до 2 хвилин.':'Записи лише на твоєму пристрої.');status.id='ep25SpeechStatus';spBody.append(status);
 if(window.SpeechRecognition||window.webkitSpeechRecognition)spBody.append(note('* Розпізнавання може працювати через сервер браузера. Запускається тільки після окремого підтвердження.'));
 if(transcriptText){const t=el('div','ep25-transcript');t.append(el('strong','','Текст розпізнавання (не оцінка вимови)'),el('p','',transcriptText),btn('Очистити текст',()=>{transcriptText='';renderSpeech()},'btn ghost small'));spBody.append(t)}
 if(currentBlob){const url=currentURL||URL.createObjectURL(currentBlob);currentURL=url;const audio=el('audio','ep25-audio');audio.controls=true;audio.src=url;spBody.append(audio);const a=el('div','row wrap');a.append(btn('Зберегти локально',saveMic,'btn small'),btn('↓ Зберегти файл',()=>downloadAudio(currentBlob,promptText,now()),'btn alt small'));spBody.append(a)}
 const list=el('div','ep25-recordings');spBody.append(list);voiceAll().then(records=>{if(!list.isConnected)return;list.replaceChildren();list.append(note('Збережені записи: '+records.length+' · максимум 2 хвилини кожен. Експортуй їх окремо перед очищенням браузера.'));for(const x of records.slice(0,20)){const row=el('div','ep25-voice-item'),heading=el('div');heading.append(el('strong','',x.prompt||'Speaking'),note(new Date(x.at).toLocaleDateString('uk-UA')));const audio=el('audio','ep25-audio');audio.controls=true;const uri=URL.createObjectURL(x.blob);savedURLs.push(uri);audio.src=uri;audio.addEventListener('loadstart',()=>{}, {once:true});row.append(heading,audio,btn('↓',()=>downloadAudio(x.blob,x.prompt,x.at)),btn('×',async()=>{if(!confirm('Видалити цей аудіозапис?'))return;try{await voiceDelete(x.id);URL.revokeObjectURL(uri);renderSpeech()}catch(e){speechStatus(e.message)}},'btn ghost small'));list.append(row)}},()=>{list.append(note('Не вдалося прочитати список локальних записів.'))});
}
speaking.addEventListener('toggle',()=>{if(speaking.open)renderSpeech();else {if(recorder?.state==='recording')stopMic();if(recognizer){recognizer.abort();recognizer=null}}});
// Video -> studied words -> speaking: never extract third-party subtitles or quiz new cards.
const bridge=section('🔗 Відео → Слова → Мовлення','ep25VideoBridge'),bridgeBody=el('div','ep25-inner');bridge.append(bridgeBody);$('ep243Studio')?.after(bridge);
function drawBridge(){bridgeBody.replaceChildren();const notes=get('elp-24-video-notebook',[]);const items=(Array.isArray(notes)?notes:[]).slice(0,60),ready=items.filter(n=>{const w=words.find(w=>w.id===n.cardId)||wordMatch(n.phrase);return w&&ep181Studied(w)});const newest=items[0];
 bridgeBody.append(note(items.length?`Збережено фраз із відео: ${items.length} · пройдено навчання: ${ready.length}.`: 'Спочатку збережи фразу у відеотренажері. Потім вивчи її у «Словах».'));
 const selected=ready.slice(0,5);for(const x of selected){const w=words.find(w=>w.id===x.cardId)||wordMatch(x.phrase);const line=el('div','row between wrap');line.append(el('span','',w.text),btn('Практика',()=>{nav('words');chooseWordTab('review');$('ep18TrainingDetails').open=true;selectedId=w.id;phrase.open=true;showPhrase();phrase.scrollIntoView({block:'start'})}));bridgeBody.append(line)}
 const current=window.EnglishPocket241?.module;if(current)bridgeBody.append(btn('Speaking за поточним модулем',()=>openSpeaking((current.speaking||'Summarize the video in English.')+(selected.length?' Try to use: '+selected.slice(0,3).map(n=>n.phrase).join(', ')+'.':''),`course:${current.id}`),'btn small'));
 else if(newest)bridgeBody.append(btn('Розкажи про переглянуте відео',()=>openSpeaking('What did you learn from the video?',`video:${newest.url||''}`),'btn small'));
}
bridge.addEventListener('toggle',()=>{if(bridge.open)drawBridge()});
// Reader 2.0: contextual suggestions only when there is a grounded, known expression.
const source=el('p','ep25-translation-source');source.id='ep25TranslationSource';const suggestion=el('div','ep25-reader-suggest');
const modes=$('translationTray')?.querySelector('.ep244-modes');if(modes)modes.after(source,suggestion);
const previousLookup=readerLookup;
readerLookup=function(value,context=''){const result=previousLookup(value,context);if(!$('translationTray')?.hidden&&trayValue){
 const exact=window.EP243?.lookup?.(trayValue.text),status=$('trayStatus')?.textContent||'';source.textContent=exact?`Джерело: ${exact.source}${exact.derived?' · словоформа':''}`:status.includes('підказки')?'Джерело: окремі словникові значення · НЕ переклад речення':status.includes('MyMemory')?'Джерело: онлайн-переклад (збережений у кеші)':'Точне джерело не підтверджено; перевір контекст';
 suggestion.replaceChildren();const selected=trayValue.text;if(!selected.includes(' ')&&context){const matchText=String(context);const at=matchText.toLowerCase().indexOf(selected.toLowerCase());if(at>=0){const phrase=window.EnglishPocket24?.phraseAt?.(matchText,at);if(phrase&&norm(phrase.text)!==norm(selected))suggestion.append(btn('Перекласти вираз «'+phrase.text.slice(0,48)+'»',()=>readerLookup(phrase.text,context),'btn alt small'))}}
 }return result};
$('trayClose')?.addEventListener('click',()=>{source.textContent='';suggestion.replaceChildren()});
// Live source updates after explicit online/on-device translation finishes.
if($('trayStatus'))new MutationObserver(()=>{if($('translationTray')?.hidden)return;const t=$('trayStatus').textContent||'';
 if(/MyMemory|онлайн-переклад/i.test(t))source.textContent='Джерело: онлайн-переклад · може бути помилковим';
 else if(/модель на пристрої|локальна модель/i.test(t))source.textContent='Джерело: браузерна мовна модель';
}).observe($('trayStatus'),{childList:true,characterData:true,subtree:true});
// Diagnostics: source-controlled smoke tests, without clearing any data.
const qa=section('🛡 Перевірка застосунку','ep25QA'),qaBody=el('div','ep25-inner');qa.append(qaBody);$('settingsDialog')?.querySelector('.actions')?.before(qa);
qaBody.append(note('Самоперевірка не змінює твій словник, книги, записи чи прогрес.'));
const qaResults=el('div');qaBody.append(btn('Запустити перевірку',()=>{const checks=[['Модулі',!!window.EnglishPocket24&&!!window.EnglishPocket241&&!!window.EP243&&!!window.EP244],['Читалка',!!$('pageText')&&!!$('translationTray')],['Словник',Array.isArray(words)&&typeof ep181Studied==='function'],['Історії',typeof ep21DrawStories==='function'],['Відео',!!$('ep243Studio')&&!!$('videoList')],['Сховище',(()=>{try{const k='elp-25-smoke';localStorage.setItem(k,'ok');const good=localStorage.getItem(k)==='ok';localStorage.removeItem(k);return good}catch{return false}})()]];qaResults.replaceChildren();checks.forEach(([name,ok])=>qaResults.append(note((ok?'✓ ':'⚠ ')+name)));},'btn small'),qaResults);
// Export an API for deterministic regression tests; no network and no background monitoring.
const footer=document.querySelector('.app>footer');if(footer)footer.textContent='English Pocket 25.0.0 · A2+ → B1 · Книги й прогрес зберігаються на пристрої · Без платного AI API';
window.EnglishPocket25={version:'25.0.0',grade,weakList,evidence,openSpeaking,showPhrase,drawBridge,readerLookup,getState:()=>({selectedId,recording:recorder?.state==='recording',activeStory:window.EnglishPocket24?.story?.()?.id})};
})();
