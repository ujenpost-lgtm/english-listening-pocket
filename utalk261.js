/* English Pocket 26.1.0: optional manual UTalk Navi Telegram -> offline reading bridge.
   No Telegram tokens, chat access, background import, or network requests. */
(()=>{
'use strict';
const g=id=>document.getElementById(id);
const BOT='https://t.me/utalk_navi_bot';
const openImport=g('utalkImportOpen'),form=g('utalkImportForm'),dialog=g('utalkImportDialog');
const title=g('utalkArticleTitle'),body=g('utalkArticleText'),save=g('utalkArticleSave');
const missionButton=g('utalkMissionButton'),mission=g('utalkMissionDialog');
if(!openImport||!form||!dialog||!missionButton||!mission)return;
const trim=s=>String(s||'').replace(/\r\n?/g,'\n').trim();
const hashText=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};
let saving=false,activeMissionId=null;
openImport.addEventListener('click',()=>{dialog.showModal();setTimeout(()=>title.focus(),60)});
g('utalkImportCancel')?.addEventListener('click',()=>dialog.close());
form.addEventListener('submit',async e=>{
 e.preventDefault();if(saving)return;
 const heading=trim(title.value).replace(/\s+/g,' ').slice(0,120)||'Моя новина';
 const text=trim(body.value).slice(0,32000);
 if(text.length<35){g('utalkImportStatus').textContent='Додай хоча б кілька англійських речень або свій конспект.';return}
 saving=true;save.disabled=true;g('utalkImportStatus').textContent='Зберігаю в особисту бібліотеку…';
 try{
  const fingerprint=hashText(heading.toLocaleLowerCase()+'\n'+text);
  const previous=(await dbList()).find(b=>b?.utalk?.fingerprint===fingerprint);
  if(previous){dialog.close();toast('Цю новину вже додано. Відкриваю її.');openBook(previous);return}
  const chapters=textChapters(text);
  const data={id:uuid(),title:'📰 '+heading,chapters,position:{chapter:0,page:0,fraction:0,scroll:0},cover:'',bookmarks:[],created:Date.now(),source:'utalk-navi',sourceUrl:BOT,utalk:{fingerprint,notes:{gist:'',reaction:''}}};
  await dbPut(data);dialog.close();form.reset();g('utalkImportStatus').textContent='';
  openBook(data);toast('Новину додано. Натискай на слова, щоб перекладати й зберігати їх.');
 }catch(err){g('utalkImportStatus').textContent='Не вдалося зберегти: '+(err?.message||'Помилка сховища')}
 finally{saving=false;save.disabled=false}
});
function syncMission(){
 const isNews=Boolean(typeof book!=='undefined'&&book?.source==='utalk-navi'&&!g('bookview').hidden);
 missionButton.hidden=!isNews;
 if(mission.open&&(!isNews||book?.id!==activeMissionId))mission.close();
}
const heading=g('bookTitle');
if(heading)new MutationObserver(syncMission).observe(heading,{childList:true,characterData:true,subtree:true});
g('backToLibrary')?.addEventListener('click',()=>{missionButton.hidden=true;if(mission.open)mission.close()});
missionButton.addEventListener('click',()=>{
 if(typeof book==='undefined'||book?.source!=='utalk-navi')return;
 activeMissionId=book.id;
 g('utalkMissionTitle').textContent=book.title;
 g('utalkGist').value=book.utalk?.notes?.gist||'';
 g('utalkReaction').value=book.utalk?.notes?.reaction||'';
 mission.showModal();
});
g('utalkMissionCancel')?.addEventListener('click',()=>mission.close());
g('utalkMissionForm')?.addEventListener('submit',async e=>{
 e.preventDefault();if(typeof book==='undefined'||book?.id!==activeMissionId)return;
 const gist=trim(g('utalkGist').value).slice(0,1500),reaction=trim(g('utalkReaction').value).slice(0,1500);
 try{
  book.utalk=book.utalk||{};
  book.utalk.notes={gist,reaction,updated:Date.now()};
  await dbPut(book);mission.close();toast('Нотатки збережено лише на цьому пристрої.');
 }catch(err){g('utalkMissionStatus').textContent='Не вдалося зберегти: '+(err?.message||'помилка')}
});
// No attempt to access or impersonate the third-party Telegram bot.
window.EnglishPocketUTalk={version:'26.1.0',source:BOT,refresh:syncMission};
const foot=document.querySelector('.app>footer');if(foot)foot.textContent='English Pocket 26.1.0 · A2+ → B1 · Дані лише на пристрої · UTalk Navi: ручний імпорт';
})();
