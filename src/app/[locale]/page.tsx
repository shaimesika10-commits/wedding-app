// GrandInvite – Landing Page (FR / HE / EN)
import Link from 'next/link'
import type { Locale } from '@/lib/i18n'

const content = {
  fr: {
    dir: 'ltr',
    tagline: 'Invitations de mariage numériques de luxe',
    hero: 'Créez votre invitation de mariage',
    heroSub: "Partagez votre grand jour avec élégance. Gérez vos invités, collectez les confirmations et créez des souvenirs inoubliables.",
    cta: 'Créer mon invitation',
    login: 'Se connecter',
    featuresTitle: 'Tout ce dont vous avez besoin',
    features: [
      { icon: '✉️', title: 'Invitation élégante', desc: "Une page d'invitation personnalisée à partager avec vos proches." },
      { icon: '✅', title: 'RSVP simplifié', desc: 'Vos invités confirment en un clic — adultes, enfants, allergies inclus.' },
      { icon: '📊', title: 'Tableau de bord', desc: 'Suivez vos confirmations en temps réel et exportez la liste.' },
    ],
    howTitle: 'Comment ça marche',
    steps: [
      { n: '1', title: 'Créez votre compte', desc: 'Entrez votre email et recevez un lien de connexion instantané.' },
      { n: '2', title: 'Personnalisez', desc: 'Ajoutez les détails de votre mariage : lieu, horaires, programme.' },
      { n: '3', title: 'Partagez', desc: 'Envoyez le lien à vos invités et gérez les réponses depuis votre tableau de bord.' },
    ],
    footer: '© 2026 GrandInvite — Invitations de mariage de luxe',
  },
  he: {
    dir: 'rtl',
    tagline: 'הזמנות חתונה דיגיטליות יוקרתיות',
    hero: 'צרו את הזמנת החתונה שלכם',
    heroSub: 'שתפו את היום הגדול שלכם באלגנטיות. נהלו את האורחים, אספו אישורי הגעה וצרו זיכרונות בלתי נשכחים.',
    cta: 'יצירת הזמנה',
    login: 'כניסה לחשבון',
    featuresTitle: 'כל מה שצריך',
    features: [
      { icon: '✉️', title: 'הזמנה אלגנטית', desc: 'עמוד הזמנה מותאם אישית לשיתוף עם יקיריכם.' },
      { icon: '✅', title: 'RSVP פשוט', desc: 'האורחים מאשרים בלחיצה אחת — מבוגרים, ילדים, אלרגיות.' },
      { icon: '📊', title: 'לוח ניהול', desc: 'עקבו אחרי האישורים בזמן אמת וייצאו את הרשימה.' },
    ],
    howTitle: 'איך זה עובד',
    steps: [
      { n: '1', title: 'צרו חשבון', desc: 'הזינו את האימייל וקבלו קישור כניסה מיידי.' },
      { n: '2', title: 'התאימו אישית', desc: 'הוסיפו פרטי חתונה, מיקום, שעות ולוח אירועים.' },
      { n: '3', title: 'שתפו', desc: 'שלחו את הקישור לאורחים ונהלו תשובות מלוח הניהול.' },
    ],
    footer: '© 2026 GrandInvite — הזמנות חתונה יוקרתיות',
  },
  en: {
    dir: 'ltr',
    tagline: 'Luxury digital wedding invitations',
    hero: 'Create your wedding invitation',
    heroSub: 'Share your big day with elegance. Manage your guests, collect RSVPs and create unforgettable memories.',
    cta: 'Create my invitation',
    login: 'Sign in',
    featuresTitle: 'Everything you need',
    features: [
      { icon: '✉️', title: 'Elegant invitation', desc: 'A personalised invitation page to share with your loved ones.' },
      { icon: '✅', title: 'Easy RSVP', desc: 'Guests confirm in one click — adults, children, dietary needs included.' },
      { icon: '📊', title: 'Dashboard', desc: 'Track confirmations in real time and export your guest list.' },
    ],
    howTitle: 'How it works',
    steps: [
      { n: '1', title: 'Create your account', desc: 'Enter your email and receive an instant magic link.' },
      { n: '2', title: 'Personalise', desc: 'Add your wedding details, venue, schedule and timings.' },
      { n: '3', title: 'Share', desc: 'Send the link to guests and manage responses from your dashboard.' },
    ],
    footer: '© 2026 GrandInvite — Luxury wedding invitations',
  },
}

const gold = '#c9a84c'

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const c = content[locale] ?? content.fr

  return (
    <main dir={c.dir} style={{ minHeight: '100vh', background: '#faf8f5', fontFamily: 'Georgia, serif', color: '#1c1917' }}>

      {/* ── NAV ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', borderBottom: '1px solid #e7e5e4', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.1em' }}>
          Grand<span style={{ color: gold }}>Invite</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Language switcher */}
          <div style={{ display: 'flex', gap: '0.25rem', background: '#f5f5f4', borderRadius: '8px', padding: '4px' }}>
            {(['fr', 'he', 'en'] as Locale[]).map(lang => (
              <Link key={lang} href={`/${lang}`} style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                textDecoration: 'none', fontFamily: 'system-ui, sans-serif',
                background: locale === lang ? '#fff' : 'transparent',
                color: locale === lang ? '#1c1917' : '#78716c',
                boxShadow: locale === lang ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}>
                {lang.toUpperCase()}
              </Link>
            ))}
          </div>
          {/* Login */}
          <Link href={`/${locale}/login`} style={{
            padding: '0.5rem 1.25rem', border: `1px solid ${gold}`, borderRadius: '8px',
            color: gold, textDecoration: 'none', fontSize: '0.85rem',
            fontFamily: 'system-ui, sans-serif', letterSpacing: '0.04em',
          }}>
            {c.login}
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem 4rem', maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #e7e5e4', borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '2rem', fontSize: '0.8rem', color: '#78716c', fontFamily: 'system-ui, sans-serif' }}>
          <span style={{ color: gold }}>✦</span><span>{c.tagline}</span><span style={{ color: gold }}>✦</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, lineHeight: 1.2, marginBottom: '1.5rem' }}>
          {c.hero}
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#78716c', lineHeight: 1.7, marginBottom: '2.5rem', fontFamily: 'system-ui, sans-serif', fontWeight: 300 }}>
          {c.heroSub}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={`/${locale}/login`} style={{
            padding: '0.9rem 2.5rem', background: gold, color: '#fff', borderRadius: '10px',
            textDecoration: 'none', fontSize: '0.9rem', fontFamily: 'system-ui, sans-serif',
            fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            boxShadow: '0 4px 14px rgba(201,168,76,0.4)',
          }}>
            {c.cta}
          </Link>
          <Link href={`/${locale}/login`} style={{
            padding: '0.9rem 2.5rem', background: 'transparent', border: '1px solid #d6d3d1',
            color: '#78716c', borderRadius: '10px', textDecoration: 'none',
            fontSize: '0.9rem', fontFamily: 'system-ui, sans-serif',
          }}>
            {c.login}
          </Link>
        </div>
      </section>

      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, #e7e5e4, transparent)', maxWidth: '600px', margin: '0 auto' }} />

      {/* ── FEATURES ── */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 300, marginBottom: '3rem' }}>{c.featuresTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {c.features.map(f => (
            <div key={f.title} style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: '14px', padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 400, marginBottom: '0.6rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#78716c', lineHeight: 1.6, fontFamily: 'system-ui, sans-serif', fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '3rem 2rem 5rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 300, marginBottom: '3rem' }}>{c.howTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          {c.steps.map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <div style={{ width: '3rem', height: '3rem', background: gold, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>
                {s.n}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 400, marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#78716c', lineHeight: 1.6, fontFamily: 'system-ui, sans-serif', fontWeight: 300 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <Link href={`/${locale}/login`} style={{
            display: 'inline-block', padding: '1rem 3rem', background: gold, color: '#fff',
            borderRadius: '10px', textDecoration: 'none', fontSize: '0.9rem',
            fontFamily: 'system-ui, sans-serif', fontWeight: 600, letterSpacing: '0.06em',
            textTransform: 'uppercase', boxShadow: '0 4px 14px rgba(201,168,76,0.4)',
          }}>
            {c.cta}
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #e7e5e4', padding: '1.5rem', textAlign: 'center', color: '#a8a29e', fontSize: '0.8rem', fontFamily: 'system-ui, sans-serif', background: '#fff' }}>
        {c.footer}
      </footer>
    </main>
  )
        }
