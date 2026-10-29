/* English Pocket 20.0 · author-written, level-appropriate scripted conversations.
   Fictional examples. Healthcare, banking and housing rules vary by region/provider. */
'use strict';
const P20_SCENES=[
{id:'housing',icon:'🏠',name:'Перегляд квартири',role:'Орендодавець',level:'A2+–B1',goal:'З’ясувати доступність житла, оплату та час перегляду.',note:'Умови оренди й депозити залежать від провінції; завжди перевіряй договір.',
 steps:[
 {other:'Hello! Thanks for calling. How can I help you?',en:'Is this apartment still available?',uk:'Ця квартира ще доступна?',reply:'Yes, it is. Would you like to arrange a viewing?',hint:'Почни з: Is this apartment…'},
 {other:'We have a few viewing times this week. When could you come?',en:'Could I come on Saturday morning?',uk:'Чи можу я прийти в суботу вранці?',reply:'Saturday morning works. I’ll confirm the exact time by message.',hint:'Could I come…?'},
 {other:'The monthly rent is listed in the ad. Do you have any questions?',en:'Are utilities included in the rent?',uk:'Комунальні послуги включені в оренду?',reply:'Water is included, but electricity is extra. I can send you the details.',hint:'Are utilities included…?'},
 {other:'Is there anything else you would like to know before the viewing?',en:'Could you send me the address, please?',uk:'Не могли б ви надіслати мені адресу?',reply:'Of course. I’ll send the address and viewing details by email.',hint:'Could you send me…?'}],
 extra:[{other:'I can send you the lease to read before you decide.',en:'Could I read the lease before signing?',uk:'Чи можу я прочитати договір перед підписанням?',reply:'Absolutely. Take your time and ask if anything is unclear.'}]},
{id:'pharmacy',icon:'💊',name:'В аптеці',role:'Фармацевт',level:'A2+',goal:'Отримати рецепт і уточнити порядок приймання.',note:'Поради щодо ліків дає фармацевт; діалог — мовна практика, не медична рекомендація.',
 steps:[
 {other:'Hi there! What can I do for you today?',en:'I need to pick up a prescription.',uk:'Мені потрібно забрати ліки за рецептом.',reply:'Sure. Can I have your name, please?',hint:'I need to pick up…'},
 {other:'Thank you. Could you confirm your date of birth?',en:'Sure. My date of birth is May tenth.',uk:'Звичайно. Моя дата народження — 10 травня.',reply:'Thanks. I’ve found your prescription.',hint:'My date of birth is…'},
 {other:'Do you have any questions for the pharmacist?',en:'Could you explain how to take this medicine?',uk:'Не могли б ви пояснити, як приймати ці ліки?',reply:'Of course. I’ll ask the pharmacist to go over the instructions with you.',hint:'Could you explain…?'},
 {other:'Would you like to speak with the pharmacist now?',en:'Yes, please. I have a question.',uk:'Так, будь ласка. У мене є запитання.',reply:'Certainly. The pharmacist will be with you shortly.',hint:'I have a question.'}],
 extra:[{other:'I’m sorry, could you repeat that?',en:'Could you please speak more slowly?',uk:'Не могли б ви говорити повільніше?',reply:'Of course. I’ll explain it more slowly.'}]},
{id:'bank',icon:'🏦',name:'У банку',role:'Працівник банку',level:'A2+–B1',goal:'Запитати про рахунок, документи й комісії.',note:'Вимоги до документів і банківські тарифи уточнюй безпосередньо в банку.',
 steps:[
 {other:'Good morning! How can I help you?',en:'I would like to open a bank account.',uk:'Я хотів би відкрити банківський рахунок.',reply:'Certainly. Are you looking for a chequing account?',hint:'I would like to open…'},
 {other:'We have a few options. What would you like to know?',en:'Is there a monthly fee?',uk:'Чи є щомісячна комісія?',reply:'It depends on the account. Let me show you the options.',hint:'Is there a monthly fee?'},
 {other:'To get started, we’ll need to confirm your identity.',en:'What documents do I need to bring?',uk:'Які документи мені потрібно принести?',reply:'I can give you the current list of acceptable identification.',hint:'What documents do I need…?'},
 {other:'Would you like a copy of the account details?',en:'Yes, please. Could you email them to me?',uk:'Так, будь ласка. Можете надіслати їх електронною поштою?',reply:'Of course. I can send the information to your email.',hint:'Could you email…?'}],
 extra:[{other:'Do you have any other questions about the account?',en:'Could you explain the fees again?',uk:'Можете ще раз пояснити комісії?',reply:'Certainly. Let’s go through them one by one.'}]},
{id:'interview',icon:'💼',name:'Співбесіда',role:'Рекрутер',level:'B1',goal:'Розповісти про досвід та уточнити умови роботи.',note:'Тренуй короткі правдиві відповіді; не потрібно вигадувати досвід.',
 steps:[
 {other:'Thanks for coming in. Could you tell me a little about yourself?',en:'I have experience in this field.',uk:'Я маю досвід у цій сфері.',reply:'Great. Can you tell me about your previous responsibilities?',hint:'I have experience in…'},
 {other:'What did you usually do in your previous role?',en:'I worked with a small team.',uk:'Я працював у невеликій команді.',reply:'Good to know. We work closely as a team here, too.',hint:'I worked with…'},
 {other:'Why are you interested in this position?',en:'I would like to develop my skills.',uk:'Я хотів би розвивати свої навички.',reply:'That sounds like a good goal. Thank you.',hint:'I would like to…'},
 {other:'Do you have any questions for me?',en:'Could you tell me more about the role?',uk:'Не могли б ви розповісти більше про цю посаду?',reply:'Absolutely. Let me explain the day-to-day responsibilities.',hint:'Could you tell me more…?'}],
 extra:[{other:'Sometimes the schedule changes. Would that be okay?',en:'Could you tell me about the work schedule?',uk:'Можете розповісти про робочий графік?',reply:'Yes. I can explain the shifts and how we plan them.'}]},
{id:'transit',icon:'🚌',name:'Громадський транспорт',role:'Працівник транспортної служби',level:'A2+',goal:'Уточнити маршрут, пересадку й зупинку.',note:'Маршрути та способи оплати залежать від міста.',
 steps:[
 {other:'Hello! Do you need a hand?',en:'Does this bus go downtown?',uk:'Цей автобус їде до центру?',reply:'Yes, it does. It stops near the main square.',hint:'Does this bus go…?'},
 {other:'Where exactly are you trying to get to?',en:'I need to get to the library.',uk:'Мені потрібно доїхати до бібліотеки.',reply:'Okay. You’ll need to get off near the park.',hint:'I need to get to…'},
 {other:'You may need to change buses. Do you want directions?',en:'Do I need to transfer?',uk:'Мені потрібно робити пересадку?',reply:'Yes, once. I’ll show you the stop on the map.',hint:'Do I need to…?'},
 {other:'Is there anything else I can help you with?',en:'Could you tell me where to get off?',uk:'Скажіть, будь ласка, де мені вийти?',reply:'Sure. Get off at the next stop after the hospital.',hint:'Could you tell me where…?'}],
 extra:[{other:'Sorry, the bus is a little noisy.',en:'Could you please repeat that?',uk:'Не могли б ви повторити?',reply:'Of course. Get off after the hospital.'}]},
{id:'cafe',icon:'☕',name:'Кафе',role:'Бариста',level:'A2+',goal:'Зробити замовлення, уточнити деталі та оплатити.',note:'Простий канадський сервісний діалог, без неприродних фраз.',
 steps:[
 {other:'Hi! What can I get started for you?',en:'Could I have a medium coffee, please?',uk:'Можна мені середню каву, будь ласка?',reply:'Absolutely. Would you like milk or sugar?',hint:'Could I have…?'},
 {other:'Would you like anything in your coffee?',en:'Just a little milk, please.',uk:'Тільки трохи молока, будь ласка.',reply:'No problem. Would you like anything to eat?',hint:'Just a little…'},
 {other:'Would you like a muffin as well?',en:'No, thanks. That is all.',uk:'Ні, дякую. Це все.',reply:'Okay! Your total is on the screen.',hint:'That is all.'},
 {other:'Will you be paying by card?',en:'Yes, I will pay by card.',uk:'Так, я заплачу карткою.',reply:'Great. You can tap your card when you’re ready.',hint:'I will pay by…'}],
 extra:[{other:'Would you like your coffee for here or to go?',en:'To go, please.',uk:'З собою, будь ласка.',reply:'Sure. I’ll put a lid on it.'}]},
{id:'clinic',icon:'🩺',name:'Запис до клініки',role:'Реєстратор',level:'A2+–B1',goal:'Записатися, уточнити час і попросити повторити інформацію.',note:'Типи клінік, доступність послуг і страхове покриття різняться.',
 steps:[
 {other:'Good morning, how can I help you?',en:'I would like to make an appointment.',uk:'Я хотів би записатися на прийом.',reply:'Of course. What kind of appointment do you need?',hint:'I would like to make…'},
 {other:'We have an opening on Thursday afternoon.',en:'Is there anything available in the morning?',uk:'Є щось вільне вранці?',reply:'Let me check. Yes, we have a morning appointment on Friday.',hint:'Is there anything available…?'},
 {other:'Would Friday morning work for you?',en:'Yes, Friday morning works for me.',uk:'Так, ранок п’ятниці мені підходить.',reply:'Great. I’ll book that time.',hint:'Friday morning works…'},
 {other:'Please arrive a few minutes early. Any questions?',en:'Could you repeat the time, please?',uk:'Можете повторити час, будь ласка?',reply:'Of course. Your appointment is on Friday at nine thirty.',hint:'Could you repeat…?'}],
 extra:[{other:'Would you like us to send a reminder?',en:'Yes, please send me a reminder.',uk:'Так, будь ласка, надішліть мені нагадування.',reply:'Sure. We’ll send a reminder before the appointment.'}]},
{id:'neighbour',icon:'👋',name:'Знайомство із сусідами',role:'Сусід',level:'A2+',goal:'Познайомитися, розповісти про себе й підтримати розмову.',note:'Невимушена побутова розмова.',
 steps:[
 {other:'Hi there! I don’t think we’ve met. I’m Sam.',en:'Nice to meet you. I am new here.',uk:'Приємно познайомитися. Я тут нещодавно.',reply:'Welcome to the neighbourhood! How are you settling in?',hint:'Nice to meet you…'},
 {other:'Have you lived in Canada for long?',en:'I recently moved to Canada.',uk:'Я нещодавно переїхав до Канади.',reply:'Oh, welcome! How are you finding it so far?',hint:'I recently moved…'},
 {other:'How are you finding the neighbourhood?',en:'I really like this neighbourhood.',uk:'Мені дуже подобається цей район.',reply:'That’s great! It’s a friendly place.',hint:'I really like…'},
 {other:'Is there anything I can help you with?',en:'Is there a grocery store nearby?',uk:'Поблизу є продуктовий магазин?',reply:'Yes, there’s one about a ten-minute walk from here.',hint:'Is there a grocery store…?'}],
 extra:[{other:'Let me know if you need any help settling in.',en:'Thank you. I really appreciate it.',uk:'Дякую. Я дуже це ціную.',reply:'You’re very welcome!'}]}
];
