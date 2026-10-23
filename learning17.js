/* English Pocket 17.0 — A2+ → B1. Local-first learning extensions.
   Adds reading assistance, measured retrieval, a Canadian-life practice library
   and video-reflection. No AI or translation API. */
'use strict';
const EP17={
 rateKey:'elp-17-speech-rate', canadaKey:'elp-17-canada-progress', videosKey:'elp-17-video-notes',
 metaKey:'elp-17-daily-check', rate:Number(parseLS('elp-17-speech-rate',.85))||.85,
 activeScenario:0, activeVideo:null, speaking:false, paragraphMode:false,
 originalLesson:renderLesson, originalMeaning:offlineMeaning, originalLookup:readerLookup,
 originalVideos:drawVideos, originalSpeak:speakEnglish,
 originalRate:rateReview, originalFinish:l16Complete,
 originalDrawList:drawWordList
};
const EP17_CANADA=[
 {name:'Знайомство',en:'I recently moved to Canada.',uk:'Я нещодавно переїхав до Канади.',example:'I recently moved to Canada, and I am looking for a place to live.',prompt:'How would you introduce yourself to a new neighbour?',level:'A2+'},
 {name:'Оренда житла',en:'Is this apartment still available?',uk:'Ця квартира ще доступна?',example:'Hello, is this apartment still available for rent?',prompt:'What would you ask a landlord before viewing an apartment?',level:'A2+'},
 {name:'Магазин',en:'Could you help me find this?',uk:'Не могли б ви допомогти мені це знайти?',example:'Excuse me, could you help me find this?',prompt:'Ask a shop assistant for help politely.',level:'A2+'},
 {name:'Транспорт',en:'Does this bus go downtown?',uk:'Цей автобус їде до центру?',example:'Excuse me, does this bus go downtown?',prompt:'Ask for directions using a simple question.',level:'A2+'},
 {name:'Аптека',en:'I need to pick up a prescription.',uk:'Мені потрібно забрати ліки за рецептом.',example:'Hello, I need to pick up a prescription.',prompt:'Explain what you need at a pharmacy.',level:'A2+'},
 {name:'Запис',en:'I would like to make an appointment.',uk:'Я хотів би записатися на прийом.',example:'I would like to make an appointment for next week.',prompt:'Call a clinic and ask for an appointment.',level:'A2+'},
 {name:'Робота',en:'I have experience in this field.',uk:'Я маю досвід у цій сфері.',example:'I have experience in this field and I enjoy working with people.',prompt:'Tell an employer about your experience.',level:'B1'},
 {name:'Співбесіда',en:'Could you tell me more about the role?',uk:'Чи могли б ви розповісти більше про посаду?',example:'Could you tell me more about the role and the team?',prompt:'Ask an interviewer a polite question.',level:'B1'},
 {name:'Банк',en:'I would like to open a bank account.',uk:'Я хотів би відкрити банківський рахунок.',example:'I would like to open a bank account. What documents do I need?',prompt:'Explain what service you need at the bank.',level:'A2+'},
 {name:'Погода',en:'It is colder than I expected.',uk:'Холодніше, ніж я очікував.',example:'It is colder than I expected, so I need a warmer coat.',prompt:'Describe today’s weather and compare it with your expectations.',level:'B1'},
 {name:'Спілкування',en:'What exactly do you mean?',uk:'Що саме ви маєте на увазі?',example:'Sorry, what exactly do you mean by that?',prompt:'Politely ask someone to explain something again.',level:'B1'},
 {name:'Плани',en:'I am looking forward to meeting you.',uk:'Я з нетерпінням чекаю нашої зустрічі.',example:'Thank you for your message. I am looking forward to meeting you.',prompt:'Write a friendly message about an upcoming meeting.',level:'B1'}
];
const EP17_HINTS=[
 ['run out of','закінчитися; вичерпатися'],['ran out of','закінчилося; не залишилося'],
 ['have to','мусити'],['had to','довелося'],['look for','шукати'],['looking for','шукаю / шукає'],
 ['would like to','хотів би / хотіла б'],['need to','потрібно'],['could you','чи не могли б ви'],
 ['get along with','ладнати з кимось'],['come across','випадково натрапити'],['came across','випадково натрапив'],
 ['pick up','забрати; підхопити'],['take care of','піклуватися'],['figure out','розібратися'],
 ['look forward to','з нетерпінням чекати'],['as soon as','щойно'],['on my way','я вже в дорозі'],
 ['by the way','до речі'],['in case','на випадок'],['just in case','про всяк випадок'],
 ['at the moment','зараз'],['every now and then','час від часу'],['on time','вчасно'],
 ['feel under the weather','нездужати'],['within walking distance','у пішій доступності'],
 ['get to work','дістатися до роботи'],['get back','повернутися'],
 ['make an appointment','записатися на прийом'],['pick up a prescription','забрати ліки за рецептом']
];
function ep17Normalize(t){return keyText(t).replace(/[“”‘’]/g,"'").replace(/[.,!?;:()\[\]«»]+$/g,'').replace(/^[.,!?;:()\[\]«»]+/g,'').trim()}
function ep17Dict(){const dict=new Map();const add=(text,meaning,rank)=>{if(!text||!meaning)return;const k=ep17Normalize(text);if(!k)return;const prev=dict.get(k);if(!prev||rank>prev.rank)dict.set(k,{text,meaning,rank})};
 for(const [t,m] of EP17_HINTS)add(t,m,0);
 for(const w of STARTER_CARDS)add(w.text||w.en,w.meaning||w.uk,1);
 for(const w of A2B1_CARDS)add(w.text||w.en,w.meaning||w.uk,1);
 for(const w of EP17_CANADA)add(w.en,w.uk,2);
 for(const w of words)add(w.text,w.meaning,3);
 return dict;
}
function ep17Glosses(text,max=4){const d=ep17Dict(),s=ep17Normalize(text);if(d.has(s))return [d.get(s)];
 const results=[];const entries=[...d.entries()].filter(([k])=>k.length>=4&&k.split(' ').length>=2).sort((a,b)=>b[0].length-a[0].length);
 for(const [k,v] of entries){if(results.length>=max)break;const i=s.indexOf(k);if(i>=0){const before=i===0?' ':s[i-1],after=s[i+k.length]||' ';if(!/[\p{L}\p{N}]/u.test(before)&&!/[\p{L}\p{N}]/u.test(after)&&!results.some(x=>x.text===v.text))results.push(v)}}
 return results;
}
// A full sentence can only be translated offline if already stored exactly.
// For arbitrary sentences, show reliably known component glosses and an explicit external action.
offlineMeaning=function(value){const k=ep17Normalize(value),d=ep17Dict();return d.get(k)?.meaning||EP17.originalMeaning(value)};
function ep17PanelExtra(text){const box=$('ep17Glosses');if(!box)return;box.replaceChildren();const gloss=ep17Glosses(text);
 if(gloss.length&&ep17Normalize(gloss[0].text)===ep17Normalize(text))return;
 if(gloss.length){box.append(node('div','ep17-gloss-caption','Знайомі вирази в цьому уривку:'));for(const p of gloss){const line=node('div','ep17-gloss-row');line.append(node('strong','',p.text),node('span','',p.meaning));box.append(line)}}
}
readerLookup=function(value,context=''){EP17.originalLookup(value,context);const meaning=offlineMeaning(value);if(meaning){$('trayMeaning').value=meaning;$('trayStatus').textContent='Знайдено в локальному словнику'}else $('trayStatus').textContent='Можна перекласти вручну або відкрити зовнішній перекладач';ep17PanelExtra(value);
 const btn=$('ep17Sentence');if(btn)btn.hidden=!context||ep17Normalize(value)===ep17Normalize(context);
};
$('ep17Sentence').onclick=()=>{if(trayValue?.context)readerLookup(trayValue.context,trayValue.context)};
// Calm, device-native pronunciation with variable rate (availability depends on installed voices).
speakEnglish=function(text){if(!('speechSynthesis'in window)||typeof SpeechSynthesisUtterance==='undefined'){toast('Цей браузер не підтримує озвучування');return}
 stopSpeech();const source=clean(text).slice(0,7000);if(!source)return;
 const parts=source.match(/.{1,160}(?:[.!?]\s+|\s+|$)/gu)||[source];let pointer=0;
 function utterNext(){if(pointer>=parts.length){EP17.speaking=false;$('ep17SpeechStop')?.setAttribute('hidden','');return}
 const u=new SpeechSynthesisUtterance(parts[pointer++]);const voices=speechSynthesis.getVoices();const voice=voices.find(v=>/^en-(CA|US|GB)/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang));if(voice)u.voice=voice;u.lang=voice?.lang||'en-US';u.rate=EP17.rate;u.onend=utterNext;u.onerror=e=>{EP17.speaking=false;if(!['canceled','interrupted'].includes(e.error))toast('Не вдалося озвучити текст')};speechSynthesis.speak(u)}
 EP17.speaking=true;$('ep17SpeechStop')?.removeAttribute('hidden');utterNext();
};
function ep17VoiceRate(step){EP17.rate=Math.min(1.2,Math.max(.65,Math.round((EP17.rate+step)*100)/100));putLS(EP17.rateKey,EP17.rate);$('ep17Rate').textContent=EP17.rate.toFixed(2)+'×';toast('Швидкість: '+EP17.rate.toFixed(2)+'×')}
$('ep17RateDown').onclick=()=>ep17VoiceRate(-.1);$('ep17RateUp').onclick=()=>ep17VoiceRate(.1);$('ep17Rate').textContent=EP17.rate.toFixed(2)+'×';
$('ep17SpeechStop').onclick=()=>{stopSpeech();EP17.speaking=false;show('ep17SpeechStop',false)};
$('ep17ParagraphMode').onclick=()=>{EP17.paragraphMode=!EP17.paragraphMode;$('ep17ParagraphMode').textContent=EP17.paragraphMode?'✓ Натисни на абзац':'🎧 Слухати абзац';show('readerTools',false);toast(EP17.paragraphMode?'Торкнися абзацу, щоб послухати':'Режим слухання вимкнено')};
// A dedicated paragraph mode avoids fighting native text selection or swipe.
$('pageText').addEventListener('click',e=>{if(!EP17.paragraphMode||!book||Date.now()-swipedAt<450)return;const para=e.target.closest('p,li,blockquote,h1,h2,h3,h4');if(!para)return;e.preventDefault();e.stopImmediatePropagation();const s=clean(para.textContent);speakEnglish(s);},true);
// Natural voice playback of the selected content remains available in the reader bottom sheet.
// For remembered words, require successful recall on separate calendar days.
function ep17Recall(w,success,kind){if(!w)return;const log=Array.isArray(w.recallHistory)?w.recallHistory:[];log.push({day:dateKey(),ok:!!success,kind});w.recallHistory=log.slice(-45)}
function ep17Mastery(w){if(!w.srs)return 'new';const hist=w.recallHistory;if(!hist?.length)return Number(w.srs.interval)>=21&&Number(w.srs.streak)>=5?'mastered':'learning';
 const good=hist.filter(x=>x.ok),dates=[...new Set(good.map(x=>x.day))].sort();const first=dates[0],last=dates[dates.length-1];const span=first&&last?(new Date(last+'T12:00:00')-new Date(first+'T12:00:00'))/DAY:0;
 const lastFail=hist.map((x,i)=>!x.ok?i:-1).reduce((a,b)=>Math.max(a,b),-1),goodAfter=hist.slice(lastFail+1).filter(x=>x.ok),daysAfter=new Set(goodAfter.map(x=>x.day));
 return dates.length>=3&&span>=4&&daysAfter.size>=2&&good.some(x=>['test','srs'].includes(x.kind))?'mastered':'learning'
}
// Reuse the existing list layout and styling; update only state labels according to measured recall.
function ep17AddMasteryBadges(){for(const item of $('wordsList').querySelectorAll('.worditem')){const en=item.querySelector('.wordtext')?.textContent?.replace(/^☆\s*/,'');const w=wordMatch(en);if(!w)continue;const pill=item.querySelector('.pill');if(pill){const old=mastery(w),next=ep17Mastery(w);if(old!==next)pill.textContent=pill.textContent.replace(old==='mastered'?'Засвоєна':old==='learning'?'Вивчаю':'Нова',next==='mastered'?'Засвоєна':next==='learning'?'Вивчаю':'Нова')}}}
const ep17ListBase=drawWordList;
drawWordList=function(){ep17ListBase();ep17AddMasteryBadges()};
// Keep review schedule unchanged and store graded retention observations.
rateReview=function(grade){const current=words.find(w=>w.id===currentReviewId),canRecord=!!current&&answerVisible;EP17.originalRate(grade);if(canRecord){ep17Recall(current,grade>=2,'srs');saveWords()}};
l16Complete=function(){const s=lessonState;if(s&&!s.finalized){for(const id of s.ids){const w=words.find(x=>x.id===id);if(w)ep17Recall(w,!!s.testResults[id],'test')}}EP17.originalFinish();};
// The start of the day prioritises due reviews; keeps the same three-screen layout.
renderLesson=function(){EP17.originalLesson();const s=lessonForToday(),flow=$('lessonFlow');if(!s){const focus=flow.querySelector('.focus-start');if(focus){const top=node('div','ep17-daily-summary');const due=availableReview().length;top.append(node('strong','',due?'Твій план: повторити → вивчити → застосувати':'Твій план: вивчити → застосувати → повторити'));top.append(node('span','','5–15 хв для фраз + коротке читання або відео. Без боргів за пропущені дні.'));focus.prepend(top)}}else if(s.stage==='done'){
 const text=node('p','smallhint','Засвоєння підтвердиться після правильних пригадувань у різні дні. Сьогоднішній тест — лише початок.');flow.querySelector('.box')?.append(text)
 }
 // Keep one contextual Canada exercise visible only when no card is being answered.
 show('ep17Canada',!s||s.stage==='done');
};
// Mastery statistics should not promote cards solely for a good first-day test.
const ep17BaseStats=drawWordStats;
drawWordStats=function(){ep17BaseStats();const dash=$('wordDashboard');if(dash?.children?.length>=3)dash.children[2].querySelector('strong').textContent=words.filter(w=>ep17Mastery(w)==='mastered').length};
function ep17ScenarioRender(){const w=EP17_CANADA[EP17.activeScenario],box=$('ep17CanadaCard');box.replaceChildren();
 box.append(node('div','kicker',`${w.level} · ${w.name}`),node('div','studytitle',w.en),node('div','wordmeaning',w.uk),node('div','wordexample',w.example));
 const btns=node('div','ep17-quick-actions');btns.append(BTN('🔊 Послухати',()=>speakEnglish(w.en),'btn alt small'),BTN('＋ У картки',()=>{const r=mergeWords([{text:w.en,meaning:w.uk,example:w.example,source:'canada:'+w.name,level:w.level}]);toast(r.added?'Додано до карток':'Фраза вже у словнику')},'btn alt small'));box.append(btns);
 const exercise=node('div','ep17-prompt');exercise.append(node('strong','','Скажи англійською:'),node('p','smallhint',w.prompt));const answer=node('textarea','input');answer.rows=2;answer.placeholder='Спробуй відповісти самостійно (для самоперевірки)';answer.value=parseLS(EP17.canadaKey,{})[w.name]?.draft||'';
 answer.oninput=()=>{const v=parseLS(EP17.canadaKey,{});v[w.name]={...(v[w.name]||{}),draft:answer.value};putLS(EP17.canadaKey,v)};exercise.append(answer);
 const model=node('p','ep17-answer',`Зразок: ${w.example}`);model.hidden=true;exercise.append(BTN('Показати зразок',()=>{model.hidden=!model.hidden},'btn alt small'),model);box.append(exercise);
 const navs=node('div','row between');navs.append(BTN('←',()=>{EP17.activeScenario=(EP17.activeScenario+EP17_CANADA.length-1)%EP17_CANADA.length;ep17ScenarioRender()},'btn ghost small'),node('span','smallhint',`${EP17.activeScenario+1}/${EP17_CANADA.length}`),BTN('Наступна →',()=>{EP17.activeScenario=(EP17.activeScenario+1)%EP17_CANADA.length;ep17ScenarioRender()},'btn alt small'));box.append(navs);
}
ep17ScenarioRender();
// Video aftercare: no playback scraping or false correctness judgements. User writes gist + one useful phrase.
const EP17_VIDEO_QUESTIONS={speaking:'Яку корисну репліку ти почув і коли використаєш її?',story:'Що сталося у відео? Спробуй коротко переказати.',work:'Який вислів можна застосувати на роботі або співбесіді?',listening:'Яка головна ідея розмови?' };
function ep17VideoPractice(v){EP17.activeVideo=v.id;const area=$('ep17VideoPractice');area.replaceChildren();show('ep17VideoPractice');
 const prev=parseLS(EP17.videosKey,{})[v.id]||{};
 area.append(node('strong','',`Після відео · ${v.name}`),node('p','smallhint',EP17_VIDEO_QUESTIONS[v.topic]||'Що ти зрозумів?'));
 const gist=node('textarea','input');gist.placeholder='Напиши 1–2 речення англійською';gist.rows=2;gist.value=prev.gist||'';area.append(gist);
 const row=node('div','ep17-video-inputs');const phrase=node('input','input');phrase.placeholder='Корисна англійська фраза';phrase.value=prev.phrase||'';const meaning=node('input','input');meaning.placeholder='Значення українською';meaning.value=prev.meaning||'';row.append(phrase,meaning);area.append(row);
 const foot=node('div','row wrap');foot.append(BTN('🔊 Озвучити фразу',()=>{if(phrase.value.trim())speakEnglish(phrase.value);else toast('Спочатку введи фразу')},'btn alt small'),BTN('Зберегти практику',()=>{const data=parseLS(EP17.videosKey,{});data[v.id]={at:Date.now(),gist:clean(gist.value),phrase:clean(phrase.value),meaning:clean(meaning.value)};putLS(EP17.videosKey,data);
 if(phrase.value.trim()&&meaning.value.trim())mergeWords([{text:clean(phrase.value),meaning:clean(meaning.value),example:'',source:'video:'+v.name,level:v.level}]);else if(phrase.value.trim()&&!meaning.value.trim())toast('Нотатку збережено; для картки додай українське значення');
 toast('Практику збережено');show('ep17VideoPractice',false);drawVideos();},'btn'),BTN('Закрити',()=>show('ep17VideoPractice',false),'btn ghost small'));area.append(foot);area.scrollIntoView({block:'nearest',behavior:'smooth'});
}
drawVideos=function(){EP17.originalVideos();const filter=$('videoFilter').value,level=$('videoLevel').value,q=keyText($('videoSearch').value);const selected=CATALOG.filter(v=>(filter==='all'||v.topic===filter)&&(level==='all'||v.level.includes(level))&&keyText(v.name+' '+v.source+' '+v.desc).includes(q));const visible=$('videoList').querySelectorAll('.videoitem');
 selected.forEach((v,i)=>{const actions=visible[i]?.querySelector('.video-actions');if(actions)actions.append(BTN('✎ Практика',()=>ep17VideoPractice(v),'btn alt small'));});};
// New state is backed up by the existing full exporter and restored by app.js importer.
// Testable references exposed only for in-app diagnostics, not a service interface.
window.EnglishPocket17={gloss:ep17Glosses,mastery:ep17Mastery,scenarios:EP17_CANADA.length};
