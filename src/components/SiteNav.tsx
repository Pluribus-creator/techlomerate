// src/components/SiteNav.tsx
//
// One nav for every page. Pass which desk you're on: "home" | "market" |
// "loop" | "skynet" | "thirst". It renders the colored top bar, the wordmark,
// the other three desk links (current desk hides itself), About, and the date.
//
// Responsive: every name uses clamp() so it shrinks as the window narrows,
// and whiteSpace:nowrap so a name never breaks in the middle. If the row runs
// out of room, whole names wrap down intact — never "The Old" / "Market".
//
// To tweak the shrink behavior site-wide, change the clamp() numbers below once.

import type { CSSProperties } from 'react'

type Current = 'home' | 'market' | 'loop' | 'skynet' | 'thirst'
type Desk = 'market' | 'loop' | 'skynet' | 'thirst'

const TOP_BAR: Record<Current, string> = {
  home: 'var(--teal-400)',
  market: 'var(--teal-400)',
  loop: 'linear-gradient(90deg, #F25430, #F5A623, #F8E71C, #7ED321, #4A90E2, #9013FE)',
  skynet: '#E8A33D',
  thirst: '#FF2A6D',
}

const rainbowText: CSSProperties = {
  background: 'linear-gradient(90deg, #F25430, #F5A623, #F8E71C, #7ED321, #4A90E2, #9013FE)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

// shared link style — clamp() shrinks it, nowrap keeps each name in one piece
const link: CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(11px, 1.25vw, 18px)',
  fontWeight: 500,
  letterSpacing: '0.03em',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
}

function DeskLink({ desk }: { desk: Desk }) {
  switch (desk) {
    case 'market':
      return <a href="/the-old-market" style={{ ...link, color: 'var(--teal-600)' }}>The Old Market</a>
    case 'loop':
      return (
        <a href="/one-recursive-loop" style={link}>
          <span style={{ color: '#F25430' }}>One</span>{' '}
          <span style={{ color: '#4A90E2' }}>Recursive</span>{' '}
          <span style={{ color: '#9013FE' }}>Loop</span>
        </a>
      )
    case 'skynet':
      return <a href="/definitely-not-skynet" style={{ ...link, color: '#E8A33D' }}>Definitely Not Skynet</a>
    case 'thirst':
      return <a href="/the-thirst" style={{ ...link, color: '#FF2A6D' }}>The Thirst</a>
  }
}

function CurrentWordmark({ current }: { current: Current }) {
  const base: CSSProperties = {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(12px, 1.3vw, 18px)',
    fontWeight: 500,
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
  }
  if (current === 'market') return <span style={{ ...base, color: 'var(--teal-600)' }}>The Old Market</span>
  if (current === 'loop') return <span style={{ ...base, ...rainbowText }}>One Recursive Loop</span>
  if (current === 'thirst') return <span style={{ ...base, color: '#FF2A6D' }}>The Thirst</span>
  return null // home + skynet show no current-desk label in the nav
}

const ORDER: Desk[] = ['market', 'loop', 'skynet', 'thirst']

export default function SiteNav({ current }: { current: Current }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const others = ORDER.filter((d) => d !== current)
  const showSeparator = current === 'market' || current === 'loop' || current === 'thirst'

  return (
    <>
      <div style={{ height: '2px', background: TOP_BAR[current] }} />
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px', borderBottom: '0.5px solid var(--border-teal)',
        position: 'sticky', top: 0, zIndex: 99, background: 'var(--bg)',
        flexWrap: 'nowrap', overflowX: 'auto', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {current === 'home' ? (
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(14px, 1.5vw, 20px)', fontWeight: 500, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>Techlomerate</span>
          ) : (
            <a href="/" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(14px, 1.5vw, 20px)', fontWeight: 500, letterSpacing: '0.03em', color: 'var(--fg)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Techlomerate</a>
          )}
          {showSeparator && <span style={{ color: 'var(--text-tertiary)', fontSize: '16px' }}>·</span>}
          <CurrentWordmark current={current} />
        </div>
        <div style={{ display: 'flex', gap: 'clamp(8px, 1.2vw, 18px)', alignItems: 'center', flexWrap: 'nowrap' }}>
          {others.map((d) => <DeskLink key={d} desk={d} />)}
          <a href="/about" style={{ fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'none', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>About</a>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{today}</span>
        </div>
      </nav>
    </>
  )
}
