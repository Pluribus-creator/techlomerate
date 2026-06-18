import Footer from '@/components/Footer'
import SiteNav from '@/components/SiteNav'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 60

// The Thirst desk identity
const MAGENTA = '#FF2A6D'   // the heartbeat — used sparingly
const SLATE = '#44576D'     // frosted base accent

// the honest call, set by an editor at curation (null until then)
const verdictStyles: Record<string, { label: string; color: string }> = {
  buy:  { label: 'Buy',                 color: '#1D9E75' },
  skip: { label: 'Skip',                color: '#C2607A' },
  hold: { label: 'Keep what you have',  color: SLATE },
  wait: { label: 'Wait',                color: '#E8A33D' },
}

const readerLabel: Record<string, string> = {
  adopter:   'For the adopter',
  stretcher: 'For the stretcher',
  both:      'For everyone',
}

function Badges({ article }: { article: any }) {
  const v = article.verdict ? verdictStyles[article.verdict] : null
  return (
    <>
      {v && (
        <span style={{
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
          padding: '2px 8px', borderRadius: '3px',
          color: v.color, border: `1px solid ${v.color}`, background: 'transparent',
        }}>{v.label}</span>
      )}
      {article.reader_mode && readerLabel[article.reader_mode] && (
        <span style={{
          fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em',
          color: 'var(--text-tertiary)',
        }}>{readerLabel[article.reader_mode]}</span>
      )}
    </>
  )
}

function Disclosure({ article }: { article: any }) {
  if (!article.has_affiliate) return null
  return (
    <div style={{
      fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.5,
      borderLeft: `2px solid ${MAGENTA}`, padding: '6px 12px', margin: '12px 0 0',
    }}>
      Contains affiliate links — they never change what we recommend, and never fund our other desks.
    </div>
  )
}

export default async function TheThirstPage() {
  const { data: articles } = await supabase
    .from('thirst_articles')
    .select('*')
    .eq('status', 'approved')
    .order('published_at', { ascending: false })

  const featured = articles?.find(a => a.featured)
  const secondary = articles?.filter(a => !a.featured).slice(0, 99)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', overflow: 'clip' }}>

      <SiteNav current="thirst" />

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '40px 40px 24px' }}>
        <div style={{
          fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.6,
          padding: '16px 20px', borderLeft: `2px solid ${MAGENTA}`, marginBottom: '40px',
        }}>
          Thirst traps for the buy curious.
        </div>
      </div>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 40px 80px', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 23px, rgba(68, 87, 109, 0.04) 23px, rgba(68, 87, 109, 0.04) 24px)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {featured && (
            <article style={{ marginBottom: '48px' }}>
              {featured.image_url && (
                <div style={{ marginBottom: '24px' }}>
                  <img src={featured.image_url} alt={featured.title} style={{
                    width: '100%', height: '439px', objectFit: 'cover',
                    objectPosition: 'center', borderRadius: '4px', display: 'block',
                  }} />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '11px', color: MAGENTA, fontWeight: 500, letterSpacing: '0.06em' }}>
                  {featured.category}
                </div>
                <Badges article={featured} />
              </div>
              <h1 style={{
                fontFamily: 'var(--font-serif)', fontSize: '34px', fontWeight: 500,
                lineHeight: 1.25, marginBottom: '18px', maxWidth: '600px',
              }}>
                <a href={featured.source_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none', borderBottom: '0.5px solid var(--border)' }}>
                  {featured.title}
                </a>
              </h1>
              <p style={{
                fontSize: '15px', color: 'var(--text-secondary)',
                lineHeight: 1.85, maxWidth: '560px', marginBottom: '14px',
              }}>{featured.summary}</p>
              <a href={featured.source_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '12px', color: MAGENTA, textDecoration: 'none', letterSpacing: '0.04em' }}>
                {featured.source_name} →
              </a>
              <Disclosure article={featured} />
            </article>
          )}

          {featured && <div style={{ borderTop: '0.5px solid var(--border)', marginBottom: '36px' }} />}

          {(!articles || articles.length === 0) && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>
              The Thirst opens soon.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {secondary?.map(article => (
              <article key={article.id}>
                {article.image_url && (
                  <div style={{ marginBottom: '16px' }}>
                    <img src={article.image_url} alt={article.title} style={{
                      width: '100%', height: '220px', objectFit: 'cover',
                      objectPosition: 'center', borderRadius: '4px', display: 'block',
                    }} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '11px', color: MAGENTA, fontWeight: 500, letterSpacing: '0.06em' }}>
                    {article.category}
                  </div>
                  <Badges article={article} />
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 500,
                  lineHeight: 1.35, marginBottom: '10px',
                }}>
                  <a href={article.source_url} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none', borderBottom: '0.5px solid var(--border)' }}>
                    {article.title}
                  </a>
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '10px' }}>
                  {article.summary}
                </p>
                <a href={article.source_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '11px', color: MAGENTA, textDecoration: 'none', letterSpacing: '0.04em' }}>
                  {article.source_name} →
                </a>
                <Disclosure article={article} />
              </article>
            ))}
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}
