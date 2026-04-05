// ============================================================
//  GrandInvite – Landing Page  (enhanced)
//  Hero · Stats · Features · How it works · Pricing · Testimonials · CTA
//  src/app/[locale]/page.tsx
// ============================================================

import Link from 'next/link'
import type { Metadata } from 'next'
import type { Locale } from '@/lib/i18n'

// ── Static metadata ──────────────────────────────────────────
export const metadata: Metadata = {
  title: 'GrandInvite — Invitations de mariage numériques de luxe',
  description:
    'Créez votre invitation de mariage digitale, gérez vos invités et collectez les RSVP en toute élégance. Gratuit jusqu\'à 200 invités.',
  openGraph: {
    title: 'GrandInvite — Luxury Digital Wedding Invitations',
    description: 'Create your digital wedding invitation, manage guests and collect RSVPs beautifully.',
    siteName: 'GrandInvite',
    type: 'website',
    images: [{ url: 'https://wedding-app-pearl-alpha.vercel.app/logo512.png', width: 512, height: 512 }],
  },
  twitter: { card: 'summary_large_image' },
}

// ── Content (i18n) ────────────────────────────────────────────
const content = {
  fr: {
    dir: 'ltr' as const,
    tagline: 'Invitations de mariage numériques de luxe',
    hero: 'Votre mariage mérite\nune invitation d\'exception',
    heroSub:
      'Créez en quelques minutes une invitation numérique élégante. Gérez vos invités, collectez les confirmations et partagez votre grand jour avec ceux qui vous sont chers.',
    cta: 'Créer mon invitation',
    ctaSub: 'Gratuit jusqu\'à 200 invités',
    login: 'Se connecter',
    stats: [
      { n: '500+', label: 'Mariages célébrés' },
      { n: '3',    label: 'Pays (FR · IL · CA)' },
      { n: '50k+', label: 'Invités gérés' },
      { n: '98%',  label: 'Taux de satisfaction' },
    ],
    featuresTitle: 'Tout ce dont vous avez besoin',
    features: [
      { icon: '✉️', title: 'Invitation élégante',      desc: 'Une page personnalisée avec vos noms, date, lieu et photo de couple.' },
      { icon: '✅', title: 'RSVP simplifié',           desc: 'Vos invités confirment en un clic — adultes, enfants, allergies, notes.' },
      { icon: '📊', title: 'Tableau de bord',          desc: 'Suivez confirmations et déclins en temps réel, exportez en CSV.' },
      { icon: '🌐', title: 'Multilingue',              desc: 'Français, Hébreu et Anglais — chaque invité lit dans sa langue.' },
      { icon: '🖼️', title: 'Galerie photos',           desc: 'Partagez vos photos de couple et créez des souvenirs inoubliables.' },
      { icon: '🥂', title: 'Brunch du lendemain',      desc: 'Gérez facilement un brunch le lendemain avec RSVP séparé.' },
    ],
    howTitle: 'En 3 étapes seulement',
    steps: [
      { n: '1', title: 'Créez votre compte',   desc: 'Email ou Google — accès immédiat, sans carte bancaire.' },
      { n: '2', title: 'Personnalisez',        desc: 'Noms, date, lieu, photo, programme, style typographique.' },
      { n: '3', title: 'Partagez',             desc: 'Copiez votre lien unique et envoyez-le par WhatsApp, SMS ou email.' },
    ],
    pricingTitle: 'Tarification simple et transparente',
    plans: [
      {
        name: 'Gratuit',
        price: '0 €',
        period: 'pour toujours',
        features: ['Jusqu\'à 200 invités', 'Invitation personnalisée', 'RSVP + tableau de bord', 'Export CSV', 'Support email'],
        cta: 'Commencer gratuitement',
        highlighted: false,
      },
      {
        name: 'Premium',
        price: '29 €',
        period: 'accès à vie',
        features: ['Invités illimités', 'Galerie photos illimitée', 'Brunch du lendemain', 'Suppression logo GrandInvite', 'Support prioritaire'],
        cta: 'Passer Premium',
        highlighted: true,
      },
    ],
    testimonialsTitle: 'Ils ont fait confiance à GrandInvite',
    testimonials: [
      { name: 'Sophie & Antoine', location: 'Paris, France',   quote: 'Nos 180 invités ont adoré l\'interface. Les RSVP sont arrivés en 48h, c\'était magique !' },
      { name: 'Maya & Lior',      location: 'Tel Aviv, Israël', quote: 'GrandInvite gérait parfaitement l\'hébreu et le français pour notre famille mixte. Parfait !' },
      { name: 'Camille & Hugo',   location: 'Montréal, Canada', quote: 'Simple, élégant et efficace. La gestion du brunch du lendemain était un vrai plus.' },
    ],
    footer: '© 2026 GrandInvite — Invitations de mariage de luxe · Mentions légales · Contact',
  },
  he: {
    dir: 'rtl' as const,
    tagline: 'הזמנות חתונה דיגיטליות יוקרתיות',
    hero: 'החתונה שלכם ראויה\nלהזמנה יוצאת דופן',
    heroSub:
      'צרו תוך דקות הזמנה דיגיטלית אלגנטית. נהלו את האורחים, אספו אישורי הגעה ושתפו את היום הגדול שלכם עם יקיריכם.',
    cta: 'יצירת הזמנה',
    ctaSub: 'חינם עד 200 מוזמנים',
    login: 'כניסה',
    stats: [
      { n: '500+', label: 'חתונות' },
      { n: '3',    label: 'מדינות' },
      { n: '50k+', label: 'אורחים' },
      { n: '98%',  label: 'שביעות רצון' },
    ],
    featuresTitle: 'כל מה שצריך',
    features: [
      { icon: '✉️', title: 'הזמנה אלגנטית',    desc: 'עמוד מותאם אישית עם שמות, תאריך, מיקום ותמונה.' },
      { icon: '✅', title: 'RSVP פשוט',         desc: 'האורחים מאשרים בלחיצה — מבוגרים, ילדים, אלרגיות, הערות.' },
      { icon: '📊', title: 'לוח ניהול',         desc: 'עקבו אחרי האישורים בזמן אמת, ייצאו לאקסל.' },
      { icon: '🌐', title: 'רב לשוני',          desc: 'עברית, צרפתית ואנגלית — כל אורח קורא בשפתו.' },
      { icon: '🖼️', title: 'גלריית תמונות',   desc: 'שתפו תמונות ושמרו זיכרונות בלתי נשכחים.' },
      { icon: '🥂', title: 'בראנץ׳ למחרת',     desc: 'נהלו בראנץ׳ ביום שאחרי עם אישור הגעה נפרד.' },
    ],
    howTitle: 'בשלושה שלבים בלבד',
    steps: [
      { n: '1', title: 'צרו חשבון',     desc: 'אימייל או Google — גישה מיידית, ללא כרטיס אשראי.' },
      { n: '2', title: 'התאימו אישית',  desc: 'שמות, תאריך, מיקום, תמונה, לו"ז וסגנון גופן.' },
      { n: '3', title: 'שתפו',          desc: 'העתיקו את הקישור ושלחו ב-WhatsApp, SMS או אימייל.' },
    ],
    pricingTitle: 'תמחור פשוט ושקוף',
    plans: [
      {
        name: 'חינמי',
        price: '₪0',
        period: 'לתמיד',
        features: ['עד 200 מוזמנים', 'הזמנה מותאמת אישית', 'RSVP + לוח ניהול', 'ייצוא CSV', 'תמיכה באימייל'],
        cta: 'התחילו בחינם',
        highlighted: false,
      },
      {
        name: 'פרמיום',
        price: '₪99',
        period: 'גישה לצמיתות',
        features: ['מוזמנים ללא הגבלה', 'גלריה ללא הגבלה', 'בראנץ׳ למחרת', 'הסרת לוגו GrandInvite', 'תמיכה מועדפת'],
        cta: 'שדרגו לפרמיום',
        highlighted: true,
      },
    ],
    testimonialsTitle: 'הם בחרו ב-GrandInvite',
    testimonials: [
      { name: 'מאיה & ליאור',     location: 'תל אביב',       quote: 'GrandInvite ניהל בצורה מושלמת את האורחים בעברית ובצרפתית. הכל עבד בצורה קסומה!' },
      { name: 'נועה & עמית',      location: 'ירושלים',        quote: 'ב-48 שעות קיבלנו 150 אישורים. לא האמנו כמה זה פשוט ויפה.' },
      { name: 'ספיר & אביב',      location: 'חיפה',           quote: 'הבראנץ׳ למחרת היה ניהול נפרד מושלם. כל המשפחה הייתה מרוצה!' },
    ],
    footer: '© 2026 GrandInvite — הזמנות חתונה יוקרתיות · צור קשר',
  },
  en: {
    dir: 'ltr' as const,
    tagline: 'Luxury digital wedding invitations',
    hero: 'Your wedding deserves\nan invitation to match',
    heroSub:
      'Create an elegant digital invitation in minutes. Manage your guests, collect RSVPs and share your big day with the people you love.',
    cta: 'Create my invitation',
    ctaSub: 'Free for up to 200 guests',
    login: 'Sign in',
    stats: [
      { n: '500+', label: 'Weddings celebrated' },
      { n: '3',    label: 'Countries (FR · IL · CA)' },
      { n: '50k+', label: 'Guests managed' },
      { n: '98%',  label: 'Satisfaction rate' },
    ],
    featuresTitle: 'Everything you need',
    features: [
      { icon: '✉️', title: 'Elegant invitation',    desc: 'A personalised page with your names, date, venue and couple photo.' },
      { icon: '✅', title: 'Easy RSVP',              desc: 'Guests confirm in one click — adults, children, dietary needs, notes.' },
      { icon: '📊', title: 'Dashboard',              desc: 'Track confirmations in real time, export your list to CSV.' },
      { icon: '🌐', title: 'Multilingual',           desc: 'French, Hebrew and English — every guest reads in their language.' },
      { icon: '🖼️', title: 'Photo gallery',         desc: 'Share your couple photos and create unforgettable memories.' },
      { icon: '🥂', title: 'Morning-after Brunch',   desc: 'Easily manage a brunch event the next day with a separate RSVP.' },
    ],
    howTitle: 'Just 3 steps',
    steps: [
      { n: '1', title: 'Create your account', desc: 'Email or Google — instant access, no credit card needed.' },
      { n: '2', title: 'Personalise',         desc: 'Names, date, venue, photo, schedule and typography style.' },
      { n: '3', title: 'Share',               desc: 'Copy your unique link and send via WhatsApp, SMS or email.' },
    ],
    pricingTitle: 'Simple, transparent pricing',
    plans: [
      {
        name: 'Free',
        price: '$0',
        period: 'forever',
        features: ['Up to 200 guests', 'Personalised invitation', 'RSVP + dashboard', 'CSV export', 'Email support'],
        cta: 'Get started for free',
        highlighted: false,
      },
      {
        name: 'Premium',
        price: '$29',
        period: 'lifetime access',
        features: ['Unlimited guests', 'Unlimited photo gallery', 'Morning-after Brunch', 'Remove GrandInvite branding', 'Priority support'],
        cta: 'Go Premium',
        highlighted: true,
      },
    ],
    testimonialsTitle: 'Couples who trusted GrandInvite',
    testimonials: [
      { name: 'Sophie & Antoine', location: 'Paris, France',    quote: 'Our 180 guests loved the experience. RSVPs came in within 48 hours — truly magical!' },
      { name: 'Maya & Lior',      location: 'Tel Aviv, Israel',  quote: 'GrandInvite handled Hebrew and French perfectly for our mixed family. Absolutely flawless.' },
      { name: 'Camille & Hugo',   location: 'Montreal, Canada',  quote: 'Simple, elegant and efficient. The next-day brunch management was a real bonus.' },
    ],
    footer: '© 2026 GrandInvite — Luxury wedding invitations · Legal · Contact',
  },
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const c = content[locale] ?? content.fr
  const gold = '#c9a84c'
  const isRTL = c.dir === 'rtl'

  return (
    <main dir={c.dir} style={{ minHeight: '100vh', background: '#faf8f5', fontFamily: 'Georgia, serif', color: '#1c1917' }}>

      {/* ── NAV ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', borderBottom: '1px solid #e7e5e4', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.1em' }}>
          Grand<span style={{ color: gold }}>Invite</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem', background: '#f5f5f4', borderRadius: '8px', padding: '4px' }}>
            {(['fr', 'he', 'en'] as Locale[]).map(lang => (
              <Link key={lang} href={`/${lang}`} style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500,
                letterSpacing: '0.05em', textDecoration: 'none',
                background: locale === lang ? '#fff' : 'transparent',
                color: locale === lang ? '#1c1917' : '#78716c',
                boxShadow: locale === lang ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontFamily: 'system-ui, sans-serif',
              }}>
                {lang.toUpperCase()}
              </Link>
            ))}
          </div>
          <Link href={`/${locale}/login`} style={{
            padding: '0.5rem 1.25rem', border: `1px solid ${gold}`, borderRadius: '8px',
            color: gold, textDecoration: 'none', fontSize: '0.85rem',
            fontFamily: 'system-ui, sans-serif', letterSpacing: '0.05em',
          }}>
            {c.login}
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff',
          border: '1px solid #e7e5e4', borderRadius: '999px', padding: '0.35rem 1rem',
          marginBottom: '2rem', fontSize: '0.8rem', color: '#78716c', fontFamily: 'system-ui, sans-serif',
        }}>
          <span style={{ color: gold }}>✦</span>
          <span>{c.tagline}</span>
          <span style={{ color: gold }}>✦</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 300, lineHeight: 1.2, marginBottom: '1.5rem', letterSpacing: '-0.01em', whiteSpace: 'pre-line' }}>
          {c.hero}
        </h1>

        <p style={{ fontSize: '1.05rem', color: '#78716c', lineHeight: 1.75, marginBottom: '2.5rem', fontFamily: 'system-ui, sans-serif', fontWeight: 300, maxWidth: '620px', margin: '0 auto 2.5rem' }}>
          {c.heroSub}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Link href={`/${locale}/login`} style={{
            padding: '0.9rem 2.5rem', background: gold, color: '#fff', borderRadius: '10px',
            textDecoration: 'none', fontSize: '0.9rem', fontFamily: 'system-ui, sans-serif',
            fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
            boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
          }}>
            {c.cta}
          </Link>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#a8a29e', fontFamily: 'system-ui, sans-serif' }}>{c.ctaSub}</p>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: '#fff', borderTop: '1px solid #e7e5e4', borderBottom: '1px solid #e7e5e4', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          {c.stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '2rem', fontWeight: 300, color: gold, letterSpacing: '-0.02em' }}>{s.n}</div>
              <div style={{ fontSize: '0.78rem', color: '#78716c', fontFamily: 'system-ui, sans-serif', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.9rem', fontWeight: 300, marginBottom: '3rem', letterSpacing: '0.02em' }}>
          {c.featuresTitle}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {c.features.map(f => (
            <div key={f.title} style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: '16px', padding: '2rem', textAlign: isRTL ? 'right' : 'left' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 400, marginBottom: '0.6rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#78716c', lineHeight: 1.65, fontFamily: 'system-ui, sans-serif', fontWeight: 300, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: '#fff', padding: '5rem 2rem', borderTop: '1px solid #e7e5e4', borderBottom: '1px solid #e7e5e4' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.9rem', fontWeight: 300, marginBottom: '3.5rem', letterSpacing: '0.02em' }}>
            {c.howTitle}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
            {c.steps.map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: '3.5rem', height: '3.5rem', background: gold, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#fff', fontSize: '1.25rem', fontWeight: 400, fontFamily: 'Georgia, serif' }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 400, marginBottom: '0.6rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#78716c', lineHeight: 1.65, fontFamily: 'system-ui, sans-serif', fontWeight: 300, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: '5rem 2rem', maxWidth: '780px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.9rem', fontWeight: 300, marginBottom: '3rem', letterSpacing: '0.02em' }}>
          {c.pricingTitle}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {c.plans.map(plan => (
            <div key={plan.name} style={{
              background: plan.highlighted ? gold : '#fff',
              border: `2px solid ${plan.highlighted ? gold : '#e7e5e4'}`,
              borderRadius: '20px',
              padding: '2.5rem',
              textAlign: 'center',
              position: 'relative',
            }}>
              {plan.highlighted && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#1c1917', color: '#fff', fontSize: '0.7rem', fontFamily: 'system-ui, sans-serif', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: '999px' }}>
                  ✦ Best value
                </div>
              )}
              <h3 style={{ fontSize: '1.3rem', fontWeight: 300, marginBottom: '0.5rem', color: plan.highlighted ? '#fff' : '#1c1917' }}>{plan.name}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 300, color: plan.highlighted ? '#fff' : gold, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>{plan.price}</div>
              <div style={{ fontSize: '0.8rem', color: plan.highlighted ? 'rgba(255,255,255,0.75)' : '#a8a29e', fontFamily: 'system-ui, sans-serif', marginBottom: '2rem' }}>{plan.period}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', textAlign: isRTL ? 'right' : 'left' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', fontSize: '0.875rem', fontFamily: 'system-ui, sans-serif', color: plan.highlighted ? 'rgba(255,255,255,0.9)' : '#44403c', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <span style={{ color: plan.highlighted ? '#fff' : gold, fontSize: '1rem', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={`/${locale}/login`} style={{
                display: 'block', padding: '0.85rem 1.5rem',
                background: plan.highlighted ? '#fff' : gold,
                color: plan.highlighted ? gold : '#fff',
                borderRadius: '10px', textDecoration: 'none',
                fontSize: '0.85rem', fontFamily: 'system-ui, sans-serif',
                fontWeight: 500, letterSpacing: '0.06em',
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#fff', borderTop: '1px solid #e7e5e4', borderBottom: '1px solid #e7e5e4', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.9rem', fontWeight: 300, marginBottom: '3rem', letterSpacing: '0.02em' }}>
            {c.testimonialsTitle}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {c.testimonials.map(t => (
              <div key={t.name} style={{ background: '#faf8f5', border: '1px solid #e7e5e4', borderRadius: '16px', padding: '2rem', textAlign: isRTL ? 'right' : 'left' }}>
                <div style={{ fontSize: '1.5rem', color: gold, marginBottom: '1rem' }}>&ldquo;</div>
                <p style={{ fontSize: '0.9rem', color: '#44403c', lineHeight: 1.7, fontFamily: 'system-ui, sans-serif', fontWeight: 300, margin: '0 0 1.5rem', fontStyle: 'italic' }}>{t.quote}</p>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 400 }}>{t.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#a8a29e', fontFamily: 'system-ui, sans-serif' }}>{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center', background: 'linear-gradient(180deg, #faf8f5 0%, #fff8e8 100%)' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '1px', background: gold, marginBottom: '2rem' }} />
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 300, marginBottom: '1rem', letterSpacing: '-0.01em' }}>
          Grand<span style={{ color: gold }}>Invite</span>
        </h2>
        <p style={{ fontSize: '1rem', color: '#78716c', marginBottom: '2.5rem', fontFamily: 'system-ui, sans-serif', fontWeight: 300 }}>
          {c.ctaSub}
        </p>
        <Link href={`/${locale}/login`} style={{
          display: 'inline-block', padding: '1rem 3.5rem', background: gold, color: '#fff',
          borderRadius: '10px', textDecoration: 'none', fontSize: '0.9rem',
          fontFamily: 'system-ui, sans-serif', fontWeight: 500,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          boxShadow: '0 4px 24px rgba(201,168,76,0.4)',
        }}>
          {c.cta}
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #e7e5e4', padding: '2rem', textAlign: 'center', color: '#a8a29e', fontSize: '0.78rem', fontFamily: 'system-ui, sans-serif', background: '#fff' }}>
        {c.footer}
      </footer>

    </main>
  )
}
