export type Locale = 'fr' | 'he' | 'en'
export const RTL_LOCALES: Locale[] = ['he']
export function isRTL(locale: Locale): boolean { return RTL_LOCALES.includes(locale) }

export const translations = {
  fr: {
    rsvp: {
      title: 'Confirmer votre présence', subtitle: 'Nous serions ravis de vous avoir parmi nous',
      name: 'Votre nom complet', namePlaceholder: 'Marie Dupont',
      email: 'Adresse e-mail (facultatif)', phone: 'Téléphone (facultatif)',
      adults: "Nombre d'adultes", children: "Nombre d'enfants",
      dietary: 'Préférences alimentaires', dietaryPlaceholder: 'Végétarien, Halal, Casher, Sans gluten...',
      allergies: 'Allergies alimentaires', allergiesPlaceholder: 'Ex: noix, lactose, gluten...',
      notes: 'Autres / Notes supplémentaires', notesPlaceholder: 'Besoins particuliers, demandes spéciales...',
      confirm: 'Je confirme ma présence 🎉', decline: 'Je ne pourrai pas venir',
      submitting: 'Envoi en cours...', successConfirm: 'Merci ! Votre présence a été confirmée.',
      successDecline: 'Merci de nous avoir prévenus. Vous nous manquerez !',
      error: "Une erreur s'est produite. Veuillez réessayer.",
      deadline: 'Répondre avant le', attending: 'Serez-vous présent(e) ?',
      yes: 'Oui, avec plaisir !', no: 'Non, malheureusement',
    },
    wedding: {
      saveDate: 'Réservez la date', ceremony: 'Cérémonie', dinner: 'Dîner',
      brunch: 'Brunch du lendemain', venue: 'Lieu', schedule: 'Programme',
      gallery: 'Galerie photos', directions: 'Itinéraire', googleMaps: 'Google Maps', waze: 'Waze',
    },
    dashboard: {
      title: 'Gestion des invités', confirmed: 'Confirmés', declined: 'Déclinés',
      pending: 'En attente', totalGuests: 'Invités totaux', adults: 'Adultes', children: 'Enfants',
      exportCSV: 'Exporter en CSV', search: 'Rechercher un invité...', name: 'Nom',
      status: 'Statut', guests: 'Invités', dietary: 'Régime', notes: 'Notes',
      submittedAt: 'Date de réponse', allStatuses: 'Tous les statuts',
    },
  },
  he: {
    rsvp: {
      title: 'אישור הגעה', subtitle: 'נשמח לחגוג יחד איתכם',
      name: 'שם מלא', namePlaceholder: 'ישראל ישראלי',
      email: 'כתובת אימייל (אופציונלי)', phone: 'טלפון (אופציונלי)',
      adults: 'מספר מבוגרים', children: 'מספר ילדים',
      dietary: 'העדפות תזונתיות', dietaryPlaceholder: 'צמחוני, טבעוני, כשר...',
      allergies: 'אלרגיות למזון', allergiesPlaceholder: 'לדוגמה: אגוזים, לקטוז...',
      notes: 'אחר / הערות נוספות', notesPlaceholder: 'בקשות מיוחדות...',
      confirm: 'אני מאשר/ת הגעה 🎉', decline: 'לצערי לא אוכל להגיע',
      submitting: 'שולח...', successConfirm: 'תודה! אישור ההגעה התקבל.',
      successDecline: 'תודה שהודעת לנו.', error: 'אירעה שגיאה. אנא נסה שוב.',
      deadline: 'יש לאשר עד', attending: 'האם תגיע/י?',
      yes: 'כן, אשמח להגיע!', no: 'לא, לצערי',
    },
    wedding: {
      saveDate: 'שמרו את התאריך', ceremony: 'טקס', dinner: 'ארוחת ערב',
      brunch: 'בראנץ למחרת', venue: 'מיקום', schedule: 'לו"ז האירוע',
      gallery: 'גלריית תמונות', directions: 'ניווט', googleMaps: 'Google Maps', waze: 'Waze',
    },
    dashboard: {
      title: 'ניהול אורחים', confirmed: 'מאושרים', declined: 'סרבו',
      pending: 'ממתינים', totalGuests: 'סה"כ מוזמנים', adults: 'מבוגרים', children: 'ילדים',
      exportCSV: 'ייצוא ל-CSV', search: 'חיפוש אורח...', name: 'שם',
      status: 'סטטוס', guests: 'אורחים', dietary: 'תזונה', notes: 'הערות',
      submittedAt: 'תאריך תגובה', allStatuses: 'כל הסטטוסים',
    },
  },
  en: {
    rsvp: {
      title: 'RSVP', subtitle: 'We would love to celebrate with you',
      name: 'Full name', namePlaceholder: 'John Smith',
      email: 'Email address (optional)', phone: 'Phone (optional)',
      adults: 'Number of adults', children: 'Number of children',
      dietary: 'Dietary preferences', dietaryPlaceholder: 'Vegetarian, Vegan, Kosher, Gluten-free...',
      allergies: 'Food allergies', allergiesPlaceholder: 'e.g. nuts, lactose, gluten...',
      notes: 'Other / Additional notes', notesPlaceholder: 'Special requests, accessibility needs...',
      confirm: 'I confirm my attendance 🎉', decline: 'I cannot attend',
      submitting: 'Sending...', successConfirm: 'Thank you! Your attendance has been confirmed.',
      successDecline: 'Thank you for letting us know. You will be missed!',
      error: 'An error occurred. Please try again.',
      deadline: 'Please reply by', attending: 'Will you be attending?',
      yes: 'Yes, I would love to!', no: 'No, unfortunately',
    },
    wedding: {
      saveDate: 'Save the Date', ceremony: 'Ceremony', dinner: 'Dinner',
      brunch: 'Morning-after Brunch', venue: 'Venue', schedule: 'Schedule',
      gallery: 'Photo Gallery', directions: 'Directions', googleMaps: 'Google Maps', waze: 'Waze',
    },
    dashboard: {
      title: 'Guest Management', confirmed: 'Confirmed', declined: 'Declined',
      pending: 'Pending', totalGuests: 'Total Guests', adults: 'Adults', children: 'Children',
      exportCSV: 'Export to CSV', search: 'Search guests...', name: 'Name',
      status: 'Status', guests: 'Guests', dietary: 'Diet', notes: 'Notes',
      submittedAt: 'Response Date', allStatuses: 'All Statuses',
    },
  },
} as const

export type TranslationKey = typeof translations.fr
export function t(locale: Locale): TranslationKey { return translations[locale] ?? translations.fr }
