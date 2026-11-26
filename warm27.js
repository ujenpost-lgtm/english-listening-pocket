/* English Pocket 27.0 — Warm Paper / Living English
 * Four additions, one coherent experience: Language DNA, a branching original story,
 * real-life Canada Quest and audio-first Pocket Walk. Echo is intentionally absent.
 * All progress uses existing per-device EPStore. No networking, paid API or analytics.
 */
'use strict';
(()=>{
 const D=id=>document.getElementById(id);
 const make=(tag,cls='',value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=String(value);return x};
 const B=(text,handler,cls='btn alt small')=>{const b=make('button',cls,text);b.type='button';b.addEventListener('click',handler);return b};
 const P=t=>make('p','ep27-note',t);
 const get=(k,def)=>{try{const x=EPStore.getItem(k);return x===null?def:JSON.parse(x)}catch{return def}};
 const put=(k,v)=>{try{EPStore.setItem(k,JSON.stringify(v));return true}catch(e){console.warn('English Pocket 27 storage:',e);toast('Не вдалося зберегти дані. Перевір пам’ять пристрою.');return false}};
 const key='elp-27-', norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").trim();
 const known=()=>words.filter(w=>w&&w.text&&w.meaning&&typeof ep181Studied==='function'&&ep181Studied(w));
 const panel=(title,id)=>{const a=make('details','ep27-panel');a.id=id;a.append(make('summary','',title));const body=make('div','ep27-body');a.append(body);return {details:a,body}};
 const line=(label,control)=>{const l=make('label','ep27-label',label);l.append(control);return l};
 const status=(area,text)=>{area.textContent=text;area.setAttribute('role','status')};
 const readDate=ts=>ts?new Date(ts).toLocaleDateString('uk-UA'):'ще немає';

 // Warm Paper is the default only on first upgrade; user choice persists on this device.
 let theme=EPStore.getItem(key+'theme')||'paper';
 const setTheme=(value)=>{theme=value==='night'?'night':'paper';document.documentElement.dataset.ep27Theme=theme;EPStore.setItem(key+'theme',theme);if(themeButton)themeButton.textContent=theme==='paper'?'◐ Перейти в нічний режим':'☀ Повернути Warm Paper';
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='paper'?'#f4f1e9':'#141f26';};
 let themeButton=null;
 const settings=D('settingsDialog');if(settings){const themeRow=make('div','box ep27-theme-box');themeRow.append(make('strong','','Оформлення · Warm Paper'),P('Світла паперова палітра за замовчуванням. Для вечірнього читання є м’який нічний режим.'));
 themeButton=B('◐ Перейти в нічний режим',()=>setTheme(theme==='paper'?'night':'paper'),'btn alt');themeRow.append(themeButton);
 const oldAppearance=settings.querySelector('.ep22-preferences');if(oldAppearance)oldAppearance.after(themeRow);else settings.prepend(themeRow)}setTheme(theme);
 const brandMark=document.querySelector('.brand-mark');if(brandMark){brandMark.textContent='✦';brandMark.setAttribute('aria-label','English Pocket')}
 const subtitle=document.querySelector('.brand .subtitle');if(subtitle)subtitle.textContent='Your English, your story.';
 const tabIcons={read:'▤',words:'✳',watch:'▷'},tabLabels={read:'Читати',words:'Слова',watch:'Відео'};
 for(const button of document.querySelectorAll('[data-tab]')){const tab=button.dataset.tab;if(!tabIcons[tab])continue;
  const span=button.querySelector('span');if(span){span.textContent=tabIcons[tab];button.setAttribute('aria-label',tabLabels[tab])}
  else button.textContent=tabIcons[tab]+' '+tabLabels[tab];}
 const footer=document.querySelector('.app>footer');if(footer)footer.textContent='English Pocket 27.0.0 · Warm Paper · A2+ → B1 · Навчання й книги залишаються на цьому пристрої';
 // Legacy Canada dialogues are NOT reintroduced. Canada Quest is short, goal-based speaking.
 D('ep18CanadaDetails')?.setAttribute('hidden','');D('ep17Canada')?.setAttribute('hidden','');

 // LANGUAGE DNA: an explanation of actual evidence, not a synthetic CEFR grade.
 const dna=panel('Мовна ДНК · як засвоюються твої фрази','ep27DNA');
 const dnaSelect=make('select','input');dnaSelect.setAttribute('aria-label','Вивчена фраза для аналізу');
 let dnaChoice='';
 function renderDNA(){const area=dna.body;area.replaceChildren(P('Три навички однієї фрази та її реальні джерела. Збереження чи читання саме по собі не означає засвоєння.'));
  const cards=known();if(!cards.length){area.append(P('Спочатку пройди хоча б одну картку в розділі «Слова».'));return}
  const ranked=window.EnglishPocket25?.weakList?.(cards.length)?.map(x=>x.w)||cards;
  dnaSelect.replaceChildren();for(const w of ranked)dnaSelect.add(new Option(w.text,w.id));if(!cards.some(x=>x.id===dnaChoice))dnaChoice=ranked[0].id;dnaSelect.value=dnaChoice;
  dnaSelect.onchange=()=>{dnaChoice=dnaSelect.value;renderDNA()};area.append(dnaSelect);
  const w=cards.find(x=>x.id===dnaChoice),g=window.EnglishPocket25?.grade?.(w);
  area.append(make('strong','',w.text+' — '+w.meaning));
  if(w.example)area.append(make('div','ep27-reader-mini',w.example));
  const grid=make('div','ep27-stat-grid');for(const [id,name] of [['recall','Пригадую'],['listening','Розумію на слух'],['usage','Використовую']]){
   const d=g?.[id],cell=make('div','ep27-stat');cell.append(make('strong','',d?.mastered?'✓':String(d?.independent||0)),make('span','',name),make('span','',d?.mastered?'Підтверджено':'Самостійних успіхів: '+(d?.independent||0)));grid.append(cell)}area.append(grid);
  const events=Array.isArray(w.ep25Brain?.events)?w.ep25Brain.events:[];
  const source=make('div','ep27-inline-card');source.append(make('strong','','Де ти зустрів цю фразу'));
  if(w.source)source.append(P('Картка: '+String(w.source).slice(0,150)));
  if(w.p20Location)source.append(P('Є посилання на місце в книзі.'));
  const vids=Array.isArray(w.ep24VideoSources)?w.ep24VideoSources:[];for(const v of vids.slice(0,3)){
   const parsed=window.EnglishPocket24?.parseVideo?.(v.url);if(!parsed)continue;const a=make('a','btn alt small','▶ Відео з '+Math.floor((Number(v.seconds)||0)/60)+' хв');a.href=parsed.url+'&t='+(Number(v.seconds)||0)+'s';a.target='_blank';a.rel='noopener noreferrer';source.append(a)}
  const storyNow=get(key+'living',{});const scene=SCENES[storyNow.current||'arrival'];if(scene&&norm(scene.text).includes(norm(w.text)))source.append(P('Ця фраза трапляється в поточному епізоді Living Stories.'));
  if(!w.source&&!w.p20Location&&!vids.length)source.append(P('Джерело не записане. Це не впливає на прогрес.'));
  area.append(source,P('Остання зафіксована спроба: '+readDate(events.at(-1)?.at)+'. Підказки й помилки не зараховуються як самостійний успіх.'));
 }
 dna.details.addEventListener('toggle',()=>{if(dna.details.open)renderDNA()});
 D('ep26Coach')?.after(dna.details);

 // LIVING STORIES: original authored branches; explicit choices lead to distinct chapters.
 // Content is not copied or generated from paid courses, and never changes automatically on a timer.
 const SCENES={
  arrival:{title:'1. A New City',text:'Maya arrived in a Canadian city on a cool Monday morning. She carried one suitcase and a small bag with her documents. She was excited but also nervous. Outside the station, she looked at the map on her phone. The street signs were easy to read, but she did not know which way to go. A friendly woman stopped nearby. Maya had a choice: she could take the bus and try to find her way, or she could ask the woman for help.',question:'Why did Maya feel nervous?',answers:['She had lost her suitcase.','She did not know how to get around.','She was late for work.'],correct:1,options:[['Take the bus and read the map','bus'],['Ask the woman for directions','directions']]},
  bus:{title:'2A. The Bus Journey',text:'Maya got on the bus and paid her fare. She sat by the window and watched the city pass by. After a few minutes, she noticed a library and a small park. The bus driver announced the next stop, but Maya was not sure whether it was hers. She politely asked, “Excuse me, is this the stop for King Street?” The driver smiled and told her to get off at the following stop. Maya thanked him. She realized that asking a simple question could make a difficult day easier.',question:'Who helped Maya on the bus?',answers:['A bus driver','A teacher','A neighbour'],correct:0,options:[['Continue to the apartment','home']]},
  directions:{title:'2B. A Friendly Stranger',text:'Maya decided to ask the woman for help. “Could you tell me how to get to King Street?” she asked. The woman explained that Maya could walk for ten minutes or take a bus. She also pointed to a quiet café where Maya could rest. Maya repeated the directions to check that she had understood. “That’s right,” the woman said. Maya thanked her and walked towards the apartment. She was still nervous, but now she knew one useful thing: she could ask for help when she needed it.',question:'What did Maya do to check the directions?',answers:['She wrote a long email.','She repeated them.','She called her boss.'],correct:1,options:[['Continue to the apartment','home']]},
  home:{title:'3. Finding a Place to Live',text:'The apartment was clean and bright. Maya liked the big window and the quiet street. The landlord explained the rent and showed her the kitchen. Maya wanted to find a place to live where she could study English and sleep well. She had saved some money, but she still needed to plan her budget. The landlord offered her two possibilities: a small studio or a room in a shared apartment. Maya had to think carefully about what would make her feel at home.',question:'What were Maya’s two housing options?',answers:['A hotel and a house','A studio and a shared room','A tent and a cottage'],correct:1,options:[['Choose the shared room','roommate'],['Choose the studio','studio']]},
  roommate:{title:'4A. A New Roommate',text:'Maya chose the room in the shared apartment. Her roommate, Olivia, welcomed her and showed her where to keep her groceries. They spoke about work, study and daily routines. Olivia liked to cook in the evening, while Maya preferred to eat early. They agreed on a few simple rules and wrote them on the fridge. That night, Maya felt less alone. She had not expected to make a friend on her first day. Before bed, Olivia suggested visiting the grocery store together tomorrow.',question:'How did Maya and Olivia agree on household rules?',answers:['They wrote them on the fridge.','They asked the police.','They did not discuss them.'],correct:0,options:[['Go shopping','market']]},
  studio:{title:'4B. A Quiet Studio',text:'Maya chose the small studio. She liked having her own space to read and practise English. After carrying her suitcase upstairs, she made a cup of tea and sat by the window. The apartment was quiet, but she knew that she would need to meet people outside. She wrote a short list: find a grocery store, learn the bus route and visit the library. The next morning, she planned to go shopping and introduce herself to someone in the neighbourhood.',question:'Why did Maya choose the studio?',answers:['She wanted her own quiet space.','She wanted a bigger kitchen for ten people.','It was next to her old home.'],correct:0,options:[['Go shopping','market']]},
  market:{title:'5. At the Grocery Store',text:'At the grocery store, Maya checked the price of bread, eggs and fruit. She wanted to make a shopping list for the week, because she needed to save money. Some vegetables were on sale. She could not find oatmeal, and she was not sure which aisle to try. She considered two options: ask an employee or continue looking at the labels. It was a small decision, but she wanted to become more confident speaking English in everyday situations.',question:'Why did Maya make a shopping list?',answers:['To save money and plan meals','To prepare for a job interview','To send it to her neighbour'],correct:0,options:[['Ask an employee','askstaff'],['Read the aisle labels','labels']]},
  askstaff:{title:'6A. A Helpful Employee',text:'Maya walked up to an employee and asked, “Excuse me, where can I find oatmeal?” The employee pointed to the breakfast aisle and explained which boxes were on sale. Maya listened carefully and repeated the word “aisle” to practise its pronunciation. She thanked the employee and found what she needed. At the checkout, she paid by card. She left the store feeling proud because she had spoken English without preparing every sentence in advance.',question:'How did Maya feel after shopping?',answers:['Proud of speaking English','Angry about the weather','Worried about her suitcase'],correct:0,options:[['Prepare for the first workday','work']]},
  labels:{title:'6B. Finding the Right Aisle',text:'Maya decided to read the signs above the aisles. First she checked “Baking,” then “Breakfast.” At last, she found oatmeal next to the cereal. She looked at two brands and compared the prices. It took a little longer than asking someone, but she learned several useful words. At the checkout, the cashier asked whether she needed a bag. Maya answered clearly and paid by card. She thought that next time she might try asking a question too.',question:'Where did Maya find oatmeal?',answers:['In the breakfast aisle','At the bus stop','In a clothes shop'],correct:0,options:[['Prepare for the first workday','work']]},
  work:{title:'7. The First Workday',text:'On Monday, Maya started her new job. She could work with data and solve problems, but the office vocabulary was new to her. Her manager explained the morning tasks and asked her to prepare a short report. Maya did not understand one part of the instructions. She wanted to make a good impression and finish the task correctly. She had a choice: ask a colleague to explain the difficult part or read the written instructions again before starting.',question:'What task did the manager give Maya?',answers:['Prepare a short report','Fix a bus','Cook dinner for everyone'],correct:0,options:[['Ask a colleague for clarification','colleague'],['Read the instructions again','instructions']]},
  colleague:{title:'8A. Working in a Team',text:'Maya asked her colleague Ben for help. He explained the report in simple English and showed her an example. Maya took notes, then tried the task herself. When she finished, Ben checked the numbers and thanked her for working carefully. They spoke about how teams solve problems by sharing information. Maya realized that asking questions was not a weakness. It helped her gain experience and work more confidently with other people.',question:'What helped Maya finish the report?',answers:['A clear explanation and an example','A new laptop from a shop','A day off'],correct:0,options:[['The winter weekend','winter']]},
  instructions:{title:'8B. Careful Reading',text:'Maya opened the written instructions and read them slowly. She highlighted the important steps, checked the example and made a short list. Some terms were unfamiliar, so she looked them up in her personal vocabulary notebook. After a while, she understood what to do and finished the report. Her manager was pleased with the careful result. Maya was glad that reading had helped her, and she promised herself to ask for help if something remained unclear next time.',question:'What strategy did Maya use?',answers:['Read carefully and make a list','Guess every instruction','Ignore the report'],correct:0,options:[['The winter weekend','winter']]},
  winter:{title:'9. A Winter Weekend',text:'A few weeks later, snow covered the streets. Maya was getting used to the cold, but she still missed her family. She wanted to meet new people and feel at home. At the library, she saw a poster about a community event and a volunteer programme. Both sounded interesting. She knew that she could improve her English by talking to other people. She decided to take one more step outside her comfort zone.',question:'Why did Maya want to join an activity?',answers:['To meet people and use English','To buy a new suitcase','To avoid reading books'],correct:0,options:[['Join the community event','community'],['Try volunteering','volunteer']]},
  community:{title:'10A. A New Community',text:'Maya attended the community event at the library. She met neighbours, shared stories and discovered a local walking group. At first she made a few grammar mistakes, but everyone understood her. She listened to the others and asked follow-up questions. By the end of the evening, she had made plans to meet two new friends for coffee. Maya thought about her first day in the city. She had come a long way, one conversation at a time.',question:'What did Maya do at the event?',answers:['Met neighbours and made plans','Bought a plane ticket','Changed her job'],correct:0,options:[]},
  volunteer:{title:'10B. Helping Others',text:'Maya joined a weekend volunteer project at a community garden. She worked with a small group, carried tools and asked what needed to be done. The team was friendly and patient. She learned new words for plants and gardening, but more importantly, she practised speaking in a real situation. After the project, Maya felt proud and connected to her new city. She had discovered that helping others could also help her build a new life.',question:'What did volunteering help Maya practise?',answers:['Speaking English with others','Driving a bus','Repairing computers'],correct:0,options:[]}
 };
 const living=panel('Living Stories · історія з вибором подій','ep27Living');
 const defaultState=()=>({current:'arrival',visited:[],completed:{},answers:{},choices:{},summaries:{},updated:0});
 function storyState(){const s=get(key+'living',defaultState());return {...defaultState(),...s}}
 function recordStory(s){s.updated=Date.now();put(key+'living',s)}
 function renderLiving(){const body=living.body;body.replaceChildren();const state=storyState(),id=SCENES[state.current]?state.current:'arrival',scene=SCENES[id];
  const completed=Object.keys(state.completed||{}).length;
  body.append(make('span','ep27-eyebrow','NORTHERN DAYS · ORIGINAL SERIES'),make('strong','ep27-focus-title',scene.title),P(`Завершено епізодів: ${completed}. Твій вибір визначає наступну сцену, а відповіді зберігаються на пристрої.`));
  const story=make('div','ep27-story-text',scene.text);body.append(story);
  const controls=make('div','ep27-actions');controls.append(B('🔊 Прослухати',()=>speakEnglish(scene.text),'btn alt small'));
  if(state.visited.length>0)controls.append(B('← Попередній епізод',()=>{const s=storyState();const prev=s.visited.pop();if(prev&&SCENES[prev]){s.current=prev;recordStory(s);renderLiving()}},'btn ghost small'));
  body.append(controls);
  const question=make('div','ep27-inline-card ep27-stack');question.append(make('strong','','Розуміння тексту'),P(scene.question));
  const answerBox=make('div','ep27-stack');const choiceOfAnswer=state.answers[id];for(let i=0;i<scene.answers.length;i++){
   const a=B(scene.answers[i],()=>{const s=storyState();s.answers[id]=i;recordStory(s);renderLiving()},'ep27-choice'+(choiceOfAnswer===i?' selected':''));a.setAttribute('aria-pressed',String(choiceOfAnswer===i));answerBox.append(a)}question.append(answerBox);
  if(choiceOfAnswer!==undefined){question.append(P(choiceOfAnswer===scene.correct?'✓ Так, деталь зрозуміла.':'Спробуй ще раз — відповідь є безпосередньо в тексті.'))}body.append(question);
  const notes=make('textarea','input');notes.rows=2;notes.maxLength=1800;notes.placeholder='Наприклад: Maya asked for help because…';notes.value=state.summaries[id]||'';
  body.append(line('Мій короткий переказ англійською (необов’язково)',notes));
  const path=make('div','ep27-stack');path.append(make('strong','','Що відбудеться далі?'));
  const selected=state.choices[id];if(scene.options.length){for(const [label,next] of scene.options){const b=B(label,()=>{const s=storyState();s.choices[id]=next;s.summaries[id]=notes.value.trim();recordStory(s);renderLiving()},'ep27-choice'+(selected===next?' selected':''));b.setAttribute('aria-pressed',String(selected===next));path.append(b)}}else path.append(P('Це завершення обраної сюжетної гілки. Можна розпочати інший маршрут.'));
  body.append(path);
  const learned=known().filter(w=>norm(scene.text).includes(norm(w.text))).slice(0,4);if(learned.length)body.append(P('Твої вже вивчені фрази в цій історії: '+learned.map(w=>w.text).join(' · ')));
  const done=choiceOfAnswer===scene.correct&&(selected||!scene.options.length);
  const next=scene.options.find(x=>x[1]===selected)?.[1];
  const footer=make('div','ep27-actions');const finish=B(scene.options.length?'✓ Завершити й продовжити':'✓ Завершити історію',()=>{
   const s=storyState();s.completed[id]=Date.now();s.summaries[id]=notes.value.trim();if(next){s.visited.push(id);s.current=next}recordStory(s);renderLiving();if(next)living.details.scrollIntoView({behavior:'smooth',block:'start'});
   else toast('Фінал історії! Можеш пройти інший маршрут.');
  },'btn small');finish.disabled=!done;footer.append(finish);
  footer.append(B('Почати інший маршрут',()=>{if(!confirm('Почати історію спочатку? Минулі відповіді й завершені епізоди збережуться.'))return;const s=storyState();s.current='arrival';s.visited=[];recordStory(s);renderLiving()},'btn ghost small'));
  body.append(footer,P('Вправи не оцінюють письмо автоматично. Ротація й розгалуження керуються твоїм вибором. Старі короткі історії залишаються доступними.'));
 }
 living.details.addEventListener('toggle',()=>{if(living.details.open)renderLiving()});
 // Keep original stories; make them an optional, collapsed library under the new serial.
 const formerStories=ep21DrawStories;
 ep21DrawStories=function(...args){const result=formerStories(...args);if(!ep21Display)return result;const other=make('details','ep27-panel'),summary=make('summary','','Попередні історії та завдання'),content=make('div','ep27-body');
  while(ep21Display.firstChild)content.append(ep21Display.firstChild);other.append(summary,content);ep21Display.append(living.details,other);return result};

 // CANADA QUEST: practical authored speaking missions, not canned branching dialogues.
 const QUESTS=[
  {id:'housing',title:'Finding a Home',prompt:'You are calling about an apartment. Ask if it is still available and when you can see it.',guide:'Could you tell me if the apartment is still available? When could I come to see it?',check:'Ти запитав про наявність житла та час перегляду?',phrases:['find a place to live','ask for help']},
  {id:'bus',title:'Getting Around',prompt:'You are at a bus stop. Ask someone which bus goes to the library.',guide:'Excuse me, which bus goes to the library? How long does it take?',check:'Ти ввічливо запитав про маршрут?',phrases:['get around','ask for help']},
  {id:'shop',title:'At the Store',prompt:'You cannot find oatmeal. Ask an employee where it is and whether you can pay by card.',guide:'Excuse me, where can I find oatmeal? Can I pay by card?',check:'Ти запитав про товар і спосіб оплати?',phrases:['pay by card','check the price']},
  {id:'job',title:'A Job Interview',prompt:'The interviewer asks you about your skills. Explain what you can do and give one example.',guide:'I can work with data and solve problems. In my last job, I prepared reports for my team.',check:'Ти назвав навичку та конкретний приклад?',phrases:['solve problems','work in a team']},
  {id:'appointment',title:'Making an Appointment',prompt:'Call a clinic. Ask for an appointment and explain that you would prefer the morning.',guide:'Hello. I would like to make an appointment, please. Do you have any morning times available?',check:'Ти пояснив, що хочеш записатися, і уточнив час?',phrases:['make time for','ask for help']},
  {id:'neighbour',title:'Meeting a Neighbour',prompt:'Introduce yourself to a neighbour. Say that you are new to the area and ask about a good place to visit.',guide:'Hi, I am new to the neighbourhood. Nice to meet you! Is there a good park nearby?',check:'Ти представився й поставив відкрите запитання?',phrases:['settle in','feel at home']}
 ];
 const quest=panel('Canada Quest · практичні ситуації','ep27Canada');
 function questState(){return get(key+'quest',{index:0,results:{}})}
 function renderQuest(){const s=questState(),i=Math.max(0,Math.min(QUESTS.length-1,Number(s.index)||0)),q=QUESTS[i],n=Object.values(s.results||{}).filter(x=>x.done).length;
  const host=quest.body;host.replaceChildren(make('span','ep27-eyebrow',`СИТУАЦІЯ ${i+1} ІЗ ${QUESTS.length}`),make('strong','ep27-focus-title',q.title),P(`Виконано: ${n} з ${QUESTS.length}. Не юридична чи медична консультація; тренуємо лише англійську.`));
  const selector=make('select','input');selector.setAttribute('aria-label','Обрати ситуацію');QUESTS.forEach((item,j)=>selector.add(new Option((s.results[item.id]?.done?'✓ ':'')+item.title,String(j))));selector.value=String(i);selector.onchange=()=>{const o=questState();o.index=Number(selector.value);put(key+'quest',o);renderQuest()};host.append(selector);
  const box=make('div','ep27-inline-card ep27-stack');box.append(make('strong','','Your mission'),make('p','',q.prompt));box.append(B('🔊 Прослухати завдання',()=>speakEnglish(q.prompt),'btn alt small'));host.append(box);
  const field=make('textarea','input');field.rows=3;field.maxLength=1800;field.value=s.results[q.id]?.answer||'';field.placeholder='Напиши свою відповідь англійською або проговори її вголос.';host.append(line('Твоя відповідь',field));
  const studied=new Set(known().map(w=>norm(w.text))),suggested=q.phrases.filter(p=>studied.has(norm(p)));
  if(suggested.length)host.append(P('Можеш використати вже вивчені фрази: '+suggested.join(' · ')));
  const model=make('div','ep27-reader-mini',q.guide);model.hidden=true;const self=make('div','ep27-note',q.check);
  host.append(B('Показати зразок для самоперевірки',()=>{model.hidden=!model.hidden},'btn ghost small'),model,self);
  const actions=make('div','ep27-actions');actions.append(B('🎙 Відповісти вголос',()=>window.EnglishPocket25?.openSpeaking?.(q.prompt,'canada-quest:'+q.id),'btn alt small'));
  actions.append(B('✓ Зберегти виконання',()=>{if(field.value.trim().length<12){toast('Напиши коротку відповідь. Усний запис можеш зробити додатково.');return}
   const next=questState();next.results[q.id]={answer:field.value.trim().slice(0,1800),done:true,at:Date.now()};next.index=(i+1)%QUESTS.length;if(put(key+'quest',next))renderQuest()},'btn small'));
  host.append(actions,P('Ніяких вигаданих оцінок вимови: результат відмічаєш сам після перевірки зі зразком.'));
 }
 quest.details.addEventListener('toggle',()=>{if(quest.details.open)renderQuest()});
 const watch=D('watchPane');const videoList=D('videoList');const lab=D('ep241Lab');if(lab)lab.after(quest.details);else videoList?.before(quest.details);

 // POCKET WALK: hands-free sequential listening and recall using already studied cards.
 // Audio progress is NOT treated as verified mastery. Browser may pause speech in background.
 const walk=panel('Pocket Walk · слухай і повторюй','ep27Walk');
 const walkStatus=make('div','ep27-audio-status','Готово до аудіопрогулянки. Використовуються тільки вивчені картки.');
 const walkControls=make('div','ep27-actions');walk.body.append(P('Без екрана: чуєш підказку, маєш паузу для власної відповіді, потім слухаєш англійський зразок. У разі відсутності українського голосу — режим повторення англійською.'),walkControls,walkStatus);
 const walkInfo=make('p','ep27-note','Звукове тренування не означає, що картку вже засвоєно. На деяких телефонах озвучування може зупинятися при блокуванні екрана.');walk.body.append(walkInfo);
 let run=null,runTimer=null,runToken=0;
 const stopWalk=(message='Зупинено')=>{runToken++;clearTimeout(runTimer);runTimer=null;run=null;if('speechSynthesis'in window)speechSynthesis.cancel();status(walkStatus,message);paintWalk()};
 function availableVoices(){try{return speechSynthesis.getVoices()}catch{return []}}
 function selectVoice(lang){const voices=availableVoices();return lang==='en'?window.EP22?.voiceChoice?.()||voices.find(v=>/^en\b/i.test(v.lang)):voices.find(v=>/^uk\b/i.test(v.lang))||null}
 function say(text,lang,token,next){if(!run||runToken!==token)return;
  const u=new SpeechSynthesisUtterance(String(text).slice(0,280)),v=selectVoice(lang);u.lang=v?.lang||(lang==='uk'?'uk-UA':'en-CA');if(v)u.voice=v;u.rate=lang==='en'?.83:.95;let handled=false;
  u.onend=()=>{if(handled)return;handled=true;if(runToken===token)next()};
  u.onerror=()=>{if(handled)return;handled=true;if(runToken===token)next()};
  try{speechSynthesis.speak(u)}catch{next()}
 }
 function delay(ms,token,fn){clearTimeout(runTimer);runTimer=setTimeout(()=>{if(runToken===token&&run)fn()},ms)}
 function advanceWalk(token){if(!run||runToken!==token)return;
  if(run.index>=run.cards.length){const c=run.cards.length;const old=get(key+'walk',{sessions:0,heard:0});put(key+'walk',{...old,sessions:(old.sessions||0)+1,heard:(old.heard||0)+c,last:Date.now()});stopWalk('Готово! Прослухано '+c+' вивчених фраз. Це аудіопрактика, не оцінка знання.');return}
  const w=run.cards[run.index],n=run.index+1;status(walkStatus,'Фраза '+n+' із '+run.cards.length+' · слухай і відповідай');
  const finish=()=>{delay(950,token,()=>{run.index++;advanceWalk(token)})};
  const model=()=>say(w.text,'en',token,finish);
  const uk=selectVoice('uk');if(uk){say('Як сказати англійською: '+w.meaning,'uk',token,()=>delay(4500,token,model))}
  else{say(w.text,'en',token,()=>delay(3500,token,()=>say(w.text,'en',token,finish)))}
 }
 function beginWalk(n){const pool=known();if(!pool.length){status(walkStatus,'Поки немає вивчених карток. Спочатку пройди навчання у «Словах».');return}
  if(!('speechSynthesis'in window)){status(walkStatus,'Цей браузер не підтримує озвучування.');return}
  window.EnglishPocket24?.stopNarration?.();speechSynthesis.cancel();
  const score=w=>{const g=window.EnglishPocket25?.grade?.(w);const fails=(w.ep25Brain?.events||[]).filter(e=>e.skill==='listening'&&(!e.ok||e.assisted)).length;return fails*12+(g?.listening?.mastered?0:16)+(Number(w.srs?.due||0)>0&&Number(w.srs.due)<Date.now()?9:0)};
  const sorted=pool.slice().sort((a,b)=>score(b)-score(a));const old=get(key+'walk',{lastIds:[]});const fresh=sorted.filter(w=>!old.lastIds?.includes(w.id));const arr=[...fresh,...sorted.filter(w=>old.lastIds?.includes(w.id))].slice(0,Math.min(n,pool.length));
  put(key+'walk',{...old,lastIds:arr.map(w=>w.id)});runToken++;run={cards:arr,index:0};paintWalk();advanceWalk(runToken);
 }
 function paintWalk(){walkControls.replaceChildren();if(run){walkControls.append(B('■ Зупинити',()=>stopWalk(),'btn alt small'),B('↻ Повторити поточну',()=>{const item=run;const token=++runToken;speechSynthesis.cancel();run=item;advanceWalk(token)},'btn ghost small'))}
  else{walkControls.append(B('▶ 5 фраз',()=>beginWalk(5),'btn small'),B('▶ 10 фраз',()=>beginWalk(10),'btn alt small'))}}
 paintWalk();D('ep26Coach')?.after(walk.details);

 // One prominent next-action; other tools stay collapsed and discoverable.
 const journey=D('ep24Journey');if(journey){journey.classList.add('ep27-focus-card');
  // Existing course routines redraw the inner HTML; retain our heading after every redraw.
  const ensureMarker=()=>{if(!journey.querySelector(':scope > .ep27-eyebrow'))journey.prepend(make('div','ep27-eyebrow','YOUR ENGLISH TODAY · ОСОБИСТА МІСІЯ'))};
  ensureMarker();new MutationObserver(ensureMarker).observe(journey,{childList:true});
  // There must be one dominant learning card on mobile, not two competing starts.
  // Keep the existing new-lesson coach accessible, but fold it when revision is ready.
  const legacyCoach=D('p20Coach');if(legacyCoach){
   const lesson=make('details','ep27-panel ep27-new-lesson');const header=make('summary','','Нові фрази · окремий урок');
   legacyCoach.before(lesson);lesson.append(header,legacyCoach);
   const refresh=()=>{const empty=known().length===0;journey.hidden=empty;if(lesson.open!==empty)lesson.open=empty};
   refresh();new MutationObserver(refresh).observe(legacyCoach,{childList:true,subtree:false});
  }
 }
 // A single quiet route from Video → Vocabulary → Stories → Speaking without copying video transcripts.
 const route=panel('Мій навчальний маршрут · 4 кроки','ep27Route');
 route.body.append(P('Курс уже зберігає перегляд і нотатки. Тут лише коротка послідовність, щоб не загубитися серед інструментів.'));
 const steps=[['1','Відео','Подивися поточний урок Боба чи Vanessa. Збережи лише потрібні фрази.'],['2','Слова','Пройди нові картки, а складні — повтори за SRS.'],['3','Історія','Прочитай наступний епізод Living Stories та обери продовження.'],['4','Мовлення','Склади власні речення або виконай Canada Quest.']];
 const flow=make('div','ep27-steps');for(const [num,title,desc] of steps){const row=make('div','ep27-step');row.append(make('span','ep27-step-dot',num));const item=make('div');item.append(make('strong','',title),P(desc));row.append(item);flow.append(row)}route.body.append(flow);
 route.body.append(B('Відкрити поточний курс',()=>{D('ep241Lab').open=true;D('ep241Lab').scrollIntoView({block:'start',behavior:'smooth'})},'btn small'));
 const insert= D('ep241Lab');if(insert)insert.before(route.details);else videoList?.before(route.details);

 // Expose read-only QA hooks. No special data migration, no cloud interaction.
 window.EnglishPocket27={version:'27.0.0',scenes:SCENES,quests:QUESTS,known,storyState,renderLiving,renderQuest,renderDNA,stopWalk,setTheme};
})();
