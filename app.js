/* English Pocket 13.0: one reader, one card store, one video catalog. No AI / translation API. */
'use strict';
const $=id=>document.getElementById(id);
const K={words:'elp-words-v2',reader:'elp-reader-settings-v2',lastBook:'elp-last-book-v2',daily:'elp-13-daily',videos:'elp-13-videos',reviewConfig:'elp-14-review-config',practiceLog:'elp-14-practice-log',lesson:'elp-15-focused-lesson'};
const parseLS=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch{return fallback}};
const putLS=(key,obj)=>{try{localStorage.setItem(key,JSON.stringify(obj));return true}catch{toast('Не вистачає місця. Збережи резервну копію.');return false}};
const uuid=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():'pocket-'+Date.now()+'-'+Math.random().toString(36).slice(2);
const node=(tag,cls='',value)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el};
const BTN=(txt,fn,cls='btn alt small')=>{const b=node('button',cls,txt);b.type='button';b.addEventListener('click',fn);return b};
const show=(id,state=true)=>$(id).hidden=!state;
const clean=(x)=>String(x??'').replace(/\s+/g,' ').trim();
const keyText=(x)=>clean(x).normalize('NFKC').toLocaleLowerCase('en-US');
let toastTimer;function toast(msg){const t=$('toast');t.textContent=msg;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,3500)}
let activeTab='read',wordTab='list';
function nav(tab){activeTab=tab;for(const name of ['read','words','watch'])$(name+'Pane').classList.toggle('active',name===tab);document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));if(tab==='read')drawShelf();if(tab==='words')drawWords();if(tab==='watch')drawVideos();window.scrollTo(0,0)}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.tab)));
function chooseWordTab(next){wordTab=next;document.querySelectorAll('[data-wordtab]').forEach(b=>b.classList.toggle('active',b.dataset.wordtab===next));['list','review','practice'].forEach(x=>show(({list:'wordListPane',review:'reviewPane',practice:'practicePane'})[x],x===next));if(next==='list')drawWordList();if(next==='review')drawReview();if(next==='practice')drawPractice()}
document.querySelectorAll('[data-wordtab]').forEach(b=>b.addEventListener('click',()=>chooseWordTab(b.dataset.wordtab)));

// Compatible with older English Pocket words and with our 80-card en/uk/context JSON.
const normalizeWord=(w)=>{if(!w||typeof w!=='object')return null;const text=clean(w.text??w.en),meaning=clean(w.meaning??w.uk),example=clean(w.example??w.context);if(!text||text.length>300)return null;const out={...w,id:String(w.id||uuid()),text,meaning,example,source:w.source||'',created:Number(w.created)||Date.now()};if(w.srs&&typeof w.srs==='object')out.srs={...w.srs};else if(Number(w.reps)>0&&Number(w.interval)>0)out.srs={step:Math.max(1,Math.min(9,Number(w.reps))),due:Number(w.due)||0,last:Number(w.created)||Date.now()};return out};
let words=(Array.isArray(parseLS(K.words,[]))?parseLS(K.words,[]):[]).map(normalizeWord).filter(Boolean);
const wordMatch=text=>words.find(x=>keyText(x.text)===keyText(text));
const mastery=w=>!w.srs?'new':(Number(w.srs.interval)>=21&&Number(w.srs.streak)>=5?'mastered':'learning');
const wordBookSource=w=>sourceType(w)==='book'?clean(String(w.source||'').slice(5)):'';
const statsLog=()=>parseLS(K.practiceLog,[]);
function saveWords(){if(putLS(K.words,words)){drawWordStats();if(wordTab==='list')drawWordList()}}
function mergeWords(input){let added=0,updated=0;for(const candidate of input){const w=normalizeWord(candidate);if(!w)continue;const old=wordMatch(w.text);if(!old){words.push(w);added++}else{let changed=false;for(const p of ['meaning','example','note']){if(!old[p]&&w[p]){old[p]=w[p];changed=true}}if(!old.srs&&w.srs){old.srs=w.srs;changed=true}if(!old.source&&w.source){old.source=w.source;changed=true}if(w.favorite&&!old.favorite){old.favorite=true;changed=true}if(changed)updated++}}saveWords();return {added,updated}}
function sourceType(w){const s=String(w.source||'').toLowerCase();return s.startsWith('book:')||s.includes('epub')?'book':s.startsWith('video:')?'video':'other'}
let editingId=null,sourceForCard='';
function openCard(candidate={},id=null){
 const word=id?words.find(w=>w.id===id):wordMatch(candidate.text||'');
 editingId=word?.id||null;sourceForCard=word?.source||candidate.source||'';
 $('cardDialogTitle').textContent=word?'Редагувати картку':'Нова картка';
 $('cardText').value=word?.text||candidate.text||'';
 $('cardMeaning').value=word?.meaning||candidate.meaning||'';
 $('cardExample').value=word?.example||candidate.example||'';
 $('cardNote').value=word?.note||candidate.note||'';
 $('cardFavorite').checked=!!word?.favorite;
 $('cardSource').textContent=sourceForCard?'Звідки: '+sourceForCard.replace(/^book:|^video:/,'').slice(0,140):'Моя картка';
 $('cardDialog').showModal();
 if(!candidate.text)setTimeout(()=>$('cardText').focus(),70);
}
$('cancelCard').onclick=()=>$('cardDialog').close();
$('cardForm').addEventListener('submit',e=>{
 e.preventDefault();const text=clean($('cardText').value),meaning=clean($('cardMeaning').value),example=clean($('cardExample').value),note=clean($('cardNote').value),favorite=$('cardFavorite').checked;
 if(!text)return;
 const collision=words.find(w=>keyText(w.text)===keyText(text)&&w.id!==editingId);
 if(collision){toast('Фраза вже є. Знайди її в «Мої картки».');return}
 const old=words.find(w=>w.id===editingId);
 if(old)Object.assign(old,{text,meaning,example,note,favorite});
 else words.unshift({id:uuid(),text,meaning,example,note,favorite,source:sourceForCard,created:Date.now()});
 $('cardDialog').close();saveWords();toast(old?'Картку оновлено':'Картку додано');if(activeTab==='read')refreshHighlights();
});
$('newWord').onclick=()=>openCard();
function drawWordStats(){
 const now=Date.now(),due=words.filter(w=>w.meaning&&w.srs&&(!w.srs.due||Number(w.srs.due)<=now)).length;
 const done=words.filter(w=>mastery(w)==='mastered').length;
 const log=statsLog().slice(-120);const correct=log.filter(x=>x.correct===true).length;
 const area=$('wordStats');area.replaceChildren();
 const dash=$('wordDashboard');dash.replaceChildren();
 for(const [n,label] of [[words.length,'карток'],[due,'повторити'],[done,'засвоєно']]){
  const block=node('div','metric');block.append(node('strong','',String(n)),node('span','',label));dash.append(block);
 }
 if(log.length)area.append(node('span','',`Точність самоперевірок: ${Math.round(correct/log.length*100)}% (${log.length} відповідей)`));
 else area.append(node('span','',`Картки з перекладом: ${words.filter(w=>w.meaning).length} · Без перекладу: ${words.filter(w=>!w.meaning).length}`));
}
function refillBookFilter(){const sel=$('wordBookFilter'),keep=sel.value;
 const names=[...new Set(words.map(wordBookSource).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'uk'));
 sel.replaceChildren(new Option('Усі книги','all'));
 names.forEach(n=>sel.add(new Option(n.length>36?n.slice(0,33)+'…':n,n)));
 sel.value=names.includes(keep)?keep:'all';
}
let listLimit=20;
$('wordSearch').addEventListener('input',()=>{listLimit=20;drawWordList()});
$('wordFilter').onchange=()=>{listLimit=20;drawWordList()};
$('wordBookFilter').onchange=()=>{listLimit=20;drawWordList()};
function drawWordList(){
 const list=$('wordsList'),q=keyText($('wordSearch').value),f=$('wordFilter').value,bf=$('wordBookFilter').value;
 const selected=words.filter(w=>{
  const stateOk=f==='all'||(f==='favorite'?!!w.favorite:['new','learning','mastered'].includes(f)?mastery(w)===f:sourceType(w)===f);
  return stateOk&&(bf==='all'||wordBookSource(w)===bf)&&keyText(w.text+' '+w.meaning+' '+w.example+' '+(w.note||'')).includes(q);
 });
 list.replaceChildren();$('wordTotal').textContent=selected.length+' карток';
 if(!selected.length){list.append(node('div','empty',words.length?'За цим фільтром карток немає.':'Картки з’являться тут. Натисни «Додати» або збережи фразу в книзі.'));return}
 for(const w of selected.slice(0,listLimit)){
  const item=node('div','worditem'),content=node('div','worditem-content');
  content.append(node('div','wordtext',(w.favorite?'☆ ':'')+w.text),node('div','wordmeaning',w.meaning||'Додай переклад →'));
  if(w.example)content.append(node('div','wordexample',w.example));
  if(w.note)content.append(node('div','wordexample','Нотатка: '+w.note));
  content.append(node('div','pill',({new:'Нова',learning:'Вивчаю',mastered:'Засвоєна'})[mastery(w)]+' · '+(wordBookSource(w)||sourceType(w)==='video'?'відео':'мій словник')));
  content.addEventListener('click',()=>openCard({},w.id));
  const actions=node('div','mini-actions');
  actions.append(BTN('Змінити',()=>openCard({},w.id)));
  actions.append(BTN('×',()=>{if(!confirm('Видалити «'+w.text+'»?'))return;words=words.filter(x=>x.id!==w.id);saveWords();toast('Картку видалено')},'btn ghost small'));
  item.append(content,actions);list.append(item);
 }
 if(selected.length>listLimit){const more=BTN('Ще 20 карток ↓',()=>{listLimit+=20;drawWordList()},'btn alt');more.style.width='100%';list.append(more)}
}
function drawWords(){drawWordStats();refillBookFilter();chooseWordTab(wordTab)}

// SRS: due cards before new cards, limit 5 first-time cards/day. Existing SRS dates retained.
const DAY=86400000;
const dateKey=()=>{let d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
let reviewPrefs={daily:5,direction:'mixed',...parseLS(K.reviewConfig,{})};
$('dailyLimit').value=String(reviewPrefs.daily);
$('reviewDirection').value=reviewPrefs.direction;
for(const id of ['dailyLimit','reviewDirection'])$(id).onchange=()=>{reviewPrefs={daily:Number($('dailyLimit').value),direction:$('reviewDirection').value};putLS(K.reviewConfig,reviewPrefs);currentReviewId=null;drawReview()};
function dailyState(){let d=parseLS(K.daily,{day:'',started:[]});if(d.day!==dateKey()){d={day:dateKey(),started:[]};putLS(K.daily,d)}return d}
let currentReviewId=null,answerVisible=false;
function availableReview(){
 const now=Date.now();
 const due=words.filter(w=>w.meaning&&w.srs&&(!w.srs.due||Number(w.srs.due)<=now)).sort((a,b)=>(Number(a.srs.due)||0)-(Number(b.srs.due)||0));
 const d=dailyState(),allow=Math.max(0,reviewPrefs.daily-d.started.length);
 const fresh=words.filter(w=>w.meaning&&!w.srs).slice(0,allow);
 return [...due,...fresh];
}
function reviewFront(w){const dir=reviewPrefs.direction==='mixed'?(Number(w.srs?.reps||0)%2?'uk':'en'):reviewPrefs.direction;return dir==='uk'?{cue:w.meaning,label:'Пригадай англійську фразу',answer:w.text}:{cue:w.text,label:'Пригадай українське значення',answer:w.meaning}}
function drawReview(){
 const box=$('reviewBox');box.replaceChildren();const due=availableReview(),w=due.find(x=>x.id===currentReviewId)||due[0];
 if(!w){currentReviewId=null;box.append(node('div','empty',words.length?'Усе повторено на сьогодні. Нові картки доступні завтра.':'Додай картки з перекладами, щоб почати SRS.'));return}
 if(w.id!==currentReviewId){currentReviewId=w.id;answerVisible=false}
 const d=dailyState(),front=reviewFront(w);
 const info=node('p','smallhint',`Нових сьогодні: ${d.started.length}/${reviewPrefs.daily} · Повторень зараз: ${due.filter(x=>x.srs).length}`);
 const card=node('div','studycard');card.append(node('div','smallhint',front.label),node('div','studytitle',front.cue));
 if(answerVisible){card.append(node('div','answer',front.answer));if(w.example)card.append(node('div','studyexample',w.example));if(w.note)card.append(node('div','studyexample',w.note))}
 const controls=node('div','studycontrols review-ratings');
 if(!answerVisible)controls.append(BTN('Показати відповідь',()=>{answerVisible=true;drawReview()},'btn'));
 else for(const [grade,label,style] of [[0,'Знову','btn alt small'],[1,'Важко','btn alt small'],[2,'Добре','btn small'],[3,'Легко','btn small']])controls.append(BTN(label,()=>rateReview(grade),style));
 box.append(info,card,controls);
}
function rateReview(grade){
 const w=words.find(x=>x.id===currentReviewId);if(!w||!answerVisible)return;
 const now=Date.now(),d=dailyState();
 if(!w.srs&&!d.started.includes(w.id)){d.started.push(w.id);putLS(K.daily,d)}
 const prev=w.srs||{},streak=grade===0?0:(Number(prev.streak)||0)+1;
 let ease=Math.min(3,Math.max(1.3,Number(prev.ease)||2.4)),interval=Number(prev.interval)||0;
 if(grade===0){interval=10/1440;ease=Math.max(1.3,ease-.2)}
 if(grade===1){interval=Math.max(.5,interval*1.2||.5);ease=Math.max(1.3,ease-.12)}
 if(grade===2){interval=interval<1?1:Math.round(interval*ease*10)/10}
 if(grade===3){interval=interval<1?4:Math.round(interval*ease*1.3*10)/10;ease=Math.min(3,ease+.12)}
 interval=Math.min(365,interval);
 w.srs={...prev,step:streak,due:now+interval*DAY,last:now,interval,ease,streak,
  reps:(Number(prev.reps)||0)+1,lapses:(Number(prev.lapses)||0)+(grade===0?1:0)};
 trackPractice(grade>=2,'srs');currentReviewId=null;answerVisible=false;saveWords();drawReview();
}

// Retrieval practice: meaning -> write phrase, or cloze from a stored example.
let currentPracticeId=null,practiceMode=0,practiceSession=0;
function trackPractice(correct,type){const data=statsLog();data.push({at:Date.now(),correct:!!correct,type});putLS(K.practiceLog,data.slice(-500));drawWordStats()}
function practiceCandidates(){return words.filter(w=>w.meaning&&w.text)}
function nextPractice(){const arr=practiceCandidates();if(!arr.length)return;practiceSession++;const rest=arr.filter(x=>x.id!==currentPracticeId);currentPracticeId=(rest.length?rest:arr)[Math.floor(Math.random()*(rest.length||arr.length))].id;drawPractice()}
function exerciseCloze(w){if(!w.example)return null;const p=w.example.toLowerCase().indexOf(w.text.toLowerCase());if(p<0)return null;return w.example.slice(0,p)+'_______'+w.example.slice(p+w.text.length)}
$('practiceType').onchange=()=>{practiceMode=0;drawPractice()};
function drawPractice(){
 const box=$('practiceBox');box.replaceChildren();const arr=practiceCandidates();if(!arr.length){box.append(node('div','empty','Додай картку з перекладом, щоб почати практику.'));return}
 let w=arr.find(x=>x.id===currentPracticeId)||arr[0];currentPracticeId=w.id;
 const cloze=exerciseCloze(w),wanted=$('practiceType').value;
 let mode=wanted==='mix'?['translate',cloze?'cloze':'sentence','sentence'][practiceSession%3]:wanted;
 if(mode==='cloze'&&!cloze)mode='translate';
 const card=node('div','box');
 card.append(node('div','kicker',mode==='cloze'?'Заповни пропуск':mode==='sentence'?'Склади власне речення':'Відтвори фразу'));
 card.append(node('div','studytitle',mode==='cloze'?cloze:mode==='sentence'?w.text:w.meaning));
 card.append(node('p','smallhint',mode==='sentence'?'Напиши своє речення з цією фразою, потім порівняй зі зразком.': 'Введи потрібну фразу англійською.'));
 const input=node('textarea','input');input.placeholder=mode==='sentence'?'Моє речення англійською…':'Фраза англійською…';input.rows=2;card.append(input);
 const output=node('div','spaced');const controls=node('div','studycontrols');let answered=false;
 const check=BTN(mode==='sentence'?'Показати зразок':'Перевірити',()=>{
  if(answered)return;answered=true;const answer=clean(input.value);if(!answer){answered=false;toast('Спочатку введи відповідь');return}
  const correct=mode==='sentence'?null:keyText(answer).replace(/[.!?]+$/,'')===keyText(w.text).replace(/[.!?]+$/,'');
  output.replaceChildren();
  if(mode==='sentence')output.append(node('div','smallhint','Самоперевірка: чи є потрібна фраза й чи звучить речення природно?'));
  else output.append(node('div','wordmeaning',correct?'✓ Збігається з карткою':'Еталон: '+w.text));
  if(w.example)output.append(node('div','wordexample','Приклад: '+w.example));
  if(w.note)output.append(node('div','wordexample',w.note));
  if(mode==='sentence'){
   const feedback=node('div','studycontrols');feedback.append(BTN('Потрібно повторити',()=>{trackPractice(false,'sentence');nextPractice()},'btn alt'),BTN('Вдалося ✓',()=>{trackPractice(true,'sentence');nextPractice()},'btn'));output.append(feedback);
  }else trackPractice(correct,'practice');
 });
 controls.append(check,BTN('Наступна →',nextPractice,'btn alt'));card.append(controls,output);box.append(card);
}

// Same IndexedDB book store as v11/12: existing books and positions are kept.
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open('english-pocket-library',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('books'))req.result.createObjectStore('books',{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function dbOp(mode,cb){const db=await openDB();return new Promise((resolve,reject)=>{let tx=db.transaction('books',mode),req=cb(tx.objectStore('books'));req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();tx.onerror=()=>reject(tx.error)})}
const dbList=()=>dbOp('readonly',st=>st.getAll());const dbGet=id=>dbOp('readonly',st=>st.get(id));const dbPut=b=>dbOp('readwrite',st=>st.put(b));const dbDelete=id=>dbOp('readwrite',st=>st.delete(id));
function plainHtml(input){let doc=new DOMParser().parseFromString(input,'text/html');doc.querySelectorAll('script,style,iframe,svg,noscript,nav,footer,form').forEach(x=>x.remove());let ps=[...doc.body.querySelectorAll('h1,h2,h3,h4,p,li,blockquote,pre')].filter(x=>!x.parentElement.closest('p,li,blockquote,pre'));const vals=ps.map(x=>clean(x.textContent)).filter(Boolean);return vals.length?vals:[clean(doc.body.textContent)].filter(Boolean)}
function textChapters(s){let paras=s.replace(/\r\n?/g,'\n').split(/\n\s*\n/).flatMap(p=>p.length>4000?(p.match(/[\s\S]{1,1800}(?:\s|$)/g)||[p]):[p]).map(clean).filter(Boolean);if(!paras.length)throw Error('У файлі немає тексту');let out=[];for(let i=0;i<paras.length;i+=60)out.push({title:'Частина '+(out.length+1),paragraphs:paras.slice(i,i+60)});return out}
function zipEntries(buffer){const bytes=new Uint8Array(buffer),dv=new DataView(buffer);let end=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(dv.getUint32(i,true)===0x06054b50){end=i;break}}if(end<0)throw Error('EPUB: ZIP пошкоджений');let at=dv.getUint32(end+16,true),count=dv.getUint16(end+10,true),map=new Map();const decoder=new TextDecoder();if(count>15000)throw Error('EPUB: забагато файлів');for(let i=0;i<count;i++){if(dv.getUint32(at,true)!==0x02014b50)throw Error('EPUB: ZIP каталог некоректний');const method=dv.getUint16(at+10,true),size=dv.getUint32(at+20,true),len=dv.getUint16(at+28,true),extra=dv.getUint16(at+30,true),comment=dv.getUint16(at+32,true),local=dv.getUint32(at+42,true);let name=decoder.decode(bytes.slice(at+46,at+46+len));map.set(name,{method,size,local});at+=46+len+extra+comment}return {bytes,dv,map}}
function unzipBytes(zip,path,limit=7*1024*1024){
 const entry=zip.map.get(path);if(!entry)throw Error('EPUB: немає файлу '+path);
 const {dv,bytes}=zip,p=entry.local;if(dv.getUint32(p,true)!==0x04034b50)throw Error('EPUB: некоректний ZIP');
 const from=p+30+dv.getUint16(p+26,true)+dv.getUint16(p+28,true);
 if(entry.size>limit*2)throw Error('Завеликий файл у EPUB');
 const raw=bytes.slice(from,from+entry.size);let result;
 if(entry.method===0)result=raw;
 else if(entry.method===8){if(typeof pako==='undefined')throw Error('Локальний ZIP-модуль не завантажився');result=pako.inflateRaw(raw)}
 else throw Error('Стиснення EPUB не підтримується');
 if(result.length>limit)throw Error('Завеликий розпакований файл у EPUB');return result;
}
async function unzipText(zip,path){return new TextDecoder('utf-8').decode(unzipBytes(zip,path));}

function resolveZip(base,relative){let f=decodeURIComponent(relative.split('#')[0].split('?')[0]);if(f.startsWith('/'))return f.slice(1);const out=[];for(const seg of (base.split('/').slice(0,-1).join('/')+'/'+f).split('/')){if(seg==='..')out.pop();else if(seg&&seg!=='.')out.push(seg)}return out.join('/')}
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageMime={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp'};
function imageData(zip,path){
 if(!zip.map.has(path))return null;
 const ext=path.toLowerCase().split('.').pop();if(!imageMime[ext])return null;
 let raw=unzipBytes(zip,path,2*1024*1024),binary='';
 for(let i=0;i<raw.length;i+=8192)binary+=String.fromCharCode(...raw.subarray(i,i+8192));
 return 'data:'+imageMime[ext]+';base64,'+btoa(binary);
}
async function sanitizedRichHtml(markup,zip=null,path=''){
 const html=new DOMParser().parseFromString(markup,'text/html');
 html.querySelectorAll('script,style,iframe,object,embed,svg,form,nav,footer,noscript,canvas,video,audio').forEach(x=>x.remove());
 let budget=0;const imageCache=new Map();
 function render(n){
  if(n.nodeType===Node.TEXT_NODE)return escapeHtml(n.textContent);
  if(n.nodeType!==Node.ELEMENT_NODE)return '';
  const tag=n.tagName.toLowerCase();
  if(tag==='img'){
   let src=n.getAttribute('src')||n.getAttribute('xlink:href')||'';
   if(!zip||!src||/^https?:|^data:/i.test(src))return '';
   try{let file=resolveZip(path,src);if(!imageCache.has(file))imageCache.set(file,imageData(zip,file));
    let data=imageCache.get(file);if(!data||budget+data.length>11*1024*1024)return '';budget+=data.length;
    return '<img loading="lazy" alt="Ілюстрація з книги" src="'+data+'">';
   }catch{return ''}
  }
  const allowed=['p','h1','h2','h3','h4','blockquote','em','strong','b','i','u','sup','sub','small','span','br','ul','ol','li','pre','code','div'];
  const child=[...n.childNodes].map(render).join('');
  if(!allowed.includes(tag))return child;
  return tag==='br'?'<br>':'<'+tag+'>'+child+'</'+tag+'>';
 }
 let out=[...html.body.childNodes].map(render).join('');
 return out.length>2?out:'';
}
async function epubChapters(buffer){
 const zip=zipEntries(buffer);
 const container=new DOMParser().parseFromString(await unzipText(zip,'META-INF/container.xml'),'application/xml');
 const root=container.querySelector('rootfile');if(!root)throw Error('EPUB: відсутній container.xml');
 const opfPath=root.getAttribute('full-path');
 const opf=new DOMParser().parseFromString(await unzipText(zip,opfPath),'application/xml');
 const manifest=new Map();opf.querySelectorAll('manifest > item').forEach(n=>manifest.set(n.getAttribute('id'),{href:n.getAttribute('href'),properties:n.getAttribute('properties')||'',media:n.getAttribute('media-type')||''}));
 const spine=[...opf.querySelectorAll('spine > itemref')],chapters=[];if(spine.length>2000)throw Error('EPUB: забагато розділів');
 let coverEntry=[...manifest.values()].find(n=>n.properties.includes('cover-image'))||[...manifest.values()].find(n=>/cover/i.test(n.href)&&/image\//.test(n.media));
 let cover='';if(coverEntry)try{cover=imageData(zip,resolveZip(opfPath,coverEntry.href))||''}catch{}
 for(const ref of spine){
  const item=manifest.get(ref.getAttribute('idref'));if(!item)continue;
  const path=resolveZip(opfPath,item.href);if(!/\.(xhtml|html|htm)$/i.test(path))continue;
  const markup=await unzipText(zip,path),paras=plainHtml(markup);
  if(paras.length){
   const html=new DOMParser().parseFromString(markup,'text/html');
   const title=clean(html.querySelector('h1,h2,h3,title')?.textContent||'Розділ '+(chapters.length+1)).slice(0,90);
   const rich=await sanitizedRichHtml(markup,zip,path);
   chapters.push({title,paragraphs:paras,rich});
  }
 }
 if(!chapters.length)throw Error('EPUB не містить читабельних розділів');
 if(cover)chapters.cover=cover;return chapters;
}

let book=null,chapter=0,page=0,chapterPages=1,rememberTimer=null,settings=parseLS(K.reader,{font:19,theme:'paper',line:1.75,margin:20,family:'system'}),readerResizeTimer=null;
let savedBookId=parseLS(K.lastBook,null);if(settings.theme==='sepia')settings.theme='paper';if(!['paper','dark','light'].includes(settings.theme))settings.theme='paper';settings.font=Math.min(32,Math.max(15,Number(settings.font)||19));settings.line=Number(settings.line)||1.75;settings.margin=Number(settings.margin)||20;settings.family=settings.family||'system';
$('bookFile').onchange=async e=>{let f=e.target.files?.[0];if(!f)return;try{toast('Імпортую книгу…');if(f.size>35*1024*1024)throw Error('Файл більший за 35 МБ');const ext=f.name.split('.').pop().toLowerCase();let chapters;if(ext==='epub')chapters=await epubChapters(await f.arrayBuffer());else if(['htm','html'].includes(ext)){const html=await f.text();chapters=[{title:'Текст',paragraphs:plainHtml(html),rich:await sanitizedRichHtml(html)}]}else if(ext==='txt')chapters=textChapters(await f.text());else throw Error('Потрібен EPUB, TXT або HTML');const data={id:uuid(),title:f.name.replace(/\.[^.]+$/,''),chapters,position:{chapter:0,page:0,fraction:0,scroll:0},cover:chapters.cover||'',bookmarks:[],created:Date.now()};await dbPut(data);openBook(data);toast('Книгу додано')}catch(err){toast('Помилка: '+err.message)}finally{e.target.value=''}};
$('bookSearch').oninput=()=>drawShelf();
$('continueReading').onclick=async()=>{if(savedBookId){const b=await dbGet(savedBookId);if(b)openBook(b)}};
function fractionOf(b){const c=Math.max(0,Number(b?.position?.chapter)||0),f=Number(b?.position?.fraction)||0,n=b?.chapters?.length||1;return Math.min(100,Math.floor((c+Math.min(1,Math.max(0,f)))/n*100))}
async function drawShelf(){
 const list=$('booksList');try{
  const all=(await dbList()).sort((a,b)=>(b.readAt||b.created||0)-(a.readAt||a.created||0));
  const query=keyText($('bookSearch').value||'');const shown=all.filter(b=>keyText(b.title).includes(query));
  list.replaceChildren();show('continueReading',all.some(b=>b.id===savedBookId));
  if(!shown.length){list.append(node('div','empty',all.length?'Немає книги з такою назвою.':'Додай EPUB, TXT або HTML — книги зберігатимуться на цьому пристрої.'));return}
  for(const b of shown){
   const item=node('div','bookitem');const thumb=b.cover?node('img','bookcover'):node('div','bookcoverplaceholder','📘');
   if(b.cover){thumb.src=b.cover;thumb.alt='Обкладинка '+b.title;}
   const content=node('div','stretch'),savedCount=words.filter(w=>wordBookSource(w)===b.title).length;
   content.append(node('div','itemtitle',b.title||'Без назви'),node('div','book-percent',fractionOf(b)+'% прочитано'));
   const progress=node('div','progress progress-mini'),filled=node('div');filled.style.width=fractionOf(b)+'%';progress.append(filled);content.append(progress);
   content.append(node('div','cardmeta',`${b.chapters?.length||0} розділів · ${savedCount} фраз із книги`));
   const actions=node('div','mini-actions spaced');
   actions.append(BTN('Читати',async()=>openBook(await dbGet(b.id)),'btn small'));
   actions.append(BTN('Фрази',()=>{nav('words');chooseWordTab('list');refillBookFilter();$('wordBookFilter').value=b.title;drawWordList()},'btn alt small'));
   actions.append(BTN('Видалити',async()=>{if(!confirm('Видалити книгу «'+b.title+'»? Картки залишаться.'))return;await dbDelete(b.id);if(book?.id===b.id){book=null;document.body.classList.remove('book-reading','reader-focus');show('libraryView');show('bookview',false)}drawShelf()},'btn ghost small'));
   content.append(actions);item.append(thumb,content);list.append(item);
  }
 }catch(e){list.replaceChildren(node('div','empty','Не вдалося відкрити бібліотеку: '+e.message))}
}
async function openBook(b){
 if(!b)return;book=b;
 chapter=Math.max(0,Math.min(book.chapters.length-1,Number(b.position?.chapter)||0));
 page=Math.max(0,Number(b.position?.page??Math.floor((Number(b.position?.scroll)||0)/460))||0);
 savedBookId=b.id;putLS(K.lastBook,b.id);
 show('libraryView',false);show('bookview');document.body.classList.add('book-reading');$('bookTitle').textContent=b.title;
 $('chapterPicker').replaceChildren();book.chapters.forEach((c,i)=>$('chapterPicker').add(new Option(c.title||'Розділ '+(i+1),String(i))));
 applySettings();renderChapter(page,Number(b.position?.fraction));nav('read');
}

$('backToLibrary').onclick=()=>{rememberPage();document.body.classList.remove('book-reading','reader-focus');show('libraryView');show('bookview',false);drawShelf()};
function applySettings(){
 $('pageWindow').className='page-window reader-fit theme-'+settings.theme;
 $('pageText').style.fontSize=settings.font+'px';
 $('pageText').style.lineHeight=String(settings.line);
 $('pageText').style.padding=`${settings.margin}px`;
 $('pageText').style.fontFamily=settings.family==='serif'?"Georgia, 'Times New Roman', serif":settings.family==='dyslexic'?"Verdana, Geneva, sans-serif":"system-ui, -apple-system, sans-serif";
 $('themeToggle').textContent='◐ '+({dark:'Темна',light:'Біла',paper:'Сепія'})[settings.theme];
 $('readerLine').value=String(settings.line);$('readerMargin').value=String(settings.margin);$('readerFont').value=settings.family;
 putLS(K.reader,settings);
}
$('readerOptions').onclick=()=>show('readerMore',$('readerMore').hidden);$('allBookmarks').onclick=()=>{drawBookmarks();show('bookmarksPanel',true);show('readerMore',false)};
$('readerCloseMore').onclick=()=>show('readerMore',false);
for(const [id,field,transform] of [['readerLine','line',Number],['readerMargin','margin',Number],['readerFont','family',String]])$(id).onchange=e=>{const frac=chapterPages<=1?0:page/(chapterPages-1);settings[field]=transform(e.target.value);applySettings();renderChapter(0,frac)};
$('fullscreenToggle').onclick=()=>{document.body.classList.toggle('reader-focus');$('fullscreenToggle').textContent=document.body.classList.contains('reader-focus')?'⤢ Звичайний режим':'⛶ Повний екран';show('readerMore',false);setTimeout(()=>renderChapter(0,chapterPages<=1?0:page/(chapterPages-1)),70)};
function refreshHighlights(){if(book)renderChapter(page,chapterPages<=1?0:page/(chapterPages-1))}
let requestedFraction=null;
function highlightWords(){
 const area=$('pageText');if(!words.length)return;
 const phrases=words.map(w=>clean(w.text)).filter(t=>t.length>=3&&t.length<90).sort((a,b)=>b.length-a.length).slice(0,600);
 if(!phrases.length)return;
 const escapeRegex=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const reg=new RegExp(String.raw`(?<![\p{L}\p{N}])(`+phrases.map(escapeRegex).join('|')+String.raw`)(?![\p{L}\p{N}])`,'giu');
 const walker=document.createTreeWalker(area,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode()){const n=walker.currentNode;if(n.parentElement.closest('mark,script,style'))continue;if(n.textContent.length>1)nodes.push(n)}
 let count=0;for(const n of nodes){
  if(count>1200)break;const text=n.textContent;reg.lastIndex=0;let found=reg.exec(text);if(!found)continue;
  const fragment=document.createDocumentFragment();let at=0;
  do{if(found.index>at)fragment.append(document.createTextNode(text.slice(at,found.index)));
   const m=node('mark','saved-expression',found[0]);fragment.append(m);at=found.index+found[0].length;count++;
   if(count>1200)break;
  }while((found=reg.exec(text)));fragment.append(document.createTextNode(text.slice(at)));n.replaceWith(fragment);
 }
}
function renderChapter(wanted=0,fraction=null){
 if(!book)return;chapter=Math.max(0,Math.min(chapter,book.chapters.length-1));$('chapterPicker').value=String(chapter);
 const area=$('pageText');area.replaceChildren();const current=book.chapters[chapter];
 if(current.rich){const doc=new DOMParser().parseFromString(current.rich,'text/html');
  // The EPUB HTML is sanitized at import; keep only safe markup and embedded raster images.
  doc.querySelectorAll('script,style,iframe,object,embed,svg,form,canvas,audio,video,meta,link').forEach(n=>n.remove());
  const safeTags=new Set(['P','H1','H2','H3','H4','BLOCKQUOTE','EM','STRONG','B','I','U','SUP','SUB','SMALL','SPAN','BR','UL','OL','LI','PRE','CODE','DIV','IMG']);
  [...doc.body.querySelectorAll('*')].reverse().forEach(el=>{if(!safeTags.has(el.tagName))el.replaceWith(...el.childNodes)});
  doc.body.querySelectorAll('*').forEach(el=>{for(const attr of [...el.attributes]){
   if(el.tagName.toLowerCase()==='img'&&attr.name==='src'&&/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(attr.value))continue;
   el.removeAttribute(attr.name);
  }});
  area.append(...[...doc.body.childNodes].map(n=>document.importNode(n,true)));
 }else for(const paragraph of current.paragraphs){area.append(node('p','',paragraph))}
 highlightWords();
 requestAnimationFrame(()=>layoutPages(wanted,fraction));
}
function layoutPages(wanted=page,fraction=null){
 if(!book)return;const area=$('pageText');let width=area.clientWidth;
 if(width<20){requestAnimationFrame(()=>layoutPages(wanted,fraction));return}
 const innerWidth=Math.max(30,width-settings.margin*2);
 area.style.columnWidth=innerWidth+'px';area.style.columnGap=(settings.margin*2)+'px';
 const advance=innerWidth+settings.margin*2;
 chapterPages=Math.max(1,Math.round(area.scrollWidth/advance));
 page=fraction!==null&&Number.isFinite(fraction)?Math.round(Math.min(1,Math.max(0,fraction))*(chapterPages-1)):Math.min(chapterPages-1,Math.max(0,wanted));
 area.scrollLeft=page*advance;
 $('pageCount').textContent=(page+1)+' / '+chapterPages;
 const percent=Math.min(100,Math.round((chapter+(page+1)/chapterPages)/book.chapters.length*100));
 $('readerProgress').textContent=`${percent}% · розділ ${chapter+1}/${book.chapters.length}`;
 $('readerProgressBar').style.width=percent+'%';
 $('pagePrev').disabled=page===0&&chapter===0;$('pageNext').disabled=page===chapterPages-1&&chapter===book.chapters.length-1;
}
function rememberPage(){if(!book)return;book.position={chapter,page,fraction:chapterPages<2?0:page/(chapterPages-1),scroll:0};book.readAt=Date.now();dbPut(book).catch(()=>toast('Не вдалося зберегти позицію'))}
function laterRemember(){clearTimeout(rememberTimer);rememberTimer=setTimeout(rememberPage,350)}
function turn(direction){
 if(!book)return;
 if(page+direction>=0&&page+direction<chapterPages){page+=direction;layoutPages(page);laterRemember();return}
 const next=chapter+direction;if(next<0||next>=book.chapters.length)return;
 chapter=next;page=direction>0?0:9999;renderChapter(page);laterRemember();
}
$('pagePrev').onclick=()=>turn(-1);$('pageNext').onclick=()=>turn(1);
$('chapterPicker').onchange=e=>{chapter=Number(e.target.value);page=0;renderChapter(0);laterRemember()};
for(const [id,delta] of [['fontMinus',-1],['fontPlus',1]])$(id).onclick=()=>{const frac=chapterPages<=1?0:page/(chapterPages-1);settings.font=Math.max(15,Math.min(32,settings.font+delta));applySettings();renderChapter(0,frac)};
$('themeToggle').onclick=()=>{const next={paper:'dark',dark:'light',light:'paper'};settings.theme=next[settings.theme];applySettings()};
window.addEventListener('resize',()=>{clearTimeout(readerResizeTimer);readerResizeTimer=setTimeout(()=>{if(book&&!$('bookview').hidden){const frac=chapterPages<=1?0:page/(chapterPages-1);renderChapter(0,frac)}},180)});
const area=$('pageText');let touch=null,swipedAt=0;
area.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;const t=e.touches[0];touch={x:t.clientX,y:t.clientY,at:Date.now()}},{passive:true});
area.addEventListener('touchend',e=>{if(!touch||e.changedTouches.length!==1)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y,duration=Date.now()-touch.at;touch=null;
 if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.35&&duration<1100&&!window.getSelection()?.toString().trim()){
  if(e.cancelable)e.preventDefault();swipedAt=Date.now();turn(dx<0?1:-1);
 }},{passive:false});
document.addEventListener('keydown',e=>{if(!book||$('bookview').hidden||$('cardDialog').open||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
 if(e.key==='ArrowRight'){e.preventDefault();turn(1)}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1)}
});
function selectionContext(text,clicked){
 const p=clicked?.closest?.('p,blockquote,li,h1,h2,h3');if(!p)return '';
 const str=clean(p.textContent);if(!str)return '';
 const idx=str.toLocaleLowerCase().indexOf(text.toLocaleLowerCase());if(idx<0)return str.slice(0,300);
 const left=Math.max(0,str.lastIndexOf('.',idx-1)+1,str.lastIndexOf('?',idx-1)+1,str.lastIndexOf('!',idx-1)+1);
 let right=str.slice(idx+text.length).search(/[.!?]/);right=right<0?str.length:idx+text.length+right+1;
 return clean(str.slice(left,right)).slice(0,450)
}
function captureSelection(){
 const sel=window.getSelection();if(!sel||sel.isCollapsed)return false;
 const n=sel.anchorNode,m=sel.focusNode;if(!n||!m||!area.contains(n)||!area.contains(m))return false;
 const text=clean(sel.toString());if(text.length<2||text.length>300)return false;
 const element=n.nodeType===Node.TEXT_NODE?n.parentElement:n;
 const context=selectionContext(text,element);sel.removeAllRanges();
 openCard({text,meaning:wordMatch(text)?.meaning||'',example:context,source:'book:'+book.title});return true;
}
area.addEventListener('mouseup',()=>setTimeout(captureSelection,90));
area.addEventListener('touchend',()=>setTimeout(()=>{if(Date.now()-swipedAt<350)return;captureSelection()},450),{passive:true});
area.addEventListener('click',e=>{
 if(Date.now()-swipedAt<300||!book||$('cardDialog').open)return;
 if(window.getSelection()?.toString())return;
 let range=null;if(document.caretRangeFromPoint)range=document.caretRangeFromPoint(e.clientX,e.clientY);
 else if(document.caretPositionFromPoint){const p=document.caretPositionFromPoint(e.clientX,e.clientY);if(p){range=document.createRange();range.setStart(p.offsetNode,p.offset);range.collapse(true)}}
 if(!range||range.startContainer.nodeType!==Node.TEXT_NODE||!area.contains(range.startContainer))return;
 let text=range.startContainer.textContent,offset=range.startOffset,letters=/[\p{L}\p{M}\p{N}'’\-]/u;
 let left=offset,right=offset;while(left>0&&letters.test(text[left-1]))left--;while(right<text.length&&letters.test(text[right]))right++;
 const word=text.slice(left,right).replace(/^[-'’]+|[-'’]+$/g,'');if(word.length<2)return;
 const context=selectionContext(word,range.startContainer.parentElement);
 openCard({text:word,meaning:wordMatch(word)?.meaning||'',example:context,source:'book:'+book.title});
});
// One-click bookmarks and in-book search, both stored locally with the book.
$('bookmarkButton').onclick=()=>{
 if(!book)return;book.bookmarks=Array.isArray(book.bookmarks)?book.bookmarks:[];
 const found=book.bookmarks.find(x=>x.chapter===chapter&&x.page===page);
 if(found){book.bookmarks=book.bookmarks.filter(x=>x!==found);toast('Закладку видалено')}
 else{book.bookmarks.push({id:uuid(),chapter,page,fraction:chapterPages<=1?0:page/(chapterPages-1),at:Date.now()});toast('Закладку додано')}
 dbPut(book).catch(()=>toast('Не вдалося зберегти закладку'));drawBookmarks();show('bookmarksPanel',true);
};
function drawBookmarks(){const list=$('bookmarksList');list.replaceChildren();const arr=book?.bookmarks||[];
 if(!arr.length){list.append(node('div','smallhint','Закладок ще немає. Натисни ☆ на потрібній сторінці.'));return}
 arr.slice().sort((a,b)=>a.chapter-b.chapter||a.page-b.page).forEach(b=>{
  const row=node('div','row between wrap');row.append(BTN(`Розділ ${b.chapter+1}, сторінка ${b.page+1}`,()=>{chapter=b.chapter;renderChapter(0,b.fraction||0);show('bookmarksPanel',false)},'btn alt small'));
  row.append(BTN('×',()=>{book.bookmarks=book.bookmarks.filter(x=>x.id!==b.id);dbPut(book);drawBookmarks()},'btn ghost small'));list.append(row);
 });
}
$('bookSearchButton').onclick=()=>{show('readerSearchPanel',$('readerSearchPanel').hidden);show('bookmarksPanel',false)};
$('readerSearchGo').onclick=searchInBook;
$('readerSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter')searchInBook()});
function searchInBook(){
 const q=keyText($('readerSearchInput').value);const results=$('readerSearchResults');results.replaceChildren();if(!book||q.length<2)return;
 let n=0;book.chapters.forEach((part,c)=>{
  const plain=(part.paragraphs||[]).join(' ');const hay=plain.toLocaleLowerCase();let from=0,at;
  while((at=hay.indexOf(q,from))>=0&&n<20){const left=Math.max(0,at-48),right=Math.min(plain.length,at+q.length+75),snippet=clean(plain.slice(left,right));
   const fraction=at/Math.max(1,plain.length);const link=BTN(`Розділ ${c+1} · …${snippet}…`,()=>{chapter=c;renderChapter(0,fraction);show('readerSearchPanel',false);laterRemember()},'btn alt small');link.style.textAlign='left';link.style.width='100%';results.append(link);n++;from=at+q.length;
  }
 });
 if(!n)results.append(node('div','smallhint','У книзі не знайдено.'));
}

// A compact, checked curated video catalogue. Open original source, do not embed trackers/players.
const CATALOG=[
 {id:'bc-a2-speaking',topic:'speaking',name:'A2 Speaking — розмови на щодень',source:'British Council',level:'A2',desc:'Короткі відеодіалоги: попросити допомоги, розповісти про роботу, підтримати розмову.',url:'https://learnenglish.britishcouncil.org/free-resources/speaking/a2'},
 {id:'voa-level1',topic:'story',name:'Let’s Learn English — Level 1',source:'VOA Learning English',level:'A2',desc:'Відеосеріал із повільною американською англійською, транскриптами та побутовими ситуаціями.',url:'https://learningenglish.voanews.com/p/5644.html'},
 {id:'bc-a2-job',topic:'work',name:'A2 — Talking about your job',source:'British Council',level:'A2',desc:'Конкретний відеоурок про професію, роботу й колег. Із транскриптом і вправами.',url:'https://learnenglish.britishcouncil.org/free-resources/speaking/a2/talking-about-your-job'},
 {id:'bc-a2-interest',topic:'speaking',name:'A2 — Showing interest',source:'British Council',level:'A2',desc:'Коротке відео: як природно реагувати на історію співрозмовника.',url:'https://learnenglish.britishcouncil.org/free-resources/speaking/a2/showing-interest'},
 {id:'bc-b1-speaking',topic:'speaking',name:'B1 Speaking — впевненіше говорити',source:'British Council',level:'B1',desc:'Відеодіалоги: попросити про послугу, відповісти на новини, висловити думку.',url:'https://learnenglish.britishcouncil.org/free-resources/speaking/b1'},
 {id:'voa-level2',topic:'story',name:'Let’s Learn English — Level 2',source:'VOA Learning English',level:'B1',desc:'Наступний рівень відеосеріалу. Переходь після комфортного розуміння Level 1.',url:'https://learningenglish.voanews.com/p/6765.html'},
 {id:'bc-wots',topic:'story',name:'Word on the Street — жива мова',source:'British Council',level:'B1',desc:'Сюжетні відео з транскриптами й вправами. Можуть бути складнішими за A2.',url:'https://learnenglish.britishcouncil.org/free-resources/general/video-series/word-street'},
 {id:'bc-work',topic:'work',name:'You’re Hired — англійська для роботи',source:'British Council',level:'B1',desc:'Відео про співбесіди й робочі ситуації. Коли будеш готовий до B1.',url:'https://learnenglish.britishcouncil.org/free-resources/business/youre-hired'},
 {id:'bbc-official',topic:'listening',name:'BBC Learning English — відеоканал',source:'BBC Learning English',level:'B1',desc:'Короткі пояснення й випуски. Вибирай зрозумілі ролики та повторюй фрази.',url:'https://www.youtube.com/@bbclearningenglish'}
];
let watched=parseLS(K.videos,{});
for(const id of ['videoFilter','videoLevel','videoSearch'])$(id).addEventListener(id==='videoSearch'?'input':'change',drawVideos);
function drawVideos(){
 const box=$('videoList'),filter=$('videoFilter').value,level=$('videoLevel').value,q=keyText($('videoSearch').value);
 const found=CATALOG.filter(v=>(filter==='all'||v.topic===filter)&&(level==='all'||v.level.includes(level))&&keyText(v.name+' '+v.source+' '+v.desc).includes(q));
 box.replaceChildren();$('videoStats').textContent=CATALOG.filter(v=>watched[v.id]).length+' із '+CATALOG.length+' переглянуто';
 if(!found.length)box.append(node('div','empty','Матеріалів із такими фільтрами немає.'));
 for(const v of found){
  const card=node('article','videoitem'),icon=node('div','videomark',v.topic==='speaking'?'🗣️':v.topic==='story'?'🎬':v.topic==='work'?'💼':'🎧');
  const content=node('div','stretch');content.append(node('div','kicker',v.level+' · '+v.source),node('div','itemtitle',v.name),node('div','cardmeta',v.desc));
  const actions=node('div','mini-actions video-actions');let a=node('a','btn small','▶ Відкрити ↗');a.href=v.url;a.target='_blank';a.rel='noopener noreferrer';
  actions.append(a,BTN(watched[v.id]?'✓ Переглянуто':'○ Переглянув',()=>{watched[v.id]=!watched[v.id];putLS(K.videos,watched);drawVideos()}),BTN('＋ Фраза',()=>openCard({source:'video:'+v.name}),'btn ghost small'));
  content.append(actions);card.append(icon,content);box.append(card);
 }
 if(filter==='all'&&level==='all'&&!q)renderOldPlaylist(box);
}

// Keep earlier saved links accessible without recreating the old playlist editor.
function renderOldPlaylist(parent){const old=parseLS('elp-playlist-v2',[]);if(!Array.isArray(old)||!old.length)return;const section=node('details','box spaced'),summary=node('summary','',`Мої старі збережені посилання (${old.length})`);summary.style.cursor='pointer';section.append(summary);const list=node('div','list spaced');for(const item of old.slice(0,150)){if(typeof item.url!=='string'||!/^https:\/\//i.test(item.url))continue;const wrap=node('div','row between wrap');wrap.append(node('span','',clean(item.title||'Збережений випуск').slice(0,110)));const a=node('a','btn alt small','Відкрити ↗');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';wrap.append(a);list.append(wrap)}section.append(list);parent.append(section)}
// Backups: supports legacy vault-11 with local keys and old books, plus simple card JSON.
$('settingsButton').onclick=()=>$('settingsDialog').showModal();
$('closeSettings').onclick=()=>$('settingsDialog').close();
function downloadJson(value,name){
 const blob=new Blob([JSON.stringify(value)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=node('a');
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000)
}
$('exportBackup').onclick=async()=>{
 try{
  const books=await dbList(),local={};
  for(const key of Object.keys(localStorage))if(key.startsWith('elp-'))local[key]=localStorage.getItem(key);
  downloadJson({app:'english-pocket',format:'vault-15',created:new Date().toISOString(),books,words,local,watched,settings},'english-pocket-full-backup-'+new Date().toISOString().slice(0,10)+'.json');
  $('settingsStatus').textContent=`Резервна копія містить ${books.length} книг, ${words.length} карток, закладки та історію SRS.`;
 }catch(e){$('settingsStatus').textContent='Помилка створення копії: '+e.message}
};
$('addStarterCards').onclick=()=>{const r=mergeWords(STARTER_CARDS);$('settingsStatus').textContent=`Додано ${r.added} фраз, доповнено ${r.updated}. Дублікатів немає.`;toast('Картки готові до навчання')};
$('backupFile').onchange=async e=>{
 const f=e.target.files?.[0];if(!f)return;
 try{
  if(f.size>80*1024*1024)throw Error('Завеликий JSON. Максимум 80 МБ');
  const data=JSON.parse(await f.text());
  const incoming=Array.isArray(data)?data:(Array.isArray(data.words)?data.words:Array.isArray(data.cards)?data.cards:(()=>{
   if(data.local&&typeof data.local[K.words]==='string')return JSON.parse(data.local[K.words]);return []
  })());
  if(!Array.isArray(incoming))throw Error('Словник має бути масивом');
  if(!Array.isArray(data)&&typeof data!=='object')throw Error('Некоректна структура JSON');
  if(incoming.length>50000)throw Error('Забагато карток для імпорту');
  const invalid=incoming.filter(w=>!normalizeWord(w));if(invalid.length)throw Error(`Некоректних карток: ${invalid.length}. Імпорт скасовано.`);
  const incomingBooks=Array.isArray(data.books)?data.books:[];
  if(incomingBooks.length>1000)throw Error('Забагато книг');
  for(const b of incomingBooks)if(!b||typeof b.id!=='string'||!Array.isArray(b.chapters)||!b.chapters.length||b.chapters.length>2500||b.chapters.some(ch=>!ch||!Array.isArray(ch.paragraphs)))throw Error('Пошкоджена структура книги. Імпорт скасовано.');
  if(!incoming.length&&!incomingBooks.length)throw Error('У JSON немає карток або книг');
  const existing=await dbList(),existingIds=new Set(existing.map(x=>x.id));
  const addBooks=incomingBooks.filter(b=>!existingIds.has(b.id));
  if(!confirm(`Додати ${incoming.length} карток та ${addBooks.length} книг? Існуючі записи збережуться, дублікати будуть пропущені.`))return;
  // Pre-validate first. New books are inserted without overwriting existing ones.
  let addedBooks=0;for(const b of addBooks){await dbPut(b);addedBooks++}
  const r=mergeWords(incoming);
  if(data.local&&typeof data.local==='object'){
   for(const key of [K.videos,K.daily,K.practiceLog,K.reviewConfig,K.lesson]){
    if(localStorage.getItem(key)===null&&typeof data.local[key]==='string')localStorage.setItem(key,data.local[key]);
   }
   if(data.local[K.videos]){try{watched={...JSON.parse(data.local[K.videos]),...watched};putLS(K.videos,watched)}catch{}}
  }
  if(data.watched&&typeof data.watched==='object'){watched={...data.watched,...watched};putLS(K.videos,watched)}
  $('settingsStatus').textContent=`Готово: +${r.added} карток, доповнено ${r.updated}, +${addedBooks} книг. Дані не перезаписувалися.`;
  if(typeof lessonState!=='undefined')lessonState=parseLS(K.lesson,null);
  drawShelf();drawWords();drawVideos();toast('Імпорт завершено');
 }catch(error){$('settingsStatus').textContent='Імпорт не завершено: '+error.message}
 finally{e.target.value=''}
};

// Starting view intentionally simple: open the library instead of covering it with dashboards.
async function init(){drawWordStats();drawShelf();drawVideos();if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});}
init();
