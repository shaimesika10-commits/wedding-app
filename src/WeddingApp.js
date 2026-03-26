import { useState, useEffect } from "react";
import { supabase } from './supabase';
```
/* ══════════════════════════════════════════════════════════════
   TRANSLATIONS (same as before)
══════════════════════════════════════════════════════════════ */
const LANGS = {
  en: { code:"en", label:"English",  flag:"🇬🇧", dir:"ltr" },
  he: { code:"he", label:"עברית",    flag:"🇮🇱", dir:"rtl" },
  fr: { code:"fr", label:"Français", flag:"🇫🇷", dir:"ltr" },
  ar: { code:"ar", label:"العربية",  flag:"🇸🇦", dir:"rtl" },
  ru: { code:"ru", label:"Русский",  flag:"🇷🇺", dir:"ltr" },
};
const T = {
  en: {
    tagline:"Digital Wedding Invitations", heroTitle:["Your love story","create the perfect invitation now"],
    heroSub:"Create an exquisite digital invitation, collect RSVPs from guests without any login — and track everything live.",
    createBtn:"Create Invitation", dashBtn:"Couple's Dashboard", previewLink:"Preview RSVP page →",
    feat1T:"Bespoke Design",     feat1D:"Five curated palettes with floral ornaments & your photo",
    feat2T:"Effortless RSVPs",   feat2D:"Guests confirm in seconds — no login, no friction",
    feat3T:"Live Dashboard",     feat3D:"Track responses, headcounts & dietary needs in real time",
    feat4T:"Bit Integration",    feat4D:"Let guests send a gift directly from the invitation — coming soon",
    builderTitle:"Invitation Builder", back:"← Back", saveBtn:"Save & Continue",
    tabContent:"Content", tabDesign:"Design", tabPhoto:"Photo",
    lBride:"Bride's Name", lGroom:"Groom's Name", lDate:"Date (written out)", lYear:"Year (written out)",
    lTime:"Time (written out)", lVenue:"Venue Name", lAddress:"Full Address",
    lDeadline:"RSVP Deadline", lMessage:"Invitation Message",
    paletteLabel:"Colour Palette", darkPalette:"Dark palette", lightPalette:"Light palette",
    uploadPhoto:"Upload Couple Photo", uploadDesc:"A circular portrait appears at the top of your invitation",
    removePhoto:"Remove Photo", livePreview:"Live Preview",
    togetherCelebrate:"Together We Celebrate", dateLabel:"Date of the Celebration",
    kindlyReply:"Kindly reply by", confirmAttendance:"Confirm Attendance",
    rsvpTitle:"Kindly Reply", acceptsLabel:"Joyfully Accepts", declinesLabel:"Regretfully Declines",
    nameLabel:"Full Name *", guestsLabel:"Number of Guests", dietaryLabel:"Dietary Requirements",
    messageLabel:"A Message for the Couple", msgPlaceholder:"Your warmest wishes…",
    dietaryOptions:["No restrictions","Vegetarian","Vegan","Gluten-free","Dairy-free","Halal","Kosher","No shellfish"],
    sendReply:"Send Reply", confirmedYes:"We shall see you there", confirmedNo:"Thank you for your reply",
    confirmedYesDesc:(d)=>"Your attendance has been noted. We look forward to celebrating with you on "+d+".",
    confirmedNoDesc:"We are sorry you cannot join us. You will be in our hearts on the day.",
    anotherReply:"Submit another response",
    dashTitle:"Couple's Dashboard", editInv:"Edit Invitation",
    statReplies:"Replies", statAttending:"Attending", statDeclined:"Declined", statGuests:"Total Guests",
    responseRate:"Response Rate", attending:"attending",
    shareWA:"Share via WhatsApp", shareWADesc:"Send the invitation link to all guests", shareBtn:"Share ↗",
    bitTitle:"Bit Gift Integration", bitDesc:"Guests send monetary gifts from the invite", comingSoon:"COMING SOON",
    guestResponses:"Guest Responses", total:"total",
    filterAll:"All", filterYes:"Attending", filterNo:"Declined",
    guests:(n)=>n===1?"1 guest":n+" guests", home:"Home",
  },
  he: {
    tagline:"הזמנות חתונה דיגיטליות", heroTitle:["סיפור האהבה שלכם","צרו את ההזמנה המושלמת עכשיו"],
    heroSub:"צרו הזמנה מרהיבה בדקות, קבלו אישורי הגעה מהאורחים ללא צורך בהתחברות — ועקבו אחרי הכל בזמן אמת.",
    createBtn:"יצירת הזמנה", dashBtn:"דשבורד לזוג", previewLink:"צפייה בעמוד RSVP ←",
    feat1T:"עיצוב ייחודי",     feat1D:"חמש ערכות צבעים עם קישוטי פרחים ותמונת הזוג",
    feat2T:"אישורי הגעה קלים", feat2D:"האורחים מאשרים בשניות — ללא הרשמה, ללא כל מאמץ",
    feat3T:"דשבורד חי",        feat3D:"עקבו אחרי תגובות, כמות אורחים ודרישות תזונה בזמן אמת",
    feat4T:"שילוב ביט",        feat4D:"אורחים ישלחו מתנת כסף ישירות מההזמנה — בקרוב",
    builderTitle:"בניית הזמנה", back:"חזרה ←", saveBtn:"שמור והמשך",
    tabContent:"תוכן", tabDesign:"עיצוב", tabPhoto:"תמונה",
    lBride:"שם הכלה", lGroom:"שם החתן", lDate:"תאריך (כתוב)", lYear:"שנה (כתובה)",
    lTime:"שעה (כתובה)", lVenue:"שם האולם", lAddress:"כתובת מלאה",
    lDeadline:"מועד אחרון ל-RSVP", lMessage:"טקסט ההזמנה",
    paletteLabel:"ערכת צבעים", darkPalette:"ערכה כהה", lightPalette:"ערכה בהירה",
    uploadPhoto:"העלאת תמונת הזוג", uploadDesc:"תמונה עגולה תופיע בראש ההזמנה",
    removePhoto:"הסר תמונה", livePreview:"תצוגה מקדימה",
    togetherCelebrate:"מזמינים אתכם לחגוג", dateLabel:"מועד השמחה",
    kindlyReply:"נא לאשר הגעה עד", confirmAttendance:"אישור הגעה",
    rsvpTitle:"אישור הגעה", acceptsLabel:"מגיעים בשמחה", declinesLabel:"מצטערים, לא נוכל",
    nameLabel:"שם מלא *", guestsLabel:"מספר אורחים", dietaryLabel:"העדפות תזונה",
    messageLabel:"ברכה לזוג", msgPlaceholder:"כתבו ברכה חמה לזוג…",
    dietaryOptions:["ללא הגבלה","צמחוני","טבעוני","ללא גלוטן","ללא לקטוז","חלאל","כשר","ללא פירות ים"],
    sendReply:"שליחת אישור", confirmedYes:"נתראה בשמחה!", confirmedNo:"תודה על התשובה",
    confirmedYesDesc:(d)=>"אישרתם את הגעתכם. אנחנו מצפים לראותכם ב"+d+".",
    confirmedNoDesc:"מצטערים לשמוע. נחשוב עליכם ביום המיוחד.",
    anotherReply:"שליחת תשובה נוספת",
    dashTitle:"דשבורד לזוג", editInv:"עריכת הזמנה",
    statReplies:"תגובות", statAttending:"מגיעים", statDeclined:"לא מגיעים", statGuests:"סה״כ אורחים",
    responseRate:"אחוז אישורים", attending:"מגיעים",
    shareWA:"שיתוף בוואטסאפ", shareWADesc:"שלחו את לינק ההזמנה לכל האורחים", shareBtn:"שתף ↗",
    bitTitle:"שילוב ביט", bitDesc:"אורחים ישלחו מתנות כסף ישירות מההזמנה", comingSoon:"בקרוב",
    guestResponses:"אישורי הגעה", total:"סה״כ",
    filterAll:"הכל", filterYes:"מגיעים", filterNo:"לא מגיעים",
    guests:(n)=>n+" אורחים", home:"דף הבית",
  },
  fr: {
    tagline:"Invitations de Mariage Digitales", heroTitle:["Votre histoire d'amour","créez l'invitation parfaite maintenant"],
    heroSub:"Créez une invitation exquise, recevez les confirmations de vos invités sans inscription — et suivez tout en direct.",
    createBtn:"Créer une Invitation", dashBtn:"Tableau de Bord", previewLink:"Aperçu de la page RSVP →",
    feat1T:"Design Sur Mesure", feat1D:"Cinq palettes florales avec ornements et votre photo",
    feat2T:"RSVPs Sans Effort",  feat2D:"Les invités confirment en secondes — sans inscription",
    feat3T:"Tableau de Bord Live",feat3D:"Suivez les réponses, effectifs et régimes en temps réel",
    feat4T:"Intégration Bit",    feat4D:"Les invités envoient un cadeau depuis l'invitation — bientôt",
    builderTitle:"Créateur d'Invitation", back:"← Retour", saveBtn:"Enregistrer",
    tabContent:"Contenu", tabDesign:"Design", tabPhoto:"Photo",
    lBride:"Prénom de la Mariée", lGroom:"Prénom du Marié", lDate:"Date (en toutes lettres)", lYear:"Année",
    lTime:"Heure", lVenue:"Nom du Lieu", lAddress:"Adresse complète",
    lDeadline:"Date Limite RSVP", lMessage:"Texte d'invitation",
    paletteLabel:"Palette de Couleurs", darkPalette:"Palette sombre", lightPalette:"Palette claire",
    uploadPhoto:"Photo du Couple", uploadDesc:"Un portrait circulaire apparaîtra en haut de l'invitation",
    removePhoto:"Supprimer la photo", livePreview:"Aperçu en direct",
    togetherCelebrate:"Célébrons Ensemble", dateLabel:"Date de la Célébration",
    kindlyReply:"Répondre avant le", confirmAttendance:"Confirmer ma Présence",
    rsvpTitle:"Votre Réponse", acceptsLabel:"Présent avec joie", declinesLabel:"Absent, avec regrets",
    nameLabel:"Nom complet *", guestsLabel:"Nombre d'invités", dietaryLabel:"Régime alimentaire",
    messageLabel:"Un mot pour les mariés", msgPlaceholder:"Vos vœux les plus chaleureux…",
    dietaryOptions:["Aucune restriction","Végétarien","Végétalien","Sans gluten","Sans lactose","Halal","Casher","Sans fruits de mer"],
    sendReply:"Envoyer ma réponse", confirmedYes:"À très bientôt !", confirmedNo:"Merci pour votre réponse",
    confirmedYesDesc:(d)=>"Votre présence est notée. Nous avons hâte de vous retrouver le "+d+".",
    confirmedNoDesc:"Nous sommes désolés de ne pas vous avoir parmi nous.",
    anotherReply:"Soumettre une autre réponse",
    dashTitle:"Tableau de Bord", editInv:"Modifier l'invitation",
    statReplies:"Réponses", statAttending:"Présents", statDeclined:"Absents", statGuests:"Invités total",
    responseRate:"Taux de réponse", attending:"présents",
    shareWA:"Partager via WhatsApp", shareWADesc:"Envoyez le lien à tous vos invités", shareBtn:"Partager ↗",
    bitTitle:"Intégration Bit", bitDesc:"Les invités envoient des cadeaux depuis l'invitation", comingSoon:"BIENTÔT",
    guestResponses:"Réponses des invités", total:"total",
    filterAll:"Tous", filterYes:"Présents", filterNo:"Absents",
    guests:(n)=>n===1?"1 invité":n+" invités", home:"Accueil",
  },
  ar: {
    tagline:"دعوات زفاف رقمية", heroTitle:["قصة حبكما","أنشئا الدعوة المثالية الآن"],
    heroSub:"أنشئا دعوة رقمية فاخرة، واستقبلا تأكيدات الحضور دون تسجيل دخول — وتابعا كل شيء مباشرةً.",
    createBtn:"إنشاء دعوة", dashBtn:"لوحة تحكم الزوجين", previewLink:"معاينة صفحة RSVP ←",
    feat1T:"تصميم فريد",    feat1D:"خمس لوحات ألوان بزخارف زهرية وصورة الزوجين",
    feat2T:"تأكيد سهل",     feat2D:"يؤكد الضيوف حضورهم في ثوانٍ — بدون تسجيل",
    feat3T:"لوحة مباشرة",   feat3D:"تابعوا الردود وأعداد الضيوف والتفضيلات الغذائية",
    feat4T:"تكامل Bit",      feat4D:"يرسل الضيوف هدايا مباشرةً من الدعوة — قريباً",
    builderTitle:"منشئ الدعوة", back:"رجوع ←", saveBtn:"حفظ ومتابعة",
    tabContent:"المحتوى", tabDesign:"التصميم", tabPhoto:"الصورة",
    lBride:"اسم العروس", lGroom:"اسم العريس", lDate:"التاريخ", lYear:"السنة",
    lTime:"الوقت", lVenue:"اسم القاعة", lAddress:"العنوان الكامل",
    lDeadline:"الموعد النهائي للرد", lMessage:"نص الدعوة",
    paletteLabel:"لوحة الألوان", darkPalette:"لوحة داكنة", lightPalette:"لوحة فاتحة",
    uploadPhoto:"رفع صورة الزوجين", uploadDesc:"ستظهر صورة دائرية في أعلى الدعوة",
    removePhoto:"إزالة الصورة", livePreview:"معاينة مباشرة",
    togetherCelebrate:"يدعوانكم للاحتفال", dateLabel:"موعد الاحتفال",
    kindlyReply:"يُرجى الرد قبل", confirmAttendance:"تأكيد الحضور",
    rsvpTitle:"تأكيد الحضور", acceptsLabel:"سأحضر بكل سرور", declinesLabel:"آسف، لن أتمكن",
    nameLabel:"الاسم الكامل *", guestsLabel:"عدد الضيوف", dietaryLabel:"التفضيلات الغذائية",
    messageLabel:"كلمة للزوجين", msgPlaceholder:"أجمل التهاني والأمنيات…",
    dietaryOptions:["بدون قيود","نباتي","نباتي صارم","خالي من الغلوتين","خالي من اللاكتوز","حلال","كوشير","بدون مأكولات بحرية"],
    sendReply:"إرسال الرد", confirmedYes:"نراكم في الحفل!", confirmedNo:"شكراً على ردكم",
    confirmedYesDesc:(d)=>"تم تسجيل حضوركم. نتطلع لرؤيتكم في "+d+".",
    confirmedNoDesc:"نأسف لعدم تمكنكم من الحضور. ستكونون في قلوبنا.",
    anotherReply:"إرسال رد آخر",
    dashTitle:"لوحة تحكم الزوجين", editInv:"تعديل الدعوة",
    statReplies:"الردود", statAttending:"الحاضرون", statDeclined:"الغائبون", statGuests:"مجموع الضيوف",
    responseRate:"نسبة الردود", attending:"حاضرون",
    shareWA:"مشاركة عبر واتساب", shareWADesc:"أرسلوا رابط الدعوة لجميع المدعوين", shareBtn:"مشاركة ↗",
    bitTitle:"تكامل Bit", bitDesc:"يرسل الضيوف هدايا مالية من الدعوة", comingSoon:"قريباً",
    guestResponses:"ردود الضيوف", total:"المجموع",
    filterAll:"الكل", filterYes:"الحاضرون", filterNo:"الغائبون",
    guests:(n)=>n+" ضيوف", home:"الرئيسية",
  },
  ru: {
    tagline:"Цифровые Свадебные Приглашения", heroTitle:["Ваша история любви","создайте идеальное приглашение сейчас"],
    heroSub:"Создайте изысканное цифровое приглашение, собирайте ответы гостей без регистрации — и отслеживайте всё в реальном времени.",
    createBtn:"Создать Приглашение", dashBtn:"Панель Управления", previewLink:"Предпросмотр страницы RSVP →",
    feat1T:"Уникальный Дизайн",  feat1D:"Пять цветочных палитр с орнаментами и вашим фото",
    feat2T:"Лёгкие RSVPs",        feat2D:"Гости подтверждают за секунды — без регистрации",
    feat3T:"Живая Панель",        feat3D:"Отслеживайте ответы, количество гостей и диеты онлайн",
    feat4T:"Интеграция Bit",      feat4D:"Гости отправляют подарки прямо из приглашения — скоро",
    builderTitle:"Конструктор Приглашений", back:"← Назад", saveBtn:"Сохранить",
    tabContent:"Содержание", tabDesign:"Дизайн", tabPhoto:"Фото",
    lBride:"Имя невесты", lGroom:"Имя жениха", lDate:"Дата (прописью)", lYear:"Год (прописью)",
    lTime:"Время", lVenue:"Название зала", lAddress:"Полный адрес",
    lDeadline:"Срок ответа RSVP", lMessage:"Текст приглашения",
    paletteLabel:"Цветовая Палитра", darkPalette:"Тёмная палитра", lightPalette:"Светлая палитра",
    uploadPhoto:"Загрузить Фото Пары", uploadDesc:"Круглый портрет появится в верхней части приглашения",
    removePhoto:"Удалить фото", livePreview:"Предпросмотр",
    togetherCelebrate:"Празднуйте Вместе С Нами", dateLabel:"Дата Торжества",
    kindlyReply:"Просим ответить до", confirmAttendance:"Подтвердить Присутствие",
    rsvpTitle:"Ваш Ответ", acceptsLabel:"С радостью приду", declinesLabel:"К сожалению, не смогу",
    nameLabel:"Полное имя *", guestsLabel:"Количество гостей", dietaryLabel:"Диетические требования",
    messageLabel:"Слово молодожёнам", msgPlaceholder:"Ваши тёплые пожелания…",
    dietaryOptions:["Без ограничений","Вегетарианское","Веганское","Без глютена","Без лактозы","Халяль","Кошерное","Без морепродуктов"],
    sendReply:"Отправить Ответ", confirmedYes:"До встречи на торжестве!", confirmedNo:"Спасибо за ваш ответ",
    confirmedYesDesc:(d)=>"Ваше присутствие отмечено. Ждём вас "+d+".",
    confirmedNoDesc:"Жаль, что вы не сможете присутствовать. Вы будете в наших сердцах.",
    anotherReply:"Отправить другой ответ",
    dashTitle:"Панель Управления", editInv:"Редактировать приглашение",
    statReplies:"Ответов", statAttending:"Придут", statDeclined:"Не придут", statGuests:"Всего гостей",
    responseRate:"Процент ответов", attending:"придут",
    shareWA:"Поделиться в WhatsApp", shareWADesc:"Отправьте ссылку на приглашение всем гостям", shareBtn:"Поделиться ↗",
    bitTitle:"Интеграция Bit", bitDesc:"Гости отправляют денежные подарки из приглашения", comingSoon:"СКОРО",
    guestResponses:"Ответы Гостей", total:"всего",
    filterAll:"Все", filterYes:"Придут", filterNo:"Не придут",
    guests:(n)=>n===1?"1 гость":n+" гостей", home:"Главная",
  },
};

/* ══════════════════════════════════════════════════════════════
   PALETTE THEMES — Romantic Blush & Floral
══════════════════════════════════════════════════════════════ */
const themes = [
  {
    id:"blush",    name:"Blush & Gold",
    pageBg:"linear-gradient(145deg,#fff5f7 0%,#fdeef2 35%,#fff8f0 70%,#fef5f8 100%)",
    cardBg:"#fffbfc",
    panelBg:"#fdf5f7",
    rose:"#c9707a",    roseL:"#e8a0a8",   rosePale:"#fce8ec",
    gold:"#c4956a",    goldL:"#d4a878",
    text:"#3d2028",    sub:"#8a6068",
    border:"rgba(200,140,155,0.25)",
    inputBg:"rgba(255,255,255,0.9)",
    dark:false,
  },
  {
    id:"magnolia",  name:"Magnolia & Champagne",
    pageBg:"linear-gradient(145deg,#fdf8f0 0%,#f9f0e4 40%,#fdf5ee 100%)",
    cardBg:"#fffdf8",
    panelBg:"#f7f0e6",
    rose:"#b8845a",    roseL:"#d4a478",   rosePale:"#faeede",
    gold:"#c4955a",    goldL:"#d4a86a",
    text:"#2e1e0e",    sub:"#7a6040",
    border:"rgba(184,132,90,0.25)",
    inputBg:"rgba(255,255,255,0.9)",
    dark:false,
  },
  {
    id:"dusty",    name:"Dusty Rose & Sage",
    pageBg:"linear-gradient(145deg,#f9f4f5 0%,#f2ece4 40%,#eef2ec 100%)",
    cardBg:"#fdfaf8",
    panelBg:"#f0ece8",
    rose:"#b07880",    roseL:"#c89898",   rosePale:"#f5e8e8",
    gold:"#7a9468",    goldL:"#96aa84",
    text:"#2a1e20",    sub:"#7a6468",
    border:"rgba(176,120,128,0.22)",
    inputBg:"rgba(255,255,255,0.9)",
    dark:false,
  },
  {
    id:"midnight", name:"Midnight Rose",
    pageBg:"linear-gradient(145deg,#140e12 0%,#1e1218 40%,#120e16 100%)",
    cardBg:"linear-gradient(160deg,#1e1218,#140e12)",
    panelBg:"#0e080c",
    rose:"#d4849a",    roseL:"#e8a8bc",   rosePale:"rgba(212,132,154,0.1)",
    gold:"#c4a46a",    goldL:"#d4b87a",
    text:"#f5e8ec",    sub:"#a08898",
    border:"rgba(212,132,154,0.22)",
    inputBg:"rgba(255,255,255,0.06)",
    dark:true,
  },
  {
    id:"ivory",    name:"Ivory & Blush",
    pageBg:"linear-gradient(145deg,#faf7f2 0%,#f5ede4 40%,#faf4f6 100%)",
    cardBg:"#fdfaf6",
    panelBg:"#f0e8de",
    rose:"#b87878",    roseL:"#cc9898",   rosePale:"#f8ecec",
    gold:"#b89060",    goldL:"#c8a474",
    text:"#281818",    sub:"#786060",
    border:"rgba(184,120,120,0.22)",
    inputBg:"rgba(255,255,255,0.9)",
    dark:false,
  },
];

const mockRsvps = [
  { id:1,name:"Catherine & James Moore",guests:2,dietary:"Vegetarian",message:"We are beyond thrilled for you both! 💕",attending:true,time:"2d ago" },
  { id:2,name:"Oliver Bennett",          guests:1,dietary:"",          message:"Wouldn't miss it for the world.",       attending:true,time:"5h ago" },
  { id:3,name:"Sophie & Thomas Laurent", guests:4,dietary:"Gluten-free",message:"So honoured to be invited!",           attending:true,time:"1h ago" },
  { id:4,name:"Emma Richardson",         guests:1,dietary:"",          message:"Deeply sorry — prior engagement.",      attending:false,time:"3h ago" },
  { id:5,name:"The Harrison Family",     guests:3,dietary:"No shellfish",message:"",                                    attending:true,time:"30m ago"},
];

/* ══════════════════════════════════════════════════════════════
   FLORAL SVG COMPONENTS
══════════════════════════════════════════════════════════════ */

// Full peony/rose bloom
const FlowerBloom = ({ x, y, r, color, opacity=1 }) => (
  <g transform={`translate(${x},${y})`} opacity={opacity}>
    {[0,45,90,135,180,225,270,315].map((deg,i)=>{
      const rad=deg*Math.PI/180;
      const px=Math.cos(rad)*r*0.55, py=Math.sin(rad)*r*0.55;
      return <ellipse key={i} cx={px} cy={py} rx={r*0.38} ry={r*0.28}
        fill={color} transform={`rotate(${deg} ${px} ${py})`} opacity={0.7}/>;
    })}
    {[0,60,120,180,240,300].map((deg,i)=>{
      const rad=deg*Math.PI/180;
      const px=Math.cos(rad)*r*0.28, py=Math.sin(rad)*r*0.28;
      return <ellipse key={i} cx={px} cy={py} rx={r*0.25} ry={r*0.18}
        fill={color} transform={`rotate(${deg} ${px} ${py})`} opacity={0.85}/>;
    })}
    <circle cx="0" cy="0" r={r*0.2} fill={color} opacity={0.9}/>
    <circle cx="0" cy="0" r={r*0.1} fill="rgba(255,255,255,0.5)"/>
  </g>
);

// Small 5-petal flower
const SmallFlower = ({ x, y, r, color, opacity=1 }) => (
  <g transform={`translate(${x},${y})`} opacity={opacity}>
    {[0,72,144,216,288].map((deg,i)=>{
      const rad=deg*Math.PI/180;
      const px=Math.cos(rad)*r*0.6, py=Math.sin(rad)*r*0.6;
      return <ellipse key={i} cx={px} cy={py} rx={r*0.42} ry={r*0.28}
        fill={color} transform={`rotate(${deg} ${px} ${py})`}/>;
    })}
    <circle cx="0" cy="0" r={r*0.22} fill="rgba(255,220,180,0.9)"/>
  </g>
);

// Leaf
const Leaf = ({ x, y, angle, len, color, opacity=0.6 }) => {
  const rad=angle*Math.PI/180;
  const ex=Math.cos(rad)*len, ey=Math.sin(rad)*len;
  const cx1=Math.cos((angle-30)*Math.PI/180)*len*0.5, cy1=Math.sin((angle-30)*Math.PI/180)*len*0.5;
  const cx2=Math.cos((angle+30)*Math.PI/180)*len*0.5, cy2=Math.sin((angle+30)*Math.PI/180)*len*0.5;
  return <path d={`M0,0 C${cx1},${cy1} ${cx2},${cy2} ${ex},${ey} C${cx2},${cy2} ${cx1},${cy1} 0,0Z`}
    transform={`translate(${x},${y})`} fill={color} opacity={opacity}/>;
};

// Decorative stem with leaves and flowers — corner bouquet
const CornerBouquet = ({ color, goldColor, flip=false, size=120 }) => {
  const s = size/120;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{transform:flip?"scaleX(-1)":"none",display:"block"}}>
      <g opacity="0.75">
        {/* Stems */}
        <path d={`M10,110 Q30,70 60,40`} stroke={color} strokeWidth="1.2" fill="none" opacity="0.5"/>
        <path d={`M10,110 Q50,80 75,30`} stroke={color} strokeWidth="1" fill="none" opacity="0.4"/>
        <path d={`M10,110 Q20,60 40,25`} stroke={color} strokeWidth="1" fill="none" opacity="0.4"/>
        {/* Leaves */}
        <Leaf x={35} y={75} angle={-60} len={22} color={color} opacity={0.55}/>
        <Leaf x={50} y={55} angle={-120} len={18} color={color} opacity={0.5}/>
        <Leaf x={25} y={85} angle={20} len={16} color={color} opacity={0.45}/>
        <Leaf x={60} y={50} angle={30} len={14} color={color} opacity={0.4}/>
        {/* Main flowers */}
        <FlowerBloom x={60} y={38} r={18} color={goldColor} opacity={0.8}/>
        <FlowerBloom x={38} y={22} r={13} color={goldColor} opacity={0.7}/>
        <FlowerBloom x={75} y={28} r={11} color={goldColor} opacity={0.65}/>
        {/* Small accent flowers */}
        <SmallFlower x={20} y={40} r={7} color={goldColor} opacity={0.55}/>
        <SmallFlower x={82} y={48} r={6} color={goldColor} opacity={0.5}/>
        <SmallFlower x={48} y={12} r={5} color={goldColor} opacity={0.5}/>
        {/* Tiny dots (buds) */}
        {[[30,65],[55,70],[70,62],[18,52],[88,35]].map(([bx,by],i)=>
          <circle key={i} cx={bx} cy={by} r={2.5} fill={goldColor} opacity={0.4}/>
        )}
      </g>
    </svg>
  );
};

// Horizontal floral divider
const FloralDivider = ({ roseColor, goldColor, width=300 }) => (
  <svg viewBox={`0 0 ${width} 36`} style={{width:"100%",maxWidth:width,display:"block",margin:"0 auto"}}>
    <g>
      {/* Center line */}
      <line x1={width*0.08} y1={18} x2={width*0.92} y2={18} stroke={roseColor} strokeWidth="0.5" opacity="0.35"/>
      {/* Center ornament */}
      <SmallFlower x={width/2} y={18} r={8} color={goldColor} opacity={0.7}/>
      {/* Side diamonds */}
      <polygon points={`${width/2-22},18 ${width/2-17},14 ${width/2-12},18 ${width/2-17},22`} fill={roseColor} opacity={0.5}/>
      <polygon points={`${width/2+12},18 ${width/2+17},14 ${width/2+22},18 ${width/2+17},22`} fill={roseColor} opacity={0.5}/>
      {/* Outer small flowers */}
      <SmallFlower x={width/2-40} y={18} r={5} color={goldColor} opacity={0.55}/>
      <SmallFlower x={width/2+40} y={18} r={5} color={goldColor} opacity={0.55}/>
      {/* Dots */}
      {[-65,-52,52,65].map((off,i)=>
        <circle key={i} cx={width/2+off} cy={18} r={2} fill={roseColor} opacity={0.35}/>
      )}
    </g>
  </svg>
);

// Background scattered petals / flowers for page bg
const BgFloral = ({ color, goldColor }) => (
  <svg style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}} preserveAspectRatio="xMidYMid slice">
    <g opacity="0.06">
      <FlowerBloom x="5%" y="8%" r={55} color={color}/>
      <FlowerBloom x="92%" y="5%" r={45} color={color}/>
      <FlowerBloom x="15%" y="88%" r={50} color={color}/>
      <FlowerBloom x="88%" y="85%" r={42} color={color}/>
      <SmallFlower x="50%" y="12%" r={18} color={goldColor}/>
      <SmallFlower x="25%" y="50%" r={14} color={color}/>
      <SmallFlower x="78%" y="48%" r={16} color={goldColor}/>
      <SmallFlower x="50%" y="92%" r={15} color={color}/>
    </g>
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════════════════ */
const GlobalStyles = ({ dir }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&family=Lato:wght@300;400;700&family=Frank+Ruhl+Libre:wght@300;400;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

    .page { animation: pgIn 0.65s cubic-bezier(.16,1,.3,1) both; }
    @keyframes pgIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
    .sg>* { animation:pgIn .55s cubic-bezier(.16,1,.3,1) both; }
    .sg>*:nth-child(1){animation-delay:.04s}.sg>*:nth-child(2){animation-delay:.1s}
    .sg>*:nth-child(3){animation-delay:.16s}.sg>*:nth-child(4){animation-delay:.22s}
    .sg>*:nth-child(5){animation-delay:.28s}.sg>*:nth-child(6){animation-delay:.34s}
    .sg>*:nth-child(7){animation-delay:.4s}.sg>*:nth-child(8){animation-delay:.46s}
    .sg>*:nth-child(9){animation-delay:.52s}.sg>*:nth-child(10){animation-delay:.58s}

    .rbtn {
      background:linear-gradient(135deg,#c9707a 0%,#d48890 45%,#c06878 100%);
      color:#fff; border:none; cursor:pointer;
      font-family:'Cinzel',serif; font-weight:600;
      letter-spacing:2px; text-transform:uppercase;
      transition:all .22s ease; display:inline-flex; align-items:center; justify-content:center;
      box-shadow: 0 6px 24px rgba(200,112,122,0.35);
    }
    .rbtn:hover:not(:disabled){filter:brightness(1.07);transform:translateY(-1px);box-shadow:0 12px 36px rgba(200,112,122,.45);}
    .rbtn:disabled{opacity:.38;cursor:not-allowed;box-shadow:none;}

    .ghostbtn {
      background:transparent; cursor:pointer;
      font-family:'Cinzel',serif; font-weight:400;
      letter-spacing:1.5px; text-transform:uppercase; transition:all .22s ease;
    }
    .ghostbtn:hover{background:rgba(200,112,122,.07);}

    .lux-input {
      font-family:'Lato',sans-serif; font-size:14px;
      padding:11px 15px; border-radius:6px; outline:none; width:100%;
      transition:border-color .2s, box-shadow .2s;
    }
    .lux-input:focus{box-shadow:0 0 0 3px rgba(200,112,122,.15);}
    .lux-input::placeholder{color:#b09898;}

    /* Language picker */
    .lang-picker{position:relative;}
    .lang-menu{
      position:absolute; top:calc(100% + 6px);
      ${dir==="rtl"?"left:0":"right:0"};
      background:#fff8f9; border:1px solid rgba(200,140,155,.3);
      border-radius:10px; min-width:155px; z-index:999; overflow:hidden;
      box-shadow:0 20px 50px rgba(180,100,120,.18);
      animation:pgIn .22s ease both;
    }
    .lang-opt{padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:9px;
      font-family:'Lato',sans-serif;font-size:13px;color:#6a4050;transition:background .15s;}
    .lang-opt:hover{background:rgba(200,112,122,.09);}
    .lang-opt.active{background:rgba(200,112,122,.14);font-weight:700;}

    /* Mobile nav */
    .mob-nav{display:none;position:fixed;bottom:0;left:0;right:0;
      background:rgba(255,248,250,.96);backdrop-filter:blur(12px);
      border-top:1px solid rgba(200,140,155,.2);z-index:200;
      padding:8px 0 env(safe-area-inset-bottom,8px);}
    .mob-nav-inner{display:flex;justify-content:space-around;align-items:center;}
    .mob-nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;
      background:none;border:none;cursor:pointer;padding:4px 12px;
      font-family:'Cinzel',serif;font-size:7px;letter-spacing:.1em;text-transform:uppercase;transition:color .2s;}

    @media(max-width:768px){
      .mob-nav{display:block!important;}
      .desktop-nav{display:none!important;}
      .builder-layout{flex-direction:column!important;}
      .builder-editor{width:100%!important;}
      .builder-preview{display:none!important;}
      .stats-grid{grid-template-columns:1fr 1fr!important;}
      .hero-btns{flex-direction:column!important;align-items:stretch!important;}
      .feat-grid{grid-template-columns:1fr 1fr!important;}
      .action-row{flex-direction:column!important;}
      .hide-mobile{display:none!important;}
      .page-pad{padding:18px 14px!important;}
      .rsvp-wrap{padding:20px 14px 88px!important;}
      .dash-wrap{padding:16px 14px!important;}
    }
    @media(min-width:769px){.mob-only{display:none!important;}}

    ::-webkit-scrollbar{width:4px;}
    ::-webkit-scrollbar-track{background:#fdf5f7;}
    ::-webkit-scrollbar-thumb{background:rgba(200,112,122,.3);border-radius:2px;}
  `}</style>
);

/* ══════════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════════ */
export default function WeddingApp() {
  const [lang,setLang]       = useState("en");
  const [view,setView]       = useState("home");
  const [activeTab,setActiveTab] = useState("content");
  const [themeId,setThemeId] = useState("blush");
  const [rsvps]              = useState(mockRsvps);
  const [rsvpDone,setRsvpDone] = useState(false);
  const [form,setForm]       = useState({name:"",guests:1,dietary:"",message:"",attending:null});
  const [filterTab,setFilterTab] = useState("all");
  const [langOpen,setLangOpen] = useState(false);
  const [inv,setInv]         = useState({
    bride:"Isabella", groom:"Alexander",
    date:"Saturday, the Fourteenth of June",
    year:"Two Thousand and Twenty-Five",
    time:"Half Past Six in the Evening",
    venue:"The Grand Palais", address:"12 Av. des Champs-Élysées, Paris",
    message:"Together with their families, joyfully invite you\nto celebrate the beginning of their new life together",
    deadline:"May 1st, 2025", photo:null,
  });

  const t   = T[lang];
  const L   = LANGS[lang];
  const Th  = themes.find(x=>x.id===themeId)||themes[0];
  const dir = L.dir;
  const isRTL = dir==="rtl";

  const attending    = rsvps.filter(r=>r.attending);
  const notAttending = rsvps.filter(r=>!r.attending);
  const totalGuests  = attending.reduce((s,r)=>s+r.guests,0);
  const filtered     = filterTab==="all"?rsvps:filterTab==="yes"?attending:notAttending;

  const handlePhoto=(e)=>{const f=e.target.files[0];if(f)setInv(p=>({...p,photo:URL.createObjectURL(f)}));};

  useEffect(()=>{
    const close=()=>setLangOpen(false);
    if(langOpen)setTimeout(()=>document.addEventListener("click",close),50);
    return()=>document.removeEventListener("click",close);
  },[langOpen]);

  /* ── Language Picker ─────────────────────── */
  const LangPicker = ({ onDark=false }) => (
    <div className="lang-picker" onClick={e=>e.stopPropagation()}>
      <button onClick={()=>setLangOpen(v=>!v)} style={{
        background:"transparent",
        border:`1px solid ${onDark?"rgba(232,168,188,.35)":"rgba(200,112,122,.3)"}`,
        borderRadius:20,padding:"7px 13px",cursor:"pointer",
        display:"flex",alignItems:"center",gap:7,
        color:onDark?"#e8a8bc":Th.rose,
        fontFamily:"'Cinzel',serif",fontSize:9.5,letterSpacing:".12em",textTransform:"uppercase",
      }}>
        <span>{L.flag}</span>
        <span className="hide-mobile">{L.label}</span>
        <span style={{fontSize:8,opacity:.5}}>▾</span>
      </button>
      {langOpen&&(
        <div className="lang-menu" onClick={e=>e.stopPropagation()}>
          {Object.values(LANGS).map(l=>(
            <div key={l.code} className={`lang-opt${lang===l.code?" active":""}`}
              onClick={()=>{setLang(l.code);setLangOpen(false);}}>
              <span style={{fontSize:16}}>{l.flag}</span><span>{l.label}</span>
              {lang===l.code&&<span style={{marginInlineStart:"auto",color:Th.rose,fontSize:11}}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ── Mobile Nav ─────────────────────────── */
  const MobNav = () => (
    <nav className="mob-nav">
      <div className="mob-nav-inner">
        {[{v:"home",i:"🏠",l:"Home"},{v:"builder",i:"✏️",l:"Build"},{v:"rsvp",i:"✉️",l:"RSVP"},{v:"dashboard",i:"📊",l:"Dash"}].map(item=>(
          <button key={item.v} className="mob-nav-btn" onClick={()=>setView(item.v)}
            style={{color:view===item.v?Th.rose:"#b09898"}}>
            <span style={{fontSize:20}}>{item.i}</span>
            <span>{item.l}</span>
          </button>
        ))}
      </div>
    </nav>
  );

  /* ── Invitation Card ─────────────────────── */
  const Card = ({ scale=1 }) => {
    const s=v=>v*scale;
    return (
      <div style={{
        background:Th.cardBg,border:`1px solid ${Th.border}`,borderRadius:12*scale,
        padding:`${s(52)}px ${s(38)}px`,textAlign:"center",position:"relative",
        maxWidth:440,margin:"0 auto",overflow:"hidden",
        boxShadow:Th.dark
          ?"0 40px 100px rgba(0,0,0,.65),0 0 0 1px rgba(232,168,188,.08) inset"
          :`0 20px 70px rgba(200,112,122,.13),0 2px 12px rgba(200,112,122,.08)`,
        direction:"ltr",
      }}>
        {/* Corner bouquets */}
        <div style={{position:"absolute",top:0,right:0,pointerEvents:"none"}}>
          <CornerBouquet color={Th.rose+"80"} goldColor={Th.roseL} size={s(90)} flip/>
        </div>
        <div style={{position:"absolute",top:0,left:0,pointerEvents:"none"}}>
          <CornerBouquet color={Th.rose+"80"} goldColor={Th.roseL} size={s(90)}/>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,pointerEvents:"none",transform:"rotate(180deg) scaleX(-1)"}}>
          <CornerBouquet color={Th.rose+"70"} goldColor={Th.roseL} size={s(80)} flip/>
        </div>
        <div style={{position:"absolute",bottom:0,right:0,pointerEvents:"none",transform:"rotate(180deg)"}}>
          <CornerBouquet color={Th.rose+"70"} goldColor={Th.roseL} size={s(80)}/>
        </div>

        {/* Subtle radial glow */}
        <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",
          width:s(300),height:s(300),borderRadius:"50%",
          background:`radial-gradient(circle,${Th.rosePale} 0%,transparent 70%)`,
          pointerEvents:"none",zIndex:0}}/>

        <div style={{position:"relative",zIndex:1}}>
          {/* Header label */}
          <div style={{fontFamily:"'Cinzel',serif",fontSize:s(8.5),letterSpacing:".28em",color:Th.roseL,marginBottom:s(16),textTransform:"uppercase",opacity:.85}}>
            ✦ &nbsp;{t.togetherCelebrate}&nbsp; ✦
          </div>

          {/* Photo */}
          {inv.photo&&(
            <div style={{marginBottom:s(18)}}>
              <div style={{width:s(108),height:s(108),borderRadius:"50%",margin:"0 auto",
                border:`2px solid ${Th.roseL}`,padding:3,
                boxShadow:`0 8px 30px ${Th.rose}30`}}>
                <img src={inv.photo} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover",display:"block"}}/>
              </div>
            </div>
          )}

          {/* Names */}
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:s(44),fontWeight:300,color:Th.text,lineHeight:1,letterSpacing:".02em"}}>{inv.bride}</div>
          <div style={{color:Th.roseL,fontSize:s(18),margin:`${s(6)}px 0`,letterSpacing:".2em"}}>✦</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:s(44),fontWeight:300,color:Th.text,lineHeight:1,letterSpacing:".02em",marginBottom:s(22)}}>{inv.groom}</div>

          <div style={{display:"flex",justifyContent:"center",marginBottom:s(16)}}><FloralDivider roseColor={Th.rose} goldColor={Th.roseL} width={280}/></div>

          {/* Message */}
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:s(14.5),color:Th.sub,lineHeight:1.78,maxWidth:s(300),margin:`0 auto ${s(18)}px`,whiteSpace:"pre-line"}}>{inv.message}</div>

          {/* Date box */}
          <div style={{background:Th.rosePale,border:`1px solid ${Th.border}`,borderRadius:s(8),padding:`${s(14)}px ${s(20)}px`,margin:`0 0 ${s(16)}px`}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:s(8),letterSpacing:".22em",color:Th.roseL,textTransform:"uppercase",marginBottom:s(5)}}>
              ✦ {t.dateLabel} ✦
            </div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:s(20),fontWeight:600,color:Th.text}}>{inv.date}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:s(13),color:Th.sub,marginTop:s(2)}}>{inv.year}</div>
          </div>

          {/* Time & venue */}
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:s(13.5),color:Th.sub,lineHeight:1.9}}>
            {inv.time}<br/>
            <span style={{fontStyle:"normal",fontWeight:600,color:Th.text}}>{inv.venue}</span><br/>
            {inv.address}
          </div>

          <div style={{display:"flex",justifyContent:"center",margin:`${s(16)}px 0`}}><FloralDivider roseColor={Th.rose} goldColor={Th.roseL} width={280}/></div>

          <div style={{fontFamily:"'Cinzel',serif",fontSize:s(8),letterSpacing:".2em",color:Th.roseL,textTransform:"uppercase",marginBottom:s(14)}}>
            {t.kindlyReply} {inv.deadline}
          </div>

          <button className="rbtn" onClick={()=>setView("rsvp")} style={{borderRadius:50,padding:`${s(12)}px ${s(30)}px`,fontSize:s(9.5)}}>
            {t.confirmAttendance}
          </button>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════════
     HOME
  ════════════════════════════════════════════ */
  if(view==="home") return (
    <div dir={dir} style={{fontFamily:"'Lato',sans-serif",position:"relative"}}>
      <GlobalStyles dir={dir}/>
      <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#fff5f7 0%,#fdeef2 35%,#fff8f0 70%,#fef5f8 100%)",position:"relative",paddingBottom:80}}>
        <BgFloral color="#e8a0b0" goldColor="#d4b080"/>

        {/* Top bar */}
        <div style={{position:"relative",zIndex:10,padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(200,140,155,.15)"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#c9707a",fontStyle:"italic",letterSpacing:".05em",display:"flex",alignItems:"center",gap:8}}>
            <SmallFlower x={0} y={0} r={0} color="#e8a0a8"/>
            <svg width={18} height={18} viewBox="0 0 24 24" style={{marginBottom:1}}>
              <SmallFlower x={12} y={12} r={8} color="#d4848c" opacity={0.8}/>
            </svg>
            Eternally
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <LangPicker/>
            <button className="ghostbtn desktop-nav" onClick={()=>setView("dashboard")} style={{borderRadius:20,padding:"7px 16px",fontSize:9,border:"1px solid rgba(200,112,122,.3)",color:"#c9707a"}}>{t.dashBtn}</button>
          </div>
        </div>

        {/* Hero */}
        <div style={{position:"relative",zIndex:5,textAlign:"center",maxWidth:620,margin:"0 auto",padding:"64px 24px 48px"}} className="sg">
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:".35em",color:"#d4848c",marginBottom:18,textTransform:"uppercase"}}>
            ✦ &nbsp;{t.tagline}&nbsp; ✦
          </div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(36px,8vw,64px)",fontWeight:300,color:"#3d2028",lineHeight:1.15,marginBottom:18,letterSpacing:".02em"}}>
            {t.heroTitle[0]}<br/><em style={{color:"#c9707a"}}>{t.heroTitle[1]}</em>
          </h1>
          <p style={{color:"#8a6068",fontSize:"clamp(14px,2vw,16px)",lineHeight:1.85,marginBottom:40,maxWidth:480,margin:"0 auto 40px"}}>
            {t.heroSub}
          </p>
          <div className="hero-btns" style={{display:"flex",gap:13,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="rbtn" onClick={()=>setView("builder")} style={{borderRadius:50,padding:"15px 42px",fontSize:10}}>{t.createBtn}</button>
            <button className="ghostbtn" onClick={()=>setView("dashboard")} style={{borderRadius:50,padding:"14px 36px",fontSize:10,border:"1px solid rgba(200,112,122,.4)",color:"#c9707a"}}>{t.dashBtn}</button>
          </div>
          <div style={{marginTop:14}}>
            <button onClick={()=>setView("rsvp")} style={{background:"none",border:"none",color:"#b09098",fontSize:13,cursor:"pointer",fontFamily:"'Lato',sans-serif",textDecoration:"underline",textDecorationColor:"#b0909840"}}>{t.previewLink}</button>
          </div>
        </div>

        {/* Mini card preview */}
        <div style={{position:"relative",zIndex:5,maxWidth:320,margin:"0 auto 48px",opacity:.9,transform:"scale(0.82)",transformOrigin:"top center"}}>
          <Card scale={0.78}/>
        </div>

        {/* Features */}
        <div className="page-pad feat-grid" style={{position:"relative",zIndex:5,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,maxWidth:820,margin:"0 auto",padding:"0 24px"}}>
          {[
            {t:t.feat1T,d:t.feat1D,icon:"🌸"},{t:t.feat2T,d:t.feat2D,icon:"✉️"},
            {t:t.feat3T,d:t.feat3D,icon:"📊"},{t:t.feat4T,d:t.feat4D,icon:"💝"},
          ].map(f=>(
            <div key={f.t} style={{background:"rgba(255,255,255,.75)",backdropFilter:"blur(8px)",border:"1px solid rgba(200,140,155,.2)",borderRadius:14,padding:"22px 18px",boxShadow:"0 4px 20px rgba(200,112,122,.07)"}}>
              <div style={{fontSize:22,marginBottom:10}}>{f.icon}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:9.5,color:"#c9707a",letterSpacing:".1em",marginBottom:7}}>{f.t}</div>
              <div style={{color:"#8a7078",fontSize:13,lineHeight:1.65}}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>
      <MobNav/>
    </div>
  );

  /* ════════════════════════════════════════════
     BUILDER
  ════════════════════════════════════════════ */
  if(view==="builder") return (
    <div dir={dir} style={{fontFamily:"'Lato',sans-serif"}}>
      <GlobalStyles dir={dir}/>
      <div style={{minHeight:"100vh",background:"#fdf8f9",display:"flex",flexDirection:"column",paddingBottom:70}}>
        {/* Topbar */}
        <div style={{background:"rgba(255,248,250,.96)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(200,140,155,.18)",padding:"13px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,position:"sticky",top:0,zIndex:100}}>
          <button className="ghostbtn" onClick={()=>setView("home")} style={{borderRadius:20,padding:"7px 14px",fontSize:9,border:"1px solid rgba(200,112,122,.3)",color:"#c9707a"}}>{t.back}</button>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:".2em",color:"#c9707a",textTransform:"uppercase"}}>
            ✦ &nbsp;{t.builderTitle}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <LangPicker/>
            <button className="rbtn" onClick={()=>setView("dashboard")} style={{borderRadius:20,padding:"8px 18px",fontSize:9}}>{t.saveBtn}</button>
          </div>
        </div>

        <div className="builder-layout" style={{display:"flex",flex:1,overflow:"hidden"}}>
          {/* Editor */}
          <div className="builder-editor" style={{width:320,flexShrink:0,background:"#fff8f9",borderInlineEnd:"1px solid rgba(200,140,155,.15)",overflowY:"auto",padding:18}}>
            {/* Tabs */}
            <div style={{display:"flex",background:"rgba(200,112,122,.06)",border:"1px solid rgba(200,140,155,.2)",borderRadius:10,overflow:"hidden",marginBottom:20,padding:3,gap:3}}>
              {[{id:"content",l:t.tabContent},{id:"design",l:t.tabDesign},{id:"photo",l:t.tabPhoto}].map(tab=>(
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
                  flex:1,padding:"8px 4px",border:"none",cursor:"pointer",borderRadius:8,
                  fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".12em",textTransform:"uppercase",
                  background:activeTab===tab.id?"white":"transparent",
                  color:activeTab===tab.id?"#c9707a":"#b09898",
                  boxShadow:activeTab===tab.id?"0 2px 8px rgba(200,112,122,.15)":"none",
                  transition:"all .2s",
                }}>{tab.l}</button>
              ))}
            </div>

            {activeTab==="content"&&(
              <div className="sg" style={{display:"flex",flexDirection:"column",gap:13}}>
                {[{l:t.lBride,k:"bride"},{l:t.lGroom,k:"groom"},{l:t.lDate,k:"date"},{l:t.lYear,k:"year"},{l:t.lTime,k:"time"},{l:t.lVenue,k:"venue"},{l:t.lAddress,k:"address"},{l:t.lDeadline,k:"deadline"}].map(f=>(
                  <div key={f.k}>
                    <div style={{fontSize:8,letterSpacing:".2em",color:"#b09098",fontFamily:"'Cinzel',serif",textTransform:"uppercase",marginBottom:4}}>{f.l}</div>
                    <input className="lux-input" value={inv[f.k]} onChange={e=>setInv(p=>({...p,[f.k]:e.target.value}))}
                      style={{background:"white",color:"#3d2028",border:"1px solid rgba(200,140,155,.25)"}}/>
                  </div>
                ))}
                <div>
                  <div style={{fontSize:8,letterSpacing:".2em",color:"#b09098",fontFamily:"'Cinzel',serif",textTransform:"uppercase",marginBottom:4}}>{t.lMessage}</div>
                  <textarea className="lux-input" value={inv.message} onChange={e=>setInv(p=>({...p,message:e.target.value}))} rows={3}
                    style={{background:"white",color:"#3d2028",border:"1px solid rgba(200,140,155,.25)",resize:"vertical",lineHeight:1.6}}/>
                </div>
              </div>
            )}

            {activeTab==="design"&&(
              <div className="sg" style={{display:"flex",flexDirection:"column",gap:9}}>
                <div style={{fontSize:8,letterSpacing:".2em",color:"#b09098",fontFamily:"'Cinzel',serif",textTransform:"uppercase",marginBottom:10}}>{t.paletteLabel}</div>
                {themes.map(th=>(
                  <div key={th.id} onClick={()=>setThemeId(th.id)} style={{
                    display:"flex",alignItems:"center",gap:12,padding:"11px 13px",borderRadius:10,cursor:"pointer",
                    border:themeId===th.id?`1.5px solid ${th.rose}`:"1px solid rgba(200,140,155,.18)",
                    background:themeId===th.id?`${th.rose}0d`:"white",transition:"all .18s",
                    boxShadow:themeId===th.id?`0 4px 16px ${th.rose}20`:"none",
                  }}>
                    <div style={{width:32,height:32,borderRadius:8,background:th.pageBg,border:`1px solid ${th.border}`,flexShrink:0,overflow:"hidden",position:"relative"}}>
                      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"40%",background:th.rose,opacity:.45}}/>
                    </div>
                    <div>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:9.5,color:"#5a3040",letterSpacing:".08em"}}>{th.name}</div>
                      <div style={{fontSize:11,color:"#b09898",marginTop:2}}>{th.dark?t.darkPalette:t.lightPalette}</div>
                    </div>
                    {themeId===th.id&&<div style={{marginInlineStart:"auto",color:th.rose,fontSize:14}}>✓</div>}
                  </div>
                ))}
              </div>
            )}

            {activeTab==="photo"&&(
              <div className="sg">
                {inv.photo?(
                  <div style={{textAlign:"center"}}>
                    <div style={{width:138,height:138,borderRadius:"50%",margin:"0 auto 18px",border:`2px solid ${Th.roseL}`,padding:3,boxShadow:`0 8px 30px ${Th.rose}25`}}>
                      <img src={inv.photo} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}/>
                    </div>
                    <button onClick={()=>setInv(p=>({...p,photo:null}))} className="ghostbtn" style={{borderRadius:20,padding:"8px 20px",fontSize:9,border:"1px solid rgba(200,100,100,.35)",color:"#c07070"}}>
                      {t.removePhoto}
                    </button>
                  </div>
                ):(
                  <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:13,padding:"42px 16px",border:"1.5px dashed rgba(200,140,155,.3)",borderRadius:14,cursor:"pointer",background:"rgba(255,240,244,.4)"}}>
                    <div style={{fontSize:36}}>🌸</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#c9707a",letterSpacing:".2em",textTransform:"uppercase",textAlign:"center"}}>{t.uploadPhoto}</div>
                    <div style={{fontSize:12,color:"#b09898",textAlign:"center",lineHeight:1.55}}>{t.uploadDesc}</div>
                    <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="builder-preview" style={{flex:1,background:Th.pageBg,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"36px 20px",overflowY:"auto",position:"relative"}}>
            <BgFloral color={Th.rose+"50"} goldColor={Th.roseL+"50"}/>
            <div style={{width:"100%",maxWidth:450,position:"relative",zIndex:1}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:".3em",color:Th.roseL,textAlign:"center",marginBottom:18,textTransform:"uppercase",opacity:.7}}>{t.livePreview}</div>
              <Card scale={0.9}/>
            </div>
          </div>
        </div>
      </div>
      <MobNav/>
    </div>
  );

  /* ════════════════════════════════════════════
     RSVP
  ════════════════════════════════════════════ */
  if(view==="rsvp") return (
    <div dir={dir} style={{fontFamily:"'Lato',sans-serif"}}>
      <GlobalStyles dir={dir}/>
      <div className="rsvp-wrap" style={{minHeight:"100vh",background:Th.pageBg,padding:"22px 16px 90px",position:"relative"}}>
        <BgFloral color={Th.rose+"40"} goldColor={Th.roseL+"40"}/>
        <div style={{position:"relative",zIndex:5}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
            <button className="ghostbtn" onClick={()=>setView("home")} style={{borderRadius:20,padding:"7px 14px",fontSize:9,border:`1px solid ${Th.border}`,color:Th.rose}}>{t.back}</button>
            <LangPicker onDark={Th.dark}/>
          </div>
          <Card scale={1}/>

          {/* Form */}
          <div style={{maxWidth:440,margin:"28px auto 0"}}>
            <div style={{
              background:Th.cardBg,border:`1px solid ${Th.border}`,borderRadius:16,
              padding:"32px 28px",
              boxShadow:Th.dark?"0 30px 80px rgba(0,0,0,.5)":`0 16px 50px rgba(200,112,122,.1)`,
            }}>
              {rsvpDone?(
                <div className="page" style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{fontSize:48,marginBottom:14}}>🌸</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:Th.text,marginBottom:10}}>{form.attending?t.confirmedYes:t.confirmedNo}</div>
                  <div style={{color:Th.sub,fontSize:14,lineHeight:1.85,marginBottom:26}}>{form.attending?t.confirmedYesDesc(inv.date):t.confirmedNoDesc}</div>
                  <button className="ghostbtn" onClick={()=>{setRsvpDone(false);setForm({name:"",guests:1,dietary:"",message:"",attending:null});}}
                    style={{borderRadius:20,padding:"9px 22px",fontSize:9,border:`1px solid ${Th.border}`,color:Th.rose}}>{t.anotherReply}
                  </button>
                </div>
              ):(
                <div className="sg">
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:".25em",color:Th.roseL,textAlign:"center",marginBottom:20,textTransform:"uppercase"}}>
                    ✦ &nbsp;{t.rsvpTitle}&nbsp; ✦
                  </div>
                  {/* Yes/No */}
                  <div style={{display:"flex",gap:10,marginBottom:18}}>
                    {[
                      {val:true,label:t.acceptsLabel,icon:"🌸",ac:Th.dark?"rgba(122,170,138,.12)":"rgba(200,232,210,.4)",bc:"#7aaa8a"},
                      {val:false,label:t.declinesLabel,icon:"🥀",ac:Th.dark?"rgba(170,122,122,.12)":"rgba(232,200,200,.4)",bc:"#c07878"},
                    ].map(o=>(
                      <button key={String(o.val)} onClick={()=>setForm(p=>({...p,attending:o.val}))} style={{
                        flex:1,padding:"14px 6px",borderRadius:10,cursor:"pointer",
                        border:form.attending===o.val?`1.5px solid ${o.bc}`:`1px solid ${Th.border}`,
                        background:form.attending===o.val?o.ac:"transparent",
                        color:form.attending===o.val?o.bc:Th.sub,
                        fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".1em",textTransform:"uppercase",transition:"all .18s",
                      }}>
                        <div style={{fontSize:20,marginBottom:6}}>{o.icon}</div>{o.label}
                      </button>
                    ))}
                  </div>
                  {/* Name */}
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:8,letterSpacing:".2em",color:Th.sub,fontFamily:"'Cinzel',serif",textTransform:"uppercase",marginBottom:4}}>{t.nameLabel}</div>
                    <input className="lux-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                      placeholder={lang==="he"?"שמך המלא":lang==="ar"?"اسمك الكامل":"Your name"}
                      style={{background:Th.inputBg,color:Th.text,border:`1px solid ${Th.border}`}}/>
                  </div>
                  {/* Guests */}
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:8,letterSpacing:".2em",color:Th.sub,fontFamily:"'Cinzel',serif",textTransform:"uppercase",marginBottom:9}}>{t.guestsLabel}</div>
                    <div style={{display:"flex",gap:7}}>
                      {[1,2,3,4,5,6].map(n=>(
                        <button key={n} onClick={()=>setForm(p=>({...p,guests:n}))} style={{
                          width:36,height:36,borderRadius:8,cursor:"pointer",
                          border:form.guests===n?`1.5px solid ${Th.rose}`:`1px solid ${Th.border}`,
                          background:form.guests===n?Th.rosePale:"transparent",
                          color:form.guests===n?Th.rose:Th.sub,
                          fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,transition:"all .15s",
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>
                  {/* Dietary */}
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:8,letterSpacing:".2em",color:Th.sub,fontFamily:"'Cinzel',serif",textTransform:"uppercase",marginBottom:4}}>{t.dietaryLabel}</div>
                    <select className="lux-input" value={form.dietary} onChange={e=>setForm(p=>({...p,dietary:e.target.value}))}
                      style={{background:Th.inputBg,color:Th.text,border:`1px solid ${Th.border}`}}>
                      {t.dietaryOptions.map(d=><option key={d}>{d}</option>)}
                    </select>
                  </div>
                  {/* Message */}
                  <div style={{marginBottom:20}}>
                    <div style={{fontSize:8,letterSpacing:".2em",color:Th.sub,fontFamily:"'Cinzel',serif",textTransform:"uppercase",marginBottom:4}}>{t.messageLabel}</div>
                    <textarea className="lux-input" value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}
                      rows={2} placeholder={t.msgPlaceholder}
                      style={{background:Th.inputBg,color:Th.text,border:`1px solid ${Th.border}`,resize:"none",lineHeight:1.6}}/>
                  </div>
                  <button className="rbtn" onClick={()=>{if(form.name&&form.attending!==null)setRsvpDone(true);}}
                    disabled={!form.name||form.attending===null}
                    style={{width:"100%",borderRadius:50,padding:"14px",fontSize:10}}>
                    {t.sendReply}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <MobNav/>
    </div>
  );

  /* ════════════════════════════════════════════
     DASHBOARD
  ════════════════════════════════════════════ */
  if(view==="dashboard") return (
    <div dir={dir} style={{fontFamily:"'Lato',sans-serif"}}>
      <GlobalStyles dir={dir}/>
      <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#fff5f7 0%,#fdeef2 35%,#fff8f0 70%,#fef5f8 100%)",paddingBottom:70,position:"relative"}}>
        <BgFloral color="#e8a0b0" goldColor="#d4b080"/>
        {/* Topbar */}
        <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(255,248,250,.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(200,140,155,.18)",padding:"15px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button className="ghostbtn" onClick={()=>setView("home")} style={{borderRadius:20,padding:"7px 14px",fontSize:9,border:"1px solid rgba(200,112,122,.3)",color:"#c9707a"}}>{t.back}</button>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:"#c9707a",fontStyle:"italic",letterSpacing:".04em"}}>
            {inv.bride} &amp; {inv.groom}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <LangPicker/>
            <button className="ghostbtn hide-mobile" onClick={()=>setView("builder")} style={{borderRadius:20,padding:"7px 14px",fontSize:9,border:"1px solid rgba(200,112,122,.3)",color:"#c9707a"}}>{t.editInv}</button>
          </div>
        </div>

        <div className="dash-wrap sg" style={{padding:"22px 22px",maxWidth:760,margin:"0 auto",position:"relative",zIndex:5}}>
          {/* Stats */}
          <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
            {[
              {l:t.statReplies,v:rsvps.length,c:"#c9707a",bg:"rgba(200,112,122,.08)"},
              {l:t.statAttending,v:attending.length,c:"#6a9a72",bg:"rgba(106,154,114,.08)"},
              {l:t.statDeclined,v:notAttending.length,c:"#aa7878",bg:"rgba(170,120,120,.08)"},
              {l:t.statGuests,v:totalGuests,c:"#9a78b8",bg:"rgba(154,120,184,.08)"},
            ].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,.8)",backdropFilter:"blur(8px)",border:"1px solid rgba(200,140,155,.18)",borderRadius:14,padding:"18px 14px",textAlign:"center",boxShadow:"0 4px 20px rgba(200,112,122,.07)"}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:300,color:s.c,lineHeight:1}}>{s.v}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:7,letterSpacing:".18em",color:"#b09898",marginTop:7,textTransform:"uppercase"}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div style={{background:"rgba(255,255,255,.8)",backdropFilter:"blur(8px)",border:"1px solid rgba(200,140,155,.18)",borderRadius:14,padding:"17px 18px",marginBottom:13,boxShadow:"0 4px 20px rgba(200,112,122,.07)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:".18em",color:"#b09898",textTransform:"uppercase"}}>{t.responseRate}</span>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#6a9a72"}}>{Math.round((attending.length/rsvps.length)*100)}% {t.attending}</span>
            </div>
            <div style={{background:"rgba(200,112,122,.1)",borderRadius:99,height:6,overflow:"hidden"}}>
              <div style={{width:`${(attending.length/rsvps.length)*100}%`,height:"100%",background:"linear-gradient(90deg,#c9707a,#d49090)",borderRadius:99,transition:"width .8s cubic-bezier(.16,1,.3,1)"}}/>
            </div>
          </div>

          {/* Action cards */}
          <div className="action-row" style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
            <div style={{flex:"1 1 210px",background:"rgba(255,255,255,.8)",backdropFilter:"blur(8px)",border:"1px solid rgba(106,186,120,.25)",borderRadius:14,padding:"16px 17px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,boxShadow:"0 4px 16px rgba(106,186,120,.08)"}}>
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#5a9a6a",letterSpacing:".1em",marginBottom:3}}>{t.shareWA}</div>
                <div style={{fontSize:12,color:"#7a9a80",lineHeight:1.5}}>{t.shareWADesc}</div>
              </div>
              <button style={{background:"linear-gradient(135deg,#25D366,#128C7E)",color:"white",border:"none",borderRadius:20,padding:"8px 14px",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".1em",whiteSpace:"nowrap",boxShadow:"0 4px 12px rgba(37,211,102,.3)"}}>
                {t.shareBtn}
              </button>
            </div>
            <div style={{flex:"1 1 210px",background:"rgba(255,255,255,.8)",backdropFilter:"blur(8px)",border:"1px solid rgba(154,120,200,.22)",borderRadius:14,padding:"16px 17px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,boxShadow:"0 4px 16px rgba(154,120,200,.07)"}}>
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"#8a68b8",letterSpacing:".1em",marginBottom:3}}>{t.bitTitle}</div>
                <div style={{fontSize:12,color:"#9a88a8",lineHeight:1.5}}>{t.bitDesc}</div>
              </div>
              <div style={{background:"rgba(154,120,200,.1)",border:"1px solid rgba(154,120,200,.3)",color:"#9a78c8",borderRadius:20,padding:"6px 11px",fontFamily:"'Cinzel',serif",fontSize:7.5,letterSpacing:".14em",whiteSpace:"nowrap"}}>
                {t.comingSoon}
              </div>
            </div>
          </div>

          {/* Guest list */}
          <div style={{background:"rgba(255,255,255,.85)",backdropFilter:"blur(8px)",border:"1px solid rgba(200,140,155,.18)",borderRadius:14,padding:"18px",boxShadow:"0 4px 20px rgba(200,112,122,.07)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:".14em",color:"#c9707a",textTransform:"uppercase"}}>
                🌸 &nbsp;{t.guestResponses}
              </div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"#b09898"}}>{rsvps.length} {t.total}</div>
            </div>
            <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
              {[{id:"all",l:t.filterAll},{id:"yes",l:`${t.filterYes} (${attending.length})`},{id:"no",l:`${t.filterNo} (${notAttending.length})`}].map(f=>(
                <button key={f.id} onClick={()=>setFilterTab(f.id)} style={{
                  padding:"5px 13px",borderRadius:20,cursor:"pointer",
                  border:filterTab===f.id?"1.5px solid #c9707a":"1px solid rgba(200,140,155,.22)",
                  background:filterTab===f.id?"rgba(200,112,122,.1)":"transparent",
                  color:filterTab===f.id?"#c9707a":"#b09898",
                  fontFamily:"'Cinzel',serif",fontSize:7.5,letterSpacing:".13em",textTransform:"uppercase",transition:"all .18s",
                }}>{f.l}</button>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {filtered.map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 14px",
                  background:r.attending?"rgba(106,154,114,.06)":"rgba(170,120,120,.05)",
                  border:`1px solid ${r.attending?"rgba(106,154,114,.22)":"rgba(170,120,120,.18)"}`,borderRadius:10}}>
                  <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                    background:r.attending?"rgba(106,154,114,.12)":"rgba(170,120,120,.1)",
                    border:`1px solid ${r.attending?"#7aaa8a":"#c07878"}`,fontSize:14}}>
                    {r.attending?"🌸":"🥀"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:"#3d2028"}}>{r.name}</div>
                      <div style={{fontSize:11,color:"#c0a8a8",whiteSpace:"nowrap"}}>{r.time}</div>
                    </div>
                    <div style={{fontSize:12,color:"#8a6068",marginTop:2,lineHeight:1.5}}>
                      {t.guests(r.guests)}{r.dietary?` · ${r.dietary}`:""}
                    </div>
                    {r.message&&<div style={{fontSize:13,color:"#a08090",marginTop:5,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>"{r.message}"</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <MobNav/>
    </div>
  );
  return null;
}
