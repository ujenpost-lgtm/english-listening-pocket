/* English Pocket 18.0 — focused A2+ → B1 learning, completely local (except external video links).
 * This file extends v17 without resetting books, cards, or SRS history.
 */
'use strict';
const EP18={dictKey:'elp-18-dictionary', checksKey:'elp-18-progress-checks', practiceKey:'elp-18-practice', videoKey:'elp-18-video-lessons',dialogueKey:'elp-18-dialogues',lastPracticeId:null,mode:'context',recording:null,recordUrl:null};
const EP18_LOCAL=[
['appointment','запис на прийом','I have a doctor’s appointment tomorrow.'],['available','доступний; вільний','Is this apartment still available?'],['address','адреса','Could you confirm your address?'],['application','заява; заявка','I submitted my application yesterday.'],['apply for','подавати заявку на','I want to apply for this job.'],['borrow','позичати у когось','Can I borrow a book?'],['lend','позичати комусь','Could you lend me a pen?'],['bill','рахунок до сплати','Could I have the bill, please?'],['cashier','касир','Please pay at the cashier.'],['change','решта; змінювати','Keep the change.'],['checkout','каса; оформлення покупки','Where is the checkout?'],['commute','щоденна поїздка на роботу','My commute takes forty minutes.'],['comfortable','зручний; комфортний','These shoes are comfortable.'],['confirm','підтвердити','Please confirm the meeting time.'],['cost','коштувати; вартість','How much does it cost?'],['customer','покупець; клієнт','The customer needs some help.'],['deposit','застава; депозит','How much is the deposit?'],['directions','вказівки маршруту','Could you give me directions?'],['downtown','центр міста','I work downtown.'],['due','належний до сплати; запланований','The rent is due on Friday.'],['employer','роботодавець','My employer sent me an email.'],['employee','працівник','She is an employee at the bank.'],['experience','досвід','I have experience in customer service.'],['explain','пояснювати','Could you explain that again?'],['fill in','заповнювати','Please fill in this form.'],['find out','з’ясувати','I need to find out the price.'],['form','бланк; форма','Please complete this form.'],['grocery store','продуктовий магазин','I am going to the grocery store.'],['health card','медична картка / страхова картка','Do I need to bring my health card?'],['improve','покращувати','I want to improve my English.'],['insurance','страхування','Does the price include insurance?'],['intersection','перехрестя','Turn right at the next intersection.'],['interview','співбесіда','I have a job interview tomorrow.'],['landlord','орендодавець','I need to call my landlord.'],['lease','договір оренди','We signed a one-year lease.'],['library','бібліотека','I borrowed a book from the library.'],['neighbour','сусід','My neighbour is very friendly.'],['notice','повідомлення; помічати','I received a notice from the landlord.'],['payment','платіж','Can I make a payment online?'],['paycheque','зарплатний чек / виплата зарплати','I receive my paycheque every two weeks.'],['pharmacy','аптека','Is there a pharmacy nearby?'],['prescription','рецепт на ліки','I need to pick up a prescription.'],['refund','повернення грошей','Could I get a refund?'],['receipt','квитанція; чек','Could I have a receipt?'],['rent','орендна плата; орендувати','How much is the rent?'],['repair','ремонт; ремонтувати','The landlord will repair the sink.'],['reschedule','перенести на інший час','Can we reschedule the appointment?'],['return','повертати; повернення','I want to return this item.'],['schedule','розклад','What is your work schedule?'],['shift','робоча зміна','My shift starts at nine.'],['sidewalk','тротуар','Walk along the sidewalk.'],['sign','підписувати; знак','Please sign here.'],['subway','метро','Is there a subway station nearby?'],['takeout','їжа на виніс','Can I order takeout?'],['tenant','орендар','The tenant pays rent every month.'],['transfer','пересадка; переказ','Do I need to transfer to another bus?'],['utilities','комунальні послуги','Are utilities included in the rent?'],['vacancy','вакансія; вільне місце','Do you have any vacancies?'],['wait in line','стояти в черзі','We had to wait in line.'],['walk-in clinic','клініка без попереднього запису','There is a walk-in clinic nearby.'],['within walking distance','у пішій доступності','The store is within walking distance.'],['work permit','дозвіл на роботу','Do I need a work permit?'],['take the bus','їхати автобусом','I usually take the bus to work.'],['get off','виходити з транспорту','Get off at the next stop.'],['get on','сідати в транспорт','Get on the bus here.'],['make an appointment','записатися на прийом','I need to make an appointment.'],['make a deposit','внести депозит','I need to make a deposit at the bank.'],['pick up','забирати; підбирати','I will pick up the package tomorrow.'],['pick up a prescription','забрати ліки за рецептом','I need to pick up a prescription.'],['look for','шукати','I am looking for a new apartment.'],['look forward to','чекати з нетерпінням','I look forward to meeting you.'],['run out of','вичерпати запас чогось','We ran out of milk.'],['put up with','терпіти, миритися','I cannot put up with the noise.'],['get along with','добре ладнати','I get along with my neighbours.'],['come across','випадково натрапити','I came across an interesting book.'],['cut down on','скоротити споживання','I am trying to cut down on sugar.'],['cut back on','скоротити витрати / вживання','I need to cut back on spending.'],['every now and then','час від часу','I call my friends every now and then.'],['in case','на випадок, якщо','Take an umbrella in case it rains.'],['just in case','про всяк випадок','I saved the number just in case.'],['on time','вчасно','The bus arrived on time.'],['by the way','до речі','By the way, are you free tomorrow?'],['as soon as possible','якомога швидше','Please reply as soon as possible.'],['I would like to','я хотів би / хотіла б','I would like to book an appointment.'],['could you please','чи не могли б ви','Could you please speak more slowly?'],['what do you mean','що ви маєте на увазі','Sorry, what do you mean?'],['I am not sure','я не впевнений / впевнена','I am not sure about the time.'],['it depends on','це залежить від','It depends on the weather.'],['how much is it','скільки це коштує','How much is it?'],['where can I find','де я можу знайти','Where can I find the station?'],['I need help','мені потрібна допомога','Excuse me, I need help.'],['what time does it open','о котрій відкривається','What time does it open?'],['how do I get to','як мені дістатися до','How do I get to the library?'],['I have been living here','я живу тут уже певний час','I have been living here for six months.'],['I am used to','я звик(ла) до','I am used to cold weather.'],['I would rather','я б волів / воліла','I would rather take the bus.']
];
function ep18Basic(t){return ep17Normalize(t).replace(/\s+/g,' ').trim()}
const EP18DICT=new Map(EP18_LOCAL.map(([en,uk,example])=>[ep18Basic(en),{text:en,meaning:uk,example,rank:1}]));
const ep18OriginalMeaning=offlineMeaning;
offlineMeaning=function(text){const k=ep18Basic(text);return ep18OriginalMeaning(text)||EP18DICT.get(k)?.meaning||''};
function ep18Find(text){let k=ep18Basic(text),v=ep17Dict().get(k)||EP18DICT.get(k);if(v)return v;
 const suffix=[[/ies$/,'y'],[/es$/,''],[/s$/,''],[/ing$/,''],[/ed$/,''],[/ing$/,'e'],[/ed$/,'e']];if(k.includes(' '))return null;
 for(const [rx,replace] of suffix){const b=k.replace(rx,replace);if(b!==k){v=ep17Dict().get(b)||EP18DICT.get(b);if(v)return {...v,related:true}}}
 return null;
}
function ep18Gloss(text,limit=5){const s=' '+ep18Basic(text)+' ',found=[];
 const all=new Map([...EP18DICT,...ep17Dict()]);for(const [k,val] of [...all].sort((a,b)=>b[0].length-a[0].length)){
 if(k.length<4||!s.includes(' '+k+' '))continue;
 if(found.some(x=>x.text.toLowerCase().includes(k)||k.includes(x.text.toLowerCase())))continue;
 found.push(val);if(found.length>=limit)break;
 }return found;
}
const ep18BaseReaderLookup=readerLookup;
readerLookup=function(text,context=''){ep18BaseReaderLookup(text,context);const existing=wordMatch(text);if(existing){const now=Date.now();if(now-Number(existing.ep18LastSeen||0)>300000){existing.ep18Seen=(Number(existing.ep18Seen)||0)+1;existing.ep18LastSeen=now;saveWords()}}
 const found=ep18Find(text);if(found){$('trayMeaning').value=$('trayMeaning').value||found.meaning;$('trayStatus').textContent='Локальна підказка — перевір значення в контексті';}
 const box=$('ep17Glosses');if(box){box.replaceChildren();const exact=ep18Basic(text),bits=ep18Gloss(text,4).filter(v=>ep18Basic(v.text)!==exact);if(bits.length){box.append(node('div','ep17-gloss-caption','Відомі вирази в цьому тексті:'));for(const p of bits){const line=node('div','ep17-gloss-row');line.append(node('strong','',p.text),node('span','',p.meaning));box.append(line)}}}
};
// Enrich dictionary lookup and context preservation without interrupting reading.
const ep18OldTraySave=$('traySave').onclick;
$('traySave').onclick=function(){const v=trayValue?{...trayValue}:null;ep18OldTraySave();if(v){const w=wordMatch(v.text);if(w){w.ep18Seen=Math.max(1,Number(w.ep18Seen)||0);if(!w.example&&v.context)w.example=v.context;saveWords()}}};
// Choose new words by level, book origin, meaningful context and repeated encounters.
const ep18PreviousCandidates=newCandidates;
newCandidates=function(){const arr=ep18PreviousCandidates();return arr.sort((a,b)=>{
 const rank=w=>{const level=w.level==='A2+'?0:w.level==='B1'?1:w.level==='B2'?4:2;
 const fromBook=sourceType(w)==='book'? -1:0;
 const context=w.example?-0.3:0;
 const encountered=-Math.min(4,Number(w.ep18Seen)||0)*0.3;
 return level+fromBook+context+encountered;
 };return rank(a)-rank(b)||(Number(a.created)||0)-(Number(b.created)||0)
})};
const ep18LessonRender=renderLesson;
renderLesson=function(){ep18LessonRender();const flow=$('lessonFlow');if(!flow||dueView)return;const s=lessonForToday();if(!s){const existing=flow.querySelector('.focus-start');if(existing){const due=availableReview().length;const txt=due>=15?'Сьогодні багато повторень: можеш обрати 3 нові фрази або обійтися без них.':due>=7?'Рекомендація: спочатку повтори старі, потім 3–5 нових.':'Першими йдуть фрази з твоєї книги та добірки A2+–B1.';existing.append(node('p','smallhint ep18-tip',txt))}}ep18UpdateFocus()};
function ep18FocusWords(){const s=lessonForToday();const current=s?.ids?.map(id=>words.find(w=>w.id===id)).filter(w=>w&&w.meaning)||[];if(current.length)return current;
 const due=availableReview(),weak=words.filter(w=>w.meaning&&(w.ep18Train?.wrong||0)>0).sort((a,b)=>(b.ep18Train?.wrong||0)-(a.ep18Train?.wrong||0));
 const selection=[];for(const w of [...due,...weak,...words.filter(w=>w.meaning&&w.example)]){if(!selection.some(x=>x.id===w.id))selection.push(w);if(selection.length>=10)break}return selection;
}
function ep18TrainUpdate(word,ok,type){if(!word)return;const d=word.ep18Train&&typeof word.ep18Train==='object'?word.ep18Train:{};d.attempts=(d.attempts||0)+1;d.correct=(d.correct||0)+(ok?1:0);d.wrong=(d.wrong||0)+(ok?0:1);d.last=Date.now();d.lastType=type;word.ep18Train=d;if(!ok&&word.srs){word.srs.due=Math.min(Number(word.srs.due)||Infinity,Date.now()+12*3600000);}
 if(typeof ep17Recall==='function')ep17Recall(word,ok,type);saveWords();trackPractice(ok,type);
}
function ep18Norm(t){return keyText(t).replace(/\b(i am)\b/g,"i'm").replace(/\b(do not)\b/g,"don't").replace(/\b(can not|cannot)\b/g,"can't").replace(/[’]/g,"'").replace(/[^\p{L}\p{N}' ]/gu,'').replace(/\s+/g,' ').trim()}
function ep18Match(a,b){return ep18Norm(a)===ep18Norm(b)}
function ep18Cloze(w){let ex=clean(w.example||''),i=ex.toLowerCase().indexOf(w.text.toLowerCase());if(i<0)return null;return ex.slice(0,i)+'_______'+ex.slice(i+w.text.length)}
let ep18Active=0,ep18SoundHidden=false;
function ep18FocusWord(){const batch=ep18FocusWords();ep18Active=Math.min(ep18Active,Math.max(0,batch.length-1));return batch[ep18Active]}
function ep18UpdateFocus(){const label=$('ep18FocusLabel');if(!label)return;const a=ep18FocusWords();label.textContent=a.length?`Практика зі своїми ${Math.min(10,a.length)} фразами`:'Спершу додай картки з перекладом'}
function ep18Next(){ep18Active=(ep18Active+1)%Math.max(1,ep18FocusWords().length);ep18SoundHidden=false;ep18RenderTrainer()}
function ep18RenderTrainer(){const el=$('ep18TrainingArea');if(!el)return;el.replaceChildren();const w=ep18FocusWord(),items=ep18FocusWords();if(!w){el.append(node('p','smallhint','Додай картки з перекладом — вони з’являться тут.'));return}
 const row=node('div','row between wrap');row.append(node('span','smallhint',`${ep18Active+1}/${items.length} · ${EP18.mode==='audio'?'Слуховий диктант':EP18.mode==='context'?'Контекст':'Вимова'}`),BTN('Інша фраза →',ep18Next,'btn alt small'));el.append(row);
 const card=node('div','ep18-trainer-card');el.append(card);
 if(EP18.mode==='context'){
  const blank=ep18Cloze(w);card.append(node('div','smallhint',blank?'Віднови пропущений вираз із книги':'Пригадай англійську фразу'),node('div','ep18-cue',blank||w.meaning));
  const ans=node('input','input');ans.placeholder='Англійською…';ans.autocapitalize='off';ans.autocomplete='off';ans.spellcheck=false;card.append(ans);
  const feed=node('div','ep18-feedback');card.append(feed);
  card.append(BTN('Перевірити',()=>{if(!ans.value.trim())return toast('Введи фразу');const ok=ep18Match(ans.value,w.text);feed.replaceChildren();feed.append(node('strong','',ok?'✓ Правильно':'Зразок: '+w.text));if(w.example)feed.append(node('p','smallhint','Із контексту: '+w.example));ep18TrainUpdate(w,ok,'context');card.append(BTN('Далі →',ep18Next,'btn alt small'))},'btn'));
 }else if(EP18.mode==='audio'){
  card.append(node('div','smallhint','Слухай, не дивлячись на текст, і запиши почуте. Можеш прослухати кілька разів.'));
  const ans=node('input','input');ans.placeholder='Що ти почув англійською?';ans.autocomplete='off';ans.autocapitalize='off';ans.spellcheck=false;
  const feed=node('div','ep18-feedback');
  card.append(BTN('🔊 Прослухати',()=>speakEnglish(w.text),'btn alt'),ans,BTN('Перевірити',()=>{if(!ans.value.trim())return toast('Введи почуту фразу');const ok=ep18Match(ans.value,w.text);feed.textContent=ok?'✓ Правильно':`Правильний варіант: ${w.text}`;ep18TrainUpdate(w,ok,'audio');if(w.example)feed.append(node('p','smallhint','Контекст: '+w.example));card.append(BTN('Наступна →',ep18Next,'btn alt small'))}),feed);
 }else{
  card.append(node('div','ep18-cue',w.text),node('p','smallhint',w.meaning));if(w.example)card.append(node('p','smallhint','У реченні: '+w.example));
  const player=node('audio');player.controls=true;player.hidden=true;player.style.width='100%';const info=node('p','smallhint','Запис залишається на пристрої в цій сесії. Оціни звучання на слух, без AI-балів.');
  const controls=node('div','row wrap');controls.append(BTN('🔊 Слухати',()=>speakEnglish(w.text),'btn alt small'));
  controls.append(BTN('● Записати себе',async()=>{if(EP18.recording){return toast('Запис уже триває')}if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)return toast('У цьому браузері запис недоступний');try{
   const stream=await navigator.mediaDevices.getUserMedia({audio:true});const recorder=new MediaRecorder(stream),chunks=[];EP18.recording={recorder,stream};recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());EP18.recording=null;if(EP18.recordUrl)URL.revokeObjectURL(EP18.recordUrl);EP18.recordUrl=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType||'audio/webm'}));player.src=EP18.recordUrl;player.hidden=false;info.textContent='Прослухай свій запис, потім зразок. Запис не завантажується на сервер.'};recorder.start();info.textContent='Запис триває. Вимов фразу й натисни «Зупинити».';
  }catch(err){toast('Доступ до мікрофона не надано або запис недоступний')}},'btn alt small'));
  controls.append(BTN('■ Зупинити',()=>{if(EP18.recording?.recorder.state==='recording')EP18.recording.recorder.stop();else toast('Зараз немає запису')},'btn ghost small'));
  controls.append(BTN('Наступна →',()=>{if(EP18.recording?.recorder.state==='recording')EP18.recording.recorder.stop();ep18Next()},'btn alt small'));
  card.append(controls,player,info);
 }
}
function ep18SetMode(mode){EP18.mode=mode;document.querySelectorAll('[data-ep18-mode]').forEach(x=>x.classList.toggle('active',x.dataset.ep18Mode===mode));ep18RenderTrainer()}
for(const b of document.querySelectorAll('[data-ep18-mode]'))b.addEventListener('click',()=>ep18SetMode(b.dataset.ep18Mode));
// Guided video watching. Actual video content remains on the original publisher site.
const BOB_VIDEOS=[
 {id:'bob-house',topic:'story',name:'Bob the Canadian — Around the House',source:'Bob the Canadian',level:'A2',desc:'Назви кімнат і предметів у канадському домі. Урок із англійськими субтитрами.',url:'https://www.youtube.com/watch?v=WHYMGNbPv2U'},
 {id:'bob-food',topic:'speaking',name:'Bob the Canadian — Ordering Food',source:'Bob the Canadian',level:'A2',desc:'Замовлення їжі в ресторанах і drive-through: корисні побутові репліки.',url:'https://www.youtube.com/watch?v=uUMPULuwdLI'},
 {id:'bob-canada',topic:'listening',name:'Bob the Canadian — About Canada',source:'Bob the Canadian',level:'B1',desc:'Знайомство з Канадою та повсякденною лексикою.',url:'https://www.youtube.com/watch?v=Ikc7jHLgHBo'}
];
for(const v of BOB_VIDEOS)if(!CATALOG.some(x=>x.id===v.id))CATALOG.push(v);
const EP18_GUIDES={
 'bob-house':{before:'Перед переглядом назви 3 кімнати англійською.',question:'Назви дві кімнати і два предмети, які ти побачив у будинку.',example:'I saw a kitchen, a bedroom, a fridge and a sink.'},
 'bob-food':{before:'Пригадай, як ввічливо замовити напій.',question:'Які два способи замовлення їжі показує Боб?',example:'Bob orders food at restaurants and through a drive-through.'},
 'bob-canada':{before:'Що ти знаєш про канадську культуру? Назви один факт.',question:'Назви одну нову деталь про Канаду та одну корисну фразу.',example:'I learned a new fact about Canada.'},
 'bc-a2-speaking':{before:'Пригадай привітання й одну ввічливу фразу.',question:'Яка репліка допомогла підтримати розмову?',example:'I can use this phrase when meeting someone.'},
 'voa-level1':{before:'Подумай, які теми виникають під час знайомства.',question:'Хто говорить і про що йдеться в переглянутому епізоді?',example:'The people are talking about everyday life.'}
};
function ep18VideoGuide(v){const area=$('ep17VideoPractice');area.replaceChildren();show('ep17VideoPractice');const old=parseLS(EP18.videoKey,{})[v.id]||{};
 const guide=EP18_GUIDES[v.id]||{before:'Перед відео подумай, які слова можуть знадобитися.',question:'Що ти зрозумів? Назви 2 конкретні деталі.',example:'The video is about everyday English.'};
 area.append(node('strong','',`Мініурок · ${v.name}`),node('p','smallhint','1 · ДО: '+guide.before),node('p','smallhint','2 · Дивись із англійськими субтитрами; повтори одну репліку вголос.'));
 const link=node('a','btn alt small','▶ Відкрити відео ↗');link.href=v.url;link.target='_blank';link.rel='noopener noreferrer';area.append(link);
 area.append(node('p','smallhint','3 · ПІСЛЯ: '+guide.question));const note=node('textarea','input');note.placeholder='1–2 прості речення англійською';note.rows=2;note.value=old.note||'';area.append(note);
 const model=node('p','smallhint','Можливий зразок відповіді: '+guide.example);model.hidden=true;area.append(BTN('Приклад відповіді',()=>{model.hidden=!model.hidden},'btn ghost small'),model);
 const line=node('div','ep17-video-inputs'),en=node('input','input'),uk=node('input','input');en.placeholder='Нова фраза з відео';uk.placeholder='Її значення українською';en.value=old.en||'';uk.value=old.uk||'';line.append(en,uk);area.append(line);
 const buttons=node('div','row wrap');buttons.append(BTN('Зберегти',()=>{const x=parseLS(EP18.videoKey,{});x[v.id]={date:Date.now(),note:clean(note.value),en:clean(en.value),uk:clean(uk.value)};putLS(EP18.videoKey,x);if(en.value.trim()&&uk.value.trim())mergeWords([{text:clean(en.value),meaning:clean(uk.value),source:'video:'+v.name,level:v.level}]);else if(en.value.trim())toast('Нотатку збережено; для картки додай переклад');show('ep17VideoPractice',false);toast('Мініурок збережено');drawVideos()},'btn'),BTN('Закрити',()=>show('ep17VideoPractice',false),'btn ghost small'));area.append(buttons);area.scrollIntoView({behavior:'smooth',block:'nearest'});
}
ep17VideoPractice=ep18VideoGuide;
// The original catalogue bound its listeners before v17 extended drawVideos.
// Add a final redraw on filter changes so guided exercises remain available.
for(const id of ['videoFilter','videoLevel','videoSearch'])$(id).addEventListener(id==='videoSearch'?'input':'change',()=>drawVideos());
// Canada life simulator: branching conversations with clear choices, no fake conversational AI.
const EP18_DIALOGUES=[
 {title:'Оренда квартири',level:'A2+',turns:[
  {other:'Hello! Are you calling about the apartment?',uk:'Так, мене цікавить квартира.',options:['Yes, I am interested in the apartment.','I buy a book.'],right:0,why:'I am interested in… — ввічливо про інтерес.'},
  {other:'Would you like to see it on Saturday?',uk:'Так, чи можу я прийти об 11-й?',options:['Yes. Could I come at eleven?','I came yesterday coffee.'],right:0,why:'Could I…? — ввічливе прохання.'},
  {other:'The rent is $1,600 a month. Any questions?',uk:'Чи включені комунальні послуги?',options:['Are utilities included?','Can you give me a prescription?'],right:0,why:'Are utilities included? — типове питання орендаря.'}]},
 {title:'Аптека',level:'A2+',turns:[
  {other:'Hi! How can I help you?',uk:'Мені потрібно забрати ліки за рецептом.',options:['I need to pick up a prescription.','I am looking for a job.'],right:0,why:'pick up a prescription = забрати ліки за рецептом.'},
  {other:'May I have your name, please?',uk:'Звичайно. Мене звати Алекс.',options:['Sure. My name is Alex.','I like to walk.'],right:0,why:'Sure. My name is… — природна ввічлива відповідь.'}]},
 {title:'Співбесіда',level:'B1',turns:[
  {other:'Can you tell me about your experience?',uk:'Я маю досвід у цій сфері.',options:['I have experience in this field.','I get off at the next stop.'],right:0,why:'have experience in… — стандартна конструкція.'},
  {other:'Do you have any questions about the job?',uk:'Розкажіть, будь ласка, більше про посаду.',options:['Could you tell me more about the role?','How much is the bus fare?'],right:0,why:'Could you tell me more…? — ввічливий стиль.'}]},
 {title:'У кафе',level:'A2+',turns:[
  {other:'Hi there! What can I get for you?',uk:'Можна мені каву, будь ласка?',options:['Could I have a coffee, please?','Please give me bank account.'],right:0,why:'Could I have…? — природне замовлення.'},
  {other:'Anything else?',uk:'Ні, дякую. Це все.',options:['No, thanks. That’s all.','Yes, I am a tenant.'],right:0,why:'That’s all. — цього достатньо.'}]},
 {title:'Транспорт',level:'A2+',turns:[
  {other:'Excuse me, can I help you?',uk:'Цей автобус їде до центру?',options:['Does this bus go downtown?','Do you have any vacancies?'],right:0,why:'Does this bus go…? — маршрут.'},
  {other:'Yes, it does. Your stop is next.',uk:'Дякую. Вийду на наступній зупинці.',options:['Thanks. I’ll get off at the next stop.','I want to pay a deposit.'],right:0,why:'get off at the next stop = вийти на наступній.'}]}
];
let ep18DialogIndex=0,ep18Turn=0,ep18DialogScore=0;
function ep18DrawDialogue(){const box=$('ep18DialogueBody');if(!box)return;box.replaceChildren();const d=EP18_DIALOGUES[ep18DialogIndex],q=d.turns[ep18Turn];box.append(node('div','kicker',`${d.level} · ${d.title} · ${ep18Turn+1}/${d.turns.length}`),node('div','ep18-cue','🇨🇦 '+q.other));
 box.append(BTN('🔊 Послухати співрозмовника',()=>speakEnglish(q.other),'btn alt small'),node('p','smallhint','Твоє завдання: '+q.uk));
 const options=[...q.options].map((v,i)=>({v,i})).sort((a,b)=>((ep18Turn+ep18DialogIndex)%2?b.i-a.i:a.i-b.i));
 const choices=node('div','ep18-choices');for(const o of options){const b=BTN(o.v,()=>{choices.querySelectorAll('button').forEach(x=>x.disabled=true);const correct=o.i===q.right;if(correct)ep18DialogScore++;
  const feedback=node('div','ep18-feedback',correct?'✓ Природна відповідь':'Співрозмовник: Sorry, I didn’t understand. Could you say that again?');feedback.append(node('p','smallhint',q.why));box.append(feedback);
  box.append(BTN('🔊 Відтворити правильну фразу',()=>speakEnglish(q.options[q.right]),'btn alt small'));
  if(!correct)box.append(BTN('Спробувати ще раз ↻',ep18DrawDialogue,'btn'));
  else box.append(BTN('Далі →',()=>{ep18Turn++;if(ep18Turn>=d.turns.length){const hist=parseLS(EP18.dialogueKey,[]);hist.push({name:d.title,date:Date.now(),correct:ep18DialogScore,total:d.turns.length});putLS(EP18.dialogueKey,hist.slice(-40));ep18Turn=0;ep18DialogScore=0;ep18DialogIndex=(ep18DialogIndex+1)%EP18_DIALOGUES.length}ep18DrawDialogue()},'btn'));
 },'btn alt ep18-answer-choice');choices.append(b)}box.append(choices);
 const foot=node('div','row wrap');foot.append(BTN('Інша ситуація',()=>{ep18DialogIndex=(ep18DialogIndex+1)%EP18_DIALOGUES.length;ep18Turn=0;ep18DialogScore=0;ep18DrawDialogue()},'btn ghost small'));
 foot.append(BTN('＋ Фраза в словник',()=>{const en=q.options[q.right];openCard({text:en,example:q.other,source:'canada:'+d.title});},'btn ghost small'));box.append(foot);
}
// Honest progress check: recognition is machine-scored; open speaking/writing is self-scored.
const EP18_CHECK_BANK=[
 {type:'mc',skill:'Reading',prompt:'The appointment was rescheduled for Friday. What happened?',options:['The time was changed.','The appointment was cancelled forever.','It happened yesterday.'],right:0},
 {type:'mc',skill:'Vocabulary',prompt:'Which phrase means «у пішій доступності»?',options:['within walking distance','on top of the world','out of the question'],right:0},
 {type:'audio',skill:'Listening',prompt:'Послухай і запиши фразу англійською.',answer:'Could you please speak more slowly?'},
 {type:'mc',skill:'Reading',prompt:'“Are utilities included in the rent?” What does the person want to know?',options:['Whether bills are part of the rent.','Whether there is a bus nearby.','Whether the lease is signed.'],right:0},
 {type:'audio',skill:'Listening',prompt:'Послухай і запиши фразу англійською.',answer:'I need to make an appointment.'},
 {type:'write',skill:'Writing',prompt:'Переклади англійською: «Я шукаю квартиру».',answer:'I am looking for an apartment.'},
 {type:'self',skill:'Speaking',prompt:'Уяви, що телефонуєш орендодавцю. Скажи, що тебе цікавить квартира, і запитай, чи вона доступна.',sample:'Hello. I am interested in the apartment. Is it still available?'},
 {type:'self',skill:'Speaking',prompt:'Поясни працівнику аптеки, що потрібно забрати ліки за рецептом.',sample:'Hello. I need to pick up a prescription.'}
];
let ep18CheckIndex=0,ep18Correct=0,ep18Answered=false;
function ep18CheckSave(){const history=parseLS(EP18.checksKey,[]);history.push({date:Date.now(),correct:ep18Correct,total:EP18_CHECK_BANK.length});putLS(EP18.checksKey,history.slice(-24))}
function ep18DrawCheck(){const box=$('ep18CheckBody');if(!box)return;box.replaceChildren();const history=parseLS(EP18.checksKey,[]),last=history.at(-1);
 if(ep18CheckIndex>=EP18_CHECK_BANK.length){ep18CheckSave();box.append(node('div','ep18-cue',`Результат: ${ep18Correct} / ${EP18_CHECK_BANK.length}`),node('p','smallhint','Це тренувальна самоперевірка, не сертифікат рівня B1. Повтори через два тижні й порівняй результати.'));ep18CheckIndex=0;ep18Correct=0;ep18Answered=false;return}
 if(ep18CheckIndex===0&&last){box.append(node('p','smallhint',`Попередня перевірка: ${new Date(last.date).toLocaleDateString('uk-UA')} · ${last.correct}/${last.total}. Наступна рекомендована через 14 днів.`))}
 const q=EP18_CHECK_BANK[ep18CheckIndex];box.append(node('div','kicker',`${ep18CheckIndex+1}/${EP18_CHECK_BANK.length} · ${q.skill}`),node('div','ep18-cue',q.prompt));const feedback=node('div','ep18-feedback');const next=()=>{ep18CheckIndex++;ep18Answered=false;ep18DrawCheck()};
 if(q.type==='mc'){const choices=node('div','ep18-choices');q.options.forEach((o,i)=>{choices.append(BTN(o,()=>{if(ep18Answered)return;ep18Answered=true;choices.querySelectorAll('button').forEach(x=>x.disabled=true);if(i===q.right)ep18Correct++;feedback.textContent=i===q.right?'✓ Правильно':'Правильна відповідь: '+q.options[q.right];box.append(feedback,BTN('Далі →',next,'btn'))},'btn alt ep18-answer-choice'))});box.append(choices)}
 else if(q.type==='audio'||q.type==='write'){if(q.type==='audio')box.append(BTN('🔊 Послухати',()=>speakEnglish(q.answer),'btn alt small'));const input=node('textarea','input');input.rows=2;input.autocapitalize='off';input.spellcheck=false;box.append(input);box.append(BTN('Перевірити',()=>{if(ep18Answered)return;ep18Answered=true;const ok=ep18Match(input.value,q.answer);if(ok)ep18Correct++;feedback.textContent=(ok?'✓ Правильно':'Зразок: '+q.answer);box.append(feedback,BTN('Далі →',next,'btn'))},'btn'))}
 else{const input=node('textarea','input');input.rows=2;input.placeholder='Скажи вголос, а за бажанням запиши свою відповідь';box.append(input);const sample=node('p','smallhint',q.sample);sample.hidden=true;box.append(BTN('Показати зразок',()=>{sample.hidden=false;box.append(BTN('Вийшло самостійно',()=>{ep18Correct++;next()},'btn alt small'),BTN('Потрібна практика',next,'btn ghost small'))},'btn'),sample)}
}
function ep18DrawStats(){const box=$('ep18Stats');if(!box)return;box.replaceChildren();const checks=parseLS(EP18.checksKey,[]),last=checks.at(-1),dialogue=parseLS(EP18.dialogueKey,[]);
 const attempted=words.filter(w=>w.ep18Train?.attempts).length,retained=words.filter(w=>typeof ep17Mastery==='function'&&ep17Mastery(w)==='mastered').length;
 box.append(node('span','smallhint',`Активно тренував: ${attempted} · Засвоєно через різні дні: ${retained} · Діалоги: ${dialogue.length}`));if(last)box.append(node('span','smallhint',` · Контроль: ${last.correct}/${last.total}`))
}
function ep18RenderAll(){ep18UpdateFocus();ep18RenderTrainer();ep18DrawStats()}
const ep18OldChoose=chooseWordTab;chooseWordTab=function(tab){ep18OldChoose(tab);if(tab==='review')ep18RenderAll()};
const ep18OldNav=nav;nav=function(tab){ep18OldNav(tab);if(tab==='words')ep18RenderAll()};
const ep18OldSaveWords=saveWords;saveWords=function(){ep18OldSaveWords();ep18UpdateFocus()};
// Avoid orphaned microphone recording on page unload.
window.addEventListener('pagehide',()=>{try{EP18.recording?.stream.getTracks().forEach(t=>t.stop())}catch{}if(EP18.recordUrl)URL.revokeObjectURL(EP18.recordUrl)});
$('ep18DialogueStart').onclick=()=>{ep18DrawDialogue()};
$('ep18CheckStart').onclick=()=>{ep18CheckIndex=0;ep18Correct=0;ep18Answered=false;ep18DrawCheck()};
ep18RenderAll();
window.EnglishPocket18={find:ep18Find,focus:ep18FocusWords,dialogues:EP18_DIALOGUES.length,videos:BOB_VIDEOS.length};
