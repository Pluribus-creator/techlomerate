import SiteNav from '@/components/SiteNav'
import Footer from '@/components/Footer'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 60

const MAGENTA = '#FF2A6D'
const SLATE = '#44576D'

const verdictStyles: Record<string, { label: string; color: string }> = {
  buy:  { label: 'Buy',                color: '#1D9E75' },
  skip: { label: 'Skip',               color: '#C2607A' },
  hold: { label: 'Keep what you have', color: SLATE },
  wait: { label: 'Wait',               color: '#E8A33D' },
}

const readerLabel: Record<string, string> = {
  adopter:   'For the adopter',
  stretcher: 'For the stretcher',
  both:      'For everyone',
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: articles } = await supabase
    .from('thirst_articles')
    .select('*')
    .eq('status', 'approved')
  const article = articles?.find(a => slugify(a.title) === slug)
  if (!article) return { title: 'The Thirst — Techlomerate' }
  return {
    title: `${article.title} — The Thirst`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      url: `https://techlomerate.news/the-thirst/${slug}`,
      siteName: 'Techlomerate',
      publishedTime: article.published_at,
      images: article.image_url ? [article.image_url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
    },
  }
}

export default async function ThirstArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: articles } = await supabase
    .from('thirst_articles')
    .select('*')
    .eq('status', 'approved')
    .order('published_at', { ascending: false })

  const article = articles?.find(a => slugify(a.title) === slug)
  if (!article) notFound()

  const related = articles
    ?.filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 3)

  const publishedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const verdict = article.verdict ? verdictStyles[article.verdict] : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    datePublished: article.published_at,
    image: article.image_url ? [article.image_url] : undefined,
    author: { '@type': 'Organization', name: 'The Thirst — Techlomerate' },
    publisher: { '@type': 'Organization', name: 'Techlomerate' },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://techlomerate.news/the-thirst/${slug}`,
    },
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', overflow: 'clip' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SiteNav current="thirst" />

      <article style={{ maxWidth: '720px', margin: '0 auto', padding: '52px 40px 80px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: MAGENTA, fontWeight: 500, letterSpacing: '0.06em' }}>{article.category}</span>
          {verdict && (
            <span style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
              padding: '2px 8px', borderRadius: '3px',
              color: verdict.color, border: `1px solid ${verdict.color}`,
            }}>{verdict.label}</span>
          )}
          {article.reader_mode && readerLabel[article.reader_mode] && (
            <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', color: 'var(--text-tertiary)' }}>
              {readerLabel[article.reader_mode]}
            </span>
          )}
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 500, lineHeight: 1.2, marginBottom: '14px' }}>
          {article.title}
        </h1>

        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', letterSpacing: '0.04em', marginBottom: '28px' }}>
          {publishedDate}
        </div>

        {article.image_url && (
          <div style={{ marginBottom: '32px' }}>
            <img src={article.image_url} alt={article.title} style={{ width: '100%', height: 'auto', borderRadius: '4px', display: 'block' }} />
          </div>
        )}

        {/* Our take — the original layer that makes this a hub, not a thin pointer */}
        <p style={{ fontSize: '18px', color: 'var(--fg)', lineHeight: 1.75, marginBottom: '28px' }}>
          {article.summary}
        </p>

        {article.has_affiliate && (
          <div style={{
            fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.5,
            borderLeft: `2px solid ${MAGENTA}`, padding: '6px 12px', marginBottom: '28px',
          }}>
            Contains affiliate links — they never change what we recommend, and never fund our other desks.
          </div>
        )}

        {/* Hub link-out: credit the source prominently */}
        <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '24px' }}>
          <a href={article.source_url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '14px', color: MAGENTA, textDecoration: 'none', fontWeight: 500, letterSpacing: '0.02em' }}>
            Read the full story at {article.source_name} →
          </a>
          {article.has_affiliate && article.affiliate_url && (
            <div style={{ marginTop: '12px' }}>
              <a href={article.affiliate_url} target="_blank" rel="noopener noreferrer sponsored"
                style={{ fontSize: '14px', color: SLATE, textDecoration: 'none', fontWeight: 500 }}>
                Check current price →
              </a>
            </div>
          )}
        </div>

        {related && related.length > 0 && (
          <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '36px', marginTop: '48px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '24px' }}>
              MORE FROM THE THIRST
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {related.map(r => (
                <a key={r.id} href={`/the-thirst/${slugify(r.title)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontSize: '11px', color: MAGENTA, fontWeight: 500, letterSpacing: '0.06em', marginBottom: '6px' }}>{r.category}</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 500, lineHeight: 1.4, marginBottom: '6px' }}>{r.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.summary?.slice(0, 120)}...</div>
                </a>
              ))}
            </div>
          </div>
        )}

      </article>
      <Footer />
    </main>
  )
}
