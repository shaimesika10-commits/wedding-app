import type { Locale } from '@/lib/i18n'

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale: _locale } = await params
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#faf8f5', fontFamily: 'Georgia, serif' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 300, color: '#1c1917', marginBottom: '0.5rem' }}>
          Grand<span style={{ color: '#c9a84c' }}>Invite</span>
        </h1>
        <p style={{ color: '#78716c', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Invitations de mariage numériques de luxe
        </p>
        <div style={{ height: '1px', width: '80px', background: '#c9a84c', margin: '0 auto 2rem' }} />
        <p style={{ color: '#a8a29e', fontSize: '0.9rem' }}>✦ GrandInvite fonctionne ✦</p>
      </div>
    </main>
  )
}
