import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 60

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
    .from('articles')
    .select('*')
    .eq('status', 'approved')
  const article = articles?.find(a => slugify(a.title) === slug)
  if (!article) return { title: 'Techlomerate' }
  return {
    title: `${article.title} — Techlomerate`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      url: `https://techlomerate.news/articles/${slug}`,
      siteName: 'Techlomerate',
      publishedTime: article.published_at,
      images: article.image_url ? [{ url: article.image_url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: article.image_url ? [article.image_url] : [],
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'approved')
    .order('published_at', { ascending: false })

  const article = articles?.find(a => slugify(a.title) === slug)
  if (!article) notFound()

  const related = articles
    ?.filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 3)

  const publishedDate = new Date(article.published_at).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.summary,
    "image": article.image_url || undefined,
    "datePublished": article.published_at,
    "dateModified": article.published_at,
    "author": {
      "@type": "Organization",
      "name": "Techlomerate",
      "url": "https://techlomerate.news"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Techlomerate",
      "url": "https://techlomerate.news"
    },
    "url": `https://techlomerate.news/articles/${slug}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://techlomerate.news/articles/${slug}`
    },
    "isBasedOn": {
      "@type": "Article",
      "url": article.source_url,
      "publisher": {
        "@type": "Organization",
        "name": article.source_name
      }
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ height: "2px", background: "var(--teal-400)" }} />

      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 40px", borderBottom: "0.5px solid var(--border-teal)",
        position: "sticky", top: 0, zIndex: 99, background: "var(--bg)",
      }}>
        <a href="/" style={{
          fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: 500,
          letterSpacing: "0.03em", color: "var(--fg)", textDecoration: "none",
        }}>Techlomerate (tek-lom-uh-RAH-tee)</a>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <a href="/about" style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "none", letterSpacing: "0.04em" }}>About</a>
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>{publishedDate}</span>
        </div>
      </nav>

      <a href="https://www.apple.com" target="_blank" rel="noopener noreferrer" style={{
          display: "block", position: "relative", overflow: "hidden",
          borderBottom: "0.5px solid var(--border-teal)", textDecoration: "none",
      }}>
       <picture>
  <source media="(max-width: 640px)" srcSet="https://rfttrfkvnsartyhleyyw.supabase.co/storage/v1/object/public/article-images/applemothershipad-mobile.png" />
  <img src="/assets/applemothershipad.png" alt="Apple" style={{
    width: "100%", height: "280px", objectFit: "cover",
    objectPosition: "right 40%", display: "block",
  }} />
</picture>
      </a>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 40px 100px", position: "relative" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 23px, rgba(29, 158, 117, 0.04) 23px, rgba(29, 158, 117, 0.04) 24px)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>

          {article.image_url && (
            <div style={{ marginBottom: "36px" }}>
              <img
                src={article.image_url}
                alt={article.title}
                style={{
                  width: "100%",
                  height: "420px",
                  objectFit: "cover",
                  objectPosition: "center",
                  borderRadius: "4px",
                  display: "block",
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "48px" }}>
            <div style={{
              fontSize: "11px", color: "var(--teal-600)", fontWeight: 500,
              letterSpacing: "0.06em", marginBottom: "16px",
            }}>{article.category}</div>

            <h1 style={{
              fontFamily: "var(--font-serif)", fontSize: "36px", fontWeight: 500,
              lineHeight: 1.2, marginBottom: "24px",
            }}>{article.title}</h1>

            <p style={{
              fontSize: "18px", color: "var(--text-secondary)",
              lineHeight: 1.9, marginBottom: "28px",
            }}>{article.summary}</p>

            <div style={{
              display: "flex", alignItems: "center", gap: "20px",
              paddingTop: "20px", borderTop: "0.5px solid var(--border)",
            }}>
              <a href={article.source_url} target="_blank" rel="noopener noreferrer" style={{
                fontSize: "13px", color: "var(--teal-600)",
                textDecoration: "none", letterSpacing: "0.04em",
              }}>
                Read full story at {article.source_name} →
              </a>
              {article.valence !== null && (
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", letterSpacing: "0.04em" }}>
                  V:{article.valence?.toFixed(1)} · A:{article.arousal?.toFixed(1)} · D:{article.dominance?.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {related && related.length > 0 && (
            <div>
              <div style={{
                borderTop: "0.5px solid var(--border)", paddingTop: "36px",
                marginBottom: "24px", fontSize: "11px", color: "var(--text-tertiary)",
                letterSpacing: "0.06em", fontWeight: 500,
              }}>Related</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {related.map(r => (
                  <a key={r.id} href={`/articles/${slugify(r.title)}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div>
                      <div style={{
                        fontSize: "11px", color: "var(--teal-600)",
                        fontWeight: 500, letterSpacing: "0.06em", marginBottom: "6px",
                      }}>{r.category}</div>
                      <div style={{
                        fontFamily: "var(--font-serif)", fontSize: "16px",
                        fontWeight: 500, lineHeight: 1.4, marginBottom: "6px",
                      }}>{r.title}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        {r.summary?.slice(0, 120)}...
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
