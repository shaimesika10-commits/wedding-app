-- ============================================================
--  GrandInvite – Legal Documents Premium Update
--  Run this in Supabase SQL Editor after running premium_migration.sql
--  Updates ToS, Privacy Policy, and Refund Policy to mention
--  the premium plan, pricing, and feature limits.
-- ============================================================

-- ── Update version for all affected docs ──────────────────────
-- ── Terms of Service ──────────────────────────────────────────

UPDATE public.legal_documents SET
  version = '1.1',
  updated_at = NOW(),
  content = content ||
  '<h3>7. Formules et abonnements</h3>
  <p><strong>Formule Gratuite :</strong> Limitée à 200 invités confirmés. Inclut la création d''invitation, le tableau de bord RSVP et l''export CSV.</p>
  <p><strong>Formule Premium (25 € · 27 $ · ₪99 — accès à vie) :</strong> Invités illimités, photo de couple sur l''invitation, notifications e-mail à chaque RSVP, et ajout d''un(e) co-organisateur/trice. Le paiement en ligne n''est pas encore actif ; l''activation Premium se fait manuellement via contact@grandinvite.app.</p>
  <p>GrandInvite se réserve le droit de modifier les tarifs avec un préavis de 30 jours. Les utilisateurs Premium bénéficient d''un accès à vie aux fonctionnalités achetées au moment de l''activation.</p>'
WHERE doc_type = 'tos' AND locale = 'fr';

UPDATE public.legal_documents SET
  version = '1.1',
  updated_at = NOW(),
  content = content ||
  '<h3>7. Plans and Subscriptions</h3>
  <p><strong>Free Plan:</strong> Limited to 200 confirmed guests. Includes invitation creation, RSVP dashboard, and CSV export.</p>
  <p><strong>Premium Plan ($27 · 25 € · ₪99 — lifetime access):</strong> Unlimited guests, couple photo on the invitation, email notifications per RSVP, and a co-owner for RSVP updates. Online payment is not yet active; Premium activation is done manually via contact@grandinvite.app.</p>
  <p>GrandInvite reserves the right to change pricing with 30 days notice. Premium users retain lifetime access to features purchased at the time of activation.</p>'
WHERE doc_type = 'tos' AND locale = 'en';

UPDATE public.legal_documents SET
  version = '1.1',
  updated_at = NOW(),
  content = content ||
  '<h3>7. תוכניות ומנויים</h3>
  <p><strong>תוכנית חינמית:</strong> מוגבלת ל-200 מוזמנים מאושרים. כוללת יצירת הזמנה, לוח ניהול RSVP וייצוא CSV.</p>
  <p><strong>תוכנית פרמיום (₪99 · 25 € · 27 $ — גישה לצמיתות):</strong> מוזמנים ללא הגבלה, תמונת זוג בהזמנה, התראות אימייל על כל RSVP חדש, והוספת שותף/ה נוסף/ת לעדכוני RSVP. תשלום מקוון טרם הופעל; הפעלת פרמיום מתבצעת ידנית דרך contact@grandinvite.app.</p>
  <p>GrandInvite שומרת לעצמה את הזכות לשנות מחירים עם הודעה מוקדמת של 30 ימים. משתמשי פרמיום נהנים מגישה לצמיתות לתכונות שנרכשו בעת ההפעלה.</p>'
WHERE doc_type = 'tos' AND locale = 'he';

-- ── Refund Policy ──────────────────────────────────────────────

UPDATE public.legal_documents SET
  version = '1.1',
  updated_at = NOW(),
  content = content ||
  '<h3>Remboursements — Formule Premium</h3>
  <p>La formule Premium est proposée à 25 € (ou équivalent : 27 $ / ₪99) en paiement unique pour un accès à vie.</p>
  <p>Un remboursement complet est accordé dans les <strong>14 jours</strong> suivant l''activation, si aucune des fonctionnalités Premium n''a été utilisée (photo de couple, notifications RSVP, co-organisateur).</p>
  <p>Passé ce délai ou après utilisation, aucun remboursement ne sera accordé. Pour toute demande, contactez : contact@grandinvite.app</p>'
WHERE doc_type = 'refund' AND locale = 'fr';

UPDATE public.legal_documents SET
  version = '1.1',
  updated_at = NOW(),
  content = content ||
  '<h3>Refunds — Premium Plan</h3>
  <p>The Premium plan is offered at $27 (or equivalent: 25 € / ₪99) as a one-time payment for lifetime access.</p>
  <p>A full refund is available within <strong>14 days</strong> of activation, provided no Premium features have been used (couple photo, RSVP notifications, co-owner).</p>
  <p>After this period or after use, no refund will be granted. For any request, contact: contact@grandinvite.app</p>'
WHERE doc_type = 'refund' AND locale = 'en';

UPDATE public.legal_documents SET
  version = '1.1',
  updated_at = NOW(),
  content = content ||
  '<h3>החזרים — תוכנית פרמיום</h3>
  <p>תוכנית פרמיום מוצעת ב-₪99 (או שווה ערך: 25 € / 27 $) כתשלום חד פעמי לגישה לצמיתות.</p>
  <p>החזר מלא יינתן תוך <strong>14 ימים</strong> מהפעלה, בתנאי שלא נעשה שימוש בתכונות פרמיום (תמונת זוג, התראות RSVP, שותף/ה נוסף/ת).</p>
  <p>לאחר מועד זה או לאחר שימוש, לא יינתנו החזרים. לכל בקשה, פנו ל: contact@grandinvite.app</p>'
WHERE doc_type = 'refund' AND locale = 'he';

-- ── Privacy Policy — mention email notifications ───────────────

UPDATE public.legal_documents SET
  version = '1.1',
  updated_at = NOW(),
  content = content ||
  '<h3>Notifications e-mail — Comptes Premium</h3>
  <p>Les titulaires d''un compte Premium reçoivent des notifications e-mail pour chaque nouveau RSVP. Ces e-mails sont envoyés à l''adresse principale et, le cas échéant, à l''adresse co-organisateur définie dans les paramètres. Vous pouvez désactiver les notifications à tout moment en révoquant votre statut Premium ou en contactant contact@grandinvite.app.</p>'
WHERE doc_type = 'privacy' AND locale = 'fr';

UPDATE public.legal_documents SET
  version = '1.1',
  updated_at = NOW(),
  content = content ||
  '<h3>Email Notifications — Premium Accounts</h3>
  <p>Premium account holders receive email notifications for each new RSVP. These emails are sent to the primary address and, if set, to the co-owner address defined in account settings. You can disable notifications at any time by revoking your Premium status or contacting contact@grandinvite.app.</p>'
WHERE doc_type = 'privacy' AND locale = 'en';

UPDATE public.legal_documents SET
  version = '1.1',
  updated_at = NOW(),
  content = content ||
  '<h3>התראות אימייל — חשבונות פרמיום</h3>
  <p>בעלי חשבון פרמיום מקבלים התראות אימייל על כל RSVP חדש. המיילים נשלחים לכתובת הראשית ולכתובת השותף/ה (אם הוגדרה) בהגדרות החשבון. ניתן לבטל התראות בכל עת על ידי ביטול סטטוס פרמיום או פנייה ל-contact@grandinvite.app.</p>'
WHERE doc_type = 'privacy' AND locale = 'he';

-- ── Verify updates ────────────────────────────────────────────
SELECT doc_type, locale, version, updated_at,
       length(content) AS content_length
FROM public.legal_documents
ORDER BY doc_type, locale;
