// ============================================================
//  GrandInvite – Landing Page Stats Section (Client Component)
//  Animated counter for countries stat
//  src/components/LandingPageStats.tsx
// ============================================================

'use client'

import { useState, useEffect } from 'react'

interface Stat {
  n: string
  label: string
}

interface LandingPageStatsProps {
  stats: Stat[]
  gold: string
}

export default function LandingPageStats({ stats, gold }: LandingPageStatsProps) {
  const [animated, setAnimated] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const newAnimated: Record<number, boolean> = {}
    stats.forEach((_, idx) => { newAnimated[idx] = true })
    setAnimated(newAnimated)
  }, [stats])

  const getDisplayValue = (stat: Stat, index: number) => {
    if (index === 1 && stat.n === '23' && animated[index]) {
      return <AnimatedCounter target={23} />
    }
    return stat.n
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      {stats.map((s, idx) => (
        <div key={s.label}>
          <div style={{ fontSize: '2rem', fontWeight: 300, color: gold, letterSpacing: '-0.02em' }}>
            {getDisplayValue(s, idx)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#78716c', marginTop: '0.25rem' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target])

  return <>{count}</>
}
