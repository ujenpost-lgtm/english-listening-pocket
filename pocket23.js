/* English Pocket 23.0 — offline dictionary package, contextual senses, shadowing and chapter review.
   No AI API. Large word list is OPTIONAL user-installed open-licence StarDict package. */
'use strict';
(()=>{
const $=id=>document.getElementById(id);
const el=(tag,cls='',txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
const btn=(text,action,cls='btn alt small')=>{const b=el('button',cls,text);b.type='button';b.addEventListener('click',action);return b};
const norm=t=>String(t||'').normalize('NFKC').toLocaleLowerCase('en').replace(/[’‘]/g,"'").replace(/^[\s.,!?;:"“”()]+|[\s.,!?;:"“”()]+$/g,'').replace(/\s+/g,' ').trim();
const trim=t=>String(t||'').replace(/\s+/g,' ').trim();
const EP23={version:'23.0',loaded:false,entries:new Map(),forms:new Map(),senses:[],source:'',phrase:null};window.EP23=EP23;
const DB_NAME='english-pocket-lexicon-23';
function dictDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('datasets'))req.result.createObjectStore('datasets',{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});}
async function dictOperation(mode,method,value){const db=await dictDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('datasets',mode),req=tx.objectStore('datasets')[method](value);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);tx.onerror=()=>reject(tx.error)});}finally{db.close()}}
function installMemory(payload){EP23.entries=new Map(payload.entries);EP23.forms=new Map(payload.forms);EP23.loaded=true;EP23.source=payload.source||'en-uk StarDict';}
async function loadDictionary(){try{const dataset=await dictOperation('readonly','get','en-uk');if(dataset?.entries?.length){installMemory(dataset);dictStatus.textContent=`✓ ${EP23.entries.size.toLocaleString('uk-UA')} статей · ${EP23.forms.size.toLocaleString('uk-UA')} словоформ, офлайн`;return}}catch(e){dictStatus.textContent='Словник не завантажено: '+e.message;return}dictStatus.textContent='Додатковий словник не встановлений. Наявна базова офлайн-база.';}
// StarDict .idx: [UTF8 headword][NUL][big-endian offset 4][big-endian size 4]
// .syn: [UTF8 inflected form][NUL][big-endian index number 4]
function parseIndex(bytes,kind='idx',max=150000){const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),dec=new TextDecoder('utf-8',{fatal:false});let pos=0;const result=[];while(pos<bytes.length){if(result.length>=max)throw Error('Занадто багато словникових записів');let end=pos;while(end<bytes.length&&bytes[end])end++;if(end===bytes.length)throw Error('Пошкоджений індекс словника');const word=dec.decode(bytes.subarray(pos,end));if(end+5>bytes.length)throw Error('Неповний індекс словника');const a=dv.getUint32(end+1,false);if(kind==='idx'){if(end+9>bytes.length)throw Error('Неповний індекс словника');result.push([word,a,dv.getUint32(end+5,false)]);pos=end+9;}else{result.push([word,a]);pos=end+5}}return result;}
function cleanMeaning(raw){const str=String(raw||'').slice(0,2200);if(!str)return '';const doc=new DOMParser().parseFromString(str.replace(/<br\s*\/?\s*>/ig,'; ').replace(/<\/p\s*>/ig,'; '),'text/html');doc.querySelectorAll('script,style,iframe,svg,form').forEach(n=>n.remove());let text=doc.body.textContent||str;return trim(text).slice(0,700)}
function parseStardictZip(arrayBuffer){const archive=zipEntries(arrayBuffer),names=[...archive.map.keys()],idxPath=names.find(s=>/\.idx$/i.test(s)),ifoPath=names.find(s=>/\.ifo$/i.test(s));if(!idxPath||!ifoPath)throw Error('У ZIP немає файлів StarDict .idx та .ifo');if(!/en-uk/i.test(idxPath))throw Error('Обери англо-український словник en-uk.zip');const prefix=idxPath.slice(0,-4),dictPath=names.find(s=>s===prefix+'.dict.dz'||s===prefix+'.dict'),synPath=names.find(s=>s===prefix+'.syn');if(!dictPath)throw Error('У ZIP немає файлу .dict.dz або .dict');const ifo=new TextDecoder().decode(unzipBytes(archive,ifoPath,64*1024));const typ=/sametypesequence=(.+)/i.exec(ifo)?.[1]?.trim();if(typ&&typ!=='h'&&typ!=='m'&&typ!=='t')throw Error('Невідомий тип статей StarDict: '+typ);
 const index=parseIndex(unzipBytes(archive,idxPath,10*1024*1024),'idx',160000);
 const compressed=unzipBytes(archive,dictPath,20*1024*1024);let defs;if(/\.dz$/i.test(dictPath)){if(!window.pako?.ungzip)throw Error('Не вдалося відкрити стиснений словник (pako)');const sz=new DataView(compressed.buffer,compressed.byteOffset,compressed.byteLength).getUint32(compressed.length-4,true);if(sz>40*1024*1024)throw Error('Словник завеликий для телефона');defs=window.pako.ungzip(compressed)}else defs=compressed;
 if(defs.byteLength>40*1024*1024)throw Error('Розпакований словник завеликий');const decoder=new TextDecoder('utf-8');const entries=new Map(),headwords=[];
 for(const [word,off,len] of index){if(off+len>defs.length)throw Error('Пошкоджена адреса статті');const head=norm(word);headwords.push(head);if(!head||head.length>120||len>12000)continue;const definition=cleanMeaning(decoder.decode(defs.subarray(off,off+len)));if(!definition)continue;const existing=entries.get(head);entries.set(head,existing?trim(existing+'; '+definition).slice(0,1000):definition)}
 const forms=new Map();if(synPath){for(const [form,idx] of parseIndex(unzipBytes(archive,synPath,15*1024*1024),'syn',400000)){const target=headwords[idx],word=norm(form);if(target&&word&&word!==target&&!entries.has(word)&&!forms.has(word))forms.set(word,target)}}
 const attr=names.find(s=>/\/(?:ATTRIBUTION|LICENSE)(?:\.[^/]*)?$/i.test(s)||/^(?:ATTRIBUTION|LICENSE)(?:\.[^/]*)?$/i.test(s));const notice=attr?decoder.decode(unzipBytes(archive,attr,150*1024)).slice(0,30000):'';
 if(entries.size<1000)throw Error('Файл містить надто мало статей — перевір, що це en-uk.zip');
 return {id:'en-uk',source:'koreader-dicts English → Ukrainian (StarDict)',entries:[...entries],forms:[...forms],attribution:notice,importedAt:Date.now()};}
// The full open dictionary is opt-in because 25k entries/80k forms require a download.
const settings=$('settingsDialog'),install=el('details','box ep23-dictionary');install.innerHTML='<summary>📖 Великий словник офлайн</summary>';
const intro=el('p','smallhint','Підключення одного файлу en-uk.zip — після цього переклади та словоформи доступні без інтернету.');
const official=el('a','btn alt small','Завантажити en-uk.zip ↗');official.href='https://danielgregorini.github.io/koreader-dicts/en/downloads/';official.target='_blank';official.rel='noopener noreferrer';
const picker=el('input');picker.type='file';picker.accept='.zip,application/zip';picker.hidden=true;picker.id='ep23DictFile';const importLabel=el('label','btn alt small','↑ Імпортувати ZIP');importLabel.htmlFor=picker.id;
const dictStatus=el('p','smallhint','Перевіряю встановлений словник…');dictStatus.setAttribute('aria-live','polite');
const removeBtn=btn('Видалити додатковий словник',async()=>{if(!confirm('Видалити великий словник? Картки й книги залишаться.'))return;await dictOperation('readwrite','delete','en-uk');EP23.entries.clear();EP23.forms.clear();EP23.loaded=false;dictStatus.textContent='Додатковий словник видалено';},'btn ghost small');
install.append(intro,official,importLabel,picker,dictStatus,el('p','smallhint','Джерело: koreader-dicts (Wiktionary), CC BY-SA 4.0. Потрібне зазначення авторства й збереження ліцензії. Оригінальний ZIP містить ATTRIBUTION та LICENSE.'),removeBtn);
const anchor=settings?.querySelector('#settingsStatus');if(anchor)anchor.before(install);else settings?.append(install);
picker.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>18*1024*1024)throw Error('Максимальний розмір ZIP — 18 МБ');dictStatus.textContent='Імпортую словник…';await new Promise(r=>setTimeout(r,30));const data=parseStardictZip(await f.arrayBuffer());await dictOperation('readwrite','put',data);installMemory(data);dictStatus.textContent=`✓ Встановлено ${data.entries.length.toLocaleString('uk-UA')} статей і ${data.forms.length.toLocaleString('uk-UA')} словоформ. Працює офлайн.`;}catch(err){dictStatus.textContent='Імпорт не вдався: '+err.message}finally{picker.value=''}});
loadDictionary();
// Context dictionary: personal card wins, otherwise show dictionary senses as alternatives.
function directMeaning(text){const key=norm(text);if(!key||!EP23.loaded)return null;const root=EP23.entries.has(key)?key:EP23.forms.get(key);if(!root)return null;const str=EP23.entries.get(root);if(!str)return null;const split=str.split(/\s*;\s*|\s+·\s+|\s*\/\s*/).map(trim).filter(s=>s.length>1).slice(0,6);return {lemma:root,first:split[0]||str,meanings:split.length?split:[str],source:EP23.source};}
EP23.lookup=directMeaning;EP23.parseDictionary=parseStardictZip;
const sensesBox=el('div','ep23-senses');$('ep17Glosses')?.after(sensesBox);
const curatedExamples={
 bank:[['I need to go to the bank.','Мені потрібно піти до банку.'],['We sat on the river bank.','Ми сиділи на березі річки.']],
 light:[['Turn on the light, please.','Увімкни світло, будь ласка.'],['This bag is very light.','Ця сумка дуже легка.']],
 right:[['You are right.','Ти маєш рацію.'],['Turn right after the bridge.','Поверни праворуч після мосту.']],
 book:[['I borrowed a book.','Я позичив книжку.'],['I need to book a room.','Мені потрібно забронювати кімнату.']],
 run:[['I run every morning.','Я бігаю щоранку.'],['She runs a small shop.','Вона керує невеликим магазином.']],
 get:[['I got your message.','Я отримав твоє повідомлення.'],['It is getting cold.','Стає холодно.']],
 mean:[['What does this word mean?','Що означає це слово?'],['I did not mean to be rude.','Я не хотів бути грубим.']],
 work:[['I work at a hospital.','Я працюю в лікарні.'],['This key does not work.','Цей ключ не працює.']],
 take:[['Take this bag, please.','Візьми цю сумку, будь ласка.'],['It takes twenty minutes.','Це займає двадцять хвилин.']],
 change:[['I need to change my address.','Мені потрібно змінити адресу.'],['Do you have any change?','У тебе є дрібні гроші?']]
};
const previousLookup=readerLookup;
readerLookup=function(value,context=''){previousLookup(value,context);sensesBox.replaceChildren();const found=directMeaning(value);if(!found)return;const own=wordMatch(value),status=$('trayStatus'),field=$('trayMeaning');if(!own?.meaning){field.value=found.first;status.textContent=`Офлайн · ${found.lemma!==norm(value)?'форма від '+found.lemma:'великий словник'} · перевір у контексті`;}else status.textContent='Твій переклад · збережений у картках';
 if(found.meanings.length>1){sensesBox.append(el('span','smallhint','Можливі значення (обери відповідне до речення):'));for(const sense of found.meanings.slice(0,4)){const choice=btn(sense.slice(0,110),()=>{field.value=sense;status.textContent='Значення вибрано · перевір перед збереженням'},'ep23-sense-choice');sensesBox.append(choice)}}
 const examples=curatedExamples[found.lemma];if(examples){const block=el('details','ep23-examples');block.append(el('summary','','Приклади вживання'));for(const [en,uk] of examples){const line=el('p','smallhint');line.append(el('strong','',en),document.createTextNode(' — '+uk));block.append(line)}sensesBox.append(block)}
};
// Re-check dictionary after async IndexedDB load when tray is currently open.
const oldLoaded=loadDictionary;
// One-tap dictionary and simple ambiguity warning are enough: no fake machine translation.

// Shadowing, built into the existing paragraph button. No new main control.
const panel=el('div','reader-floating ep23-shadow');panel.hidden=true;panel.id='ep23Shadow';$('pageWindow')?.before(panel);
const paragraphButton=$('ep17ParagraphMode');if(paragraphButton){paragraphButton.textContent='🎙 Слухай і повторюй';paragraphButton.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();show('readerTools',false);openShadow()},{capture:true});}
let shadowLines=[],shadowIndex=0,shadowPlaying=false;
function pageSentences(){const area=$('pageText'),windowRect=$('pageWindow').getBoundingClientRect();if(!area)return[];const paras=[...area.querySelectorAll('p,h1,h2,h3,li,blockquote')].filter(p=>[...p.getClientRects()].some(r=>r.left<windowRect.right-5&&r.right>windowRect.left+5&&r.top<windowRect.bottom-8&&r.bottom>windowRect.top+8));const result=[];for(const p of paras){const sentences=trim(p.textContent).match(/[^.!?]+[.!?]?/gu)||[];for(let s of sentences){s=trim(s);if(s.length>=12&&s.length<=220)result.push(s);if(result.length>=12)return result}}return result}
function stopShadow(){shadowPlaying=false;if('speechSynthesis'in window)speechSynthesis.cancel();}
function openShadow(){if(!book)return;stopShadow();shadowLines=pageSentences();shadowIndex=0;renderShadow();panel.hidden=false;}
function renderShadow(){panel.replaceChildren();const bar=el('div','row between wrap');bar.append(el('strong','','🎧 Слухай → повторюй'),btn('×',()=>{stopShadow();panel.hidden=true},'btn ghost small'));panel.append(bar);
 if(!shadowLines.length){panel.append(el('p','smallhint','На цій сторінці немає видимого речення для озвучування.'));return}
 const current=shadowLines[shadowIndex],counter=el('div','smallhint',`${shadowIndex+1}/${shadowLines.length} · A2+ → B1`),prompt=el('p','ep23-shadow-text',current),status=el('p','smallhint','Послухай речення, а після звуку повтори його вголос.');
 const commands=el('div','row wrap');commands.append(btn('🔊 Слухати',()=>{if(!window.speechSynthesis||typeof SpeechSynthesisUtterance==='undefined'){status.textContent='Озвучування недоступне';return}stopShadow();const u=new SpeechSynthesisUtterance(current),v=window.EP22?.voiceChoice?.();if(v){u.voice=v;u.lang=v.lang}else u.lang='en-CA';u.rate=Math.max(.68,Math.min(1.05,window.EP17?.rate||.83));u.onstart=()=>{shadowPlaying=true;status.textContent='Слухай уважно…'};u.onend=()=>{shadowPlaying=false;status.textContent='Твоя черга: повтори вголос, потім переходь далі.'};u.onerror=()=>{shadowPlaying=false;status.textContent='Не вдалося озвучити речення'};speechSynthesis.speak(u)},'btn small'),btn('→ Далі',()=>{stopShadow();shadowIndex=(shadowIndex+1)%shadowLines.length;renderShadow()},'btn alt small'));
 panel.append(counter,prompt,status,commands);}
$('backToLibrary')?.addEventListener('click',()=>{stopShadow();panel.hidden=true});
const oldTurn23=turn;turn=function(...args){if(!panel.hidden){stopShadow();panel.hidden=true}return oldTurn23(...args)};
$('chapterPicker')?.addEventListener('change',()=>{stopShadow();panel.hidden=true});

// Book vocabulary focus: suggest only lexical items truly present in this book.
const focus=el('details','ep23-book-focus');focus.innerHTML='<summary>🔎 Складні слова розділу</summary>';
const focusContent=el('div','ep23-focus-content');focus.append(focusContent);$('readerMore')?.append(focus);
const stopWords=new Set(('the and for with from that this these those have has had were was are is but not you your our their they them she her him his who what which where when why how into out over under just then than here there after before about some any much many more most only very every could would should might must need been being does did will can may all one two say said get got see seen make made take took book chapter page thing things people person because while since between').split(' '));
function chapterText(){if(!book)return'';const part=book.chapters[chapter];return (part?.paragraphs||[]).join(' ')||new DOMParser().parseFromString(part?.rich||'','text/html').body.textContent||'';}
function scanVocabulary(){const body=chapterText().slice(0,85000);const tokens=[...body.matchAll(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g)];const counts=new Map(),firstPos=new Map();for(const m of tokens){const word=norm(m[0]);if(word.length<4||stopWords.has(word)||wordMatch(word)||!/^\p{Script=Latin}+$/u.test(word))continue;counts.set(word,(counts.get(word)||0)+1);if(!firstPos.has(word))firstPos.set(word,m.index)}
 const out=[],seenLemmas=new Set();for(const [word,count] of [...counts].sort((a,b)=>b[1]-a[1]).slice(0,180)){const hit=directMeaning(word)||window.EP22?.dictionaryLookup?.(word);if(!(hit?.meaning||hit?.first))continue;const lemma=hit?.lemma||hit?.base||word;if(wordMatch(lemma)||seenLemmas.has(lemma))continue;seenLemmas.add(lemma);const at=firstPos.get(word),sentence=trim(body.slice(Math.max(0,body.lastIndexOf('.',at-1)+1),Math.min(body.length,body.indexOf('.',at+word.length)<0?at+150:body.indexOf('.',at+word.length)+1))).slice(0,270);out.push({word:lemma,count,meaning:(hit.first||hit.meaning||'').slice(0,220),sentence});}
 return out.sort((a,b)=>b.count-a.count||b.word.length-a.word.length).slice(0,12)}
function drawFocus(){focusContent.replaceChildren();if(!book)return;const list=scanVocabulary();focusContent.append(el('p','smallhint',list.length?'Слова з тексту поточного розділу, яких немає у твоїх картках. Додавання — лише вручну.':'Немає нових підказок у цьому розділі.'));
 for(const item of list){const row=el('div','ep23-focus-row'),desc=el('div','ep23-focus-desc');desc.append(el('strong','',item.word),el('span','smallhint',item.meaning),el('small','',`${item.count}× у розділі · ${item.sentence}`));const saveBtn=btn('＋',()=>{if(wordMatch(item.word))return toast('Це слово вже у словнику');const card={text:item.word,meaning:item.meaning,example:item.sentence,source:'book:'+book.title};mergeWords([card]);const w=wordMatch(item.word);if(w&&!w.p20Location){w.p20Location={bookId:book.id,chapter,page,fraction:chapterPages<=1?0:page/(chapterPages-1)};saveWords();}saveBtn.disabled=true;saveBtn.textContent='✓';},'btn alt small');row.append(desc,saveBtn);focusContent.append(row)}}
focus.addEventListener('toggle',()=>{if(focus.open)drawFocus()});

// Reading assistant: ONLY the learner's studied phrases from this exact chapter.
// General comprehension questions are self-check, not hallucinated plot questions.
const chapterKey='elp-23-chapter-review';
ep21OpenChapterReview=function(){const area=$('ep21ChapterReview');if(!book)return;area.replaceChildren();['readerTools','readerMore','readerSearchPanel','bookmarksPanel','translationTray'].forEach(id=>show(id,false));const title=el('div','row between wrap');title.append(el('strong','','✓ Закріпити розділ'),btn('×',()=>area.hidden=true,'btn ghost small'));area.append(title);
 const selected=words.filter(w=>ep181Studied(w)&&w.meaning&&w.p20Location?.bookId===book.id&&Number(w.p20Location.chapter)===chapter).slice(0,5);
 const key=book.id+':'+chapter,old=parseLS(chapterKey,{})[key]||{},header=el('p','smallhint',`${selected.length} вивчених фраз із розділу. Жодних сторонніх слів.`);area.append(header);
 let idx=0,correct=0;const task=el('div','ep23-chapter-task');area.append(task);
 function render(){task.replaceChildren();if(idx>=selected.length){task.append(el('p','smallhint',`Повторення: ${correct} / ${selected.length}. Коротко перекажи своїми словами, що відбулося у розділі.`));const summary=el('textarea','input');summary.rows=2;summary.placeholder='What happened in this chapter?';summary.value=old.summary||'';const reason=el('textarea','input');reason.rows=2;reason.placeholder='Why did it happen?';reason.value=old.reason||'';task.append(summary,reason,btn('Зберегти результат',()=>{const s=parseLS(chapterKey,{});s[key]={correct,total:selected.length,summary:summary.value.trim(),reason:reason.value.trim(),updatedAt:Date.now()};putLS(chapterKey,s);toast('Закріплення збережено')},'btn small'));return}
  const w=selected[idx],cloze=ep201Context(w);task.append(el('p','smallhint',`${idx+1}/${selected.length} · ${w.meaning}`));if(cloze?.masked)task.append(el('p','ep23-chapter-prompt',cloze.masked));else task.append(el('p','smallhint','Пригадай фразу за українським значенням.'));const input=el('input','input');input.placeholder='Напиши англійську фразу';task.append(input);const feedback=el('p','smallhint');let done=false;
  task.append(feedback,btn('Перевірити',()=>{if(done)return;const r=ep21Judge(input.value,w,!!cloze?.masked);if(r==='empty')return;if(r==='typo'){feedback.textContent='Майже. Перевір написання та спробуй ще.';return}done=true;const ok=r==='correct';if(ok)correct++;if(typeof ep202Record==='function')ep202Record(w,ok,'context');feedback.textContent=ok?'✓ Правильно':'Правильна фраза: '+w.text;task.append(btn('Далі →',()=>{idx++;render()},'btn alt small'));},'btn small'))}
 render();area.hidden=false;
};

// A single contextual action appears only on the last page, and only if the
// learner already studied phrases from that chapter. No extra permanent toolbar.
const endReviewButton=btn('✓ Закріпити розділ',()=>ep21OpenChapterReview(),'ep23-end-review');endReviewButton.hidden=true;
$('readerProgress')?.after(endReviewButton);
const priorLayout23=layoutPages;
layoutPages=function(...args){const result=priorLayout23(...args);const eligible=book&&words.some(w=>ep181Studied(w)&&w.meaning&&w.p20Location?.bookId===book.id&&Number(w.p20Location.chapter)===chapter);endReviewButton.hidden=!(eligible&&page>=chapterPages-1);return result;};
const footer=document.querySelector('.app > footer.footnote');if(footer)footer.textContent='English Pocket 23.0 · A2+ → B1 · Книги й особисті картки залишаються приватними';
})();
