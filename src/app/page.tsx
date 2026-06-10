import { supabase } from '@/lib/supabase'

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

export default async function Home() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'approved')
    .order('published_at', { ascending: false })

  const featured = articles?.find(a => a.featured)
  const secondary = articles?.filter(a => !a.featured).slice(0, 99)

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", overflow: "clip" }}>

      <div style={{ height: "2px", background: "var(--teal-400)" }} />

      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 40px",
        borderBottom: "0.5px solid var(--border-teal)",
        position: "sticky",
        top: 0,
        zIndex: 99,
        background: "var(--bg)",
      }}>
        <span style={{
          fontFamily: "var(--font-serif)",
          fontSize: "20px",
          fontWeight: 500,
          letterSpacing: "0.03em",
        }}>Techlomerate (tek-lom-uh-RAH-tee)</span>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <a href="/the-old-market" style={{
            fontSize: "12px", color: "var(--teal-600)", textDecoration: "none",
            letterSpacing: "0.04em", fontWeight: 500,
          }}>The Old Market</a>
          <a href="/one-recursive-loop" style={{ fontSize: "12px", textDecoration: "none", letterSpacing: "0.04em", fontWeight: 500 }}>
            <span style={{ color: "#F25430" }}>One</span>
            {" "}
            <span style={{ color: "#4A90E2" }}>Recursive</span>
            {" "}
            <span style={{ color: "#9013FE" }}>Loop</span>
          </a>
          <a href="/about" style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "none", letterSpacing: "0.04em" }}>About</a>
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>{today}</span>
        </div>
      </nav>

      <a
        href="https://www.apple.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block", position: "relative", overflow: "hidden",
          borderBottom: "0.5px solid var(--border-teal)", textDecoration: "none",
        }}
      >
        
        <img src="/assets/applemothershipad.png" alt="Apple" style={{
          width: "100%", height: "280px", objectFit: "cover",
          objectPosition: "center 60%", display: "block",
        }} />
      </a>

      <div style={{
        maxWidth: "780px",
        margin: "0 auto",
        padding: "52px 40px 80px",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 23px, rgba(29, 158, 117, 0.04) 23px, rgba(29, 158, 117, 0.04) 24px)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>

          {featured && (
            <article style={{ marginBottom: "48px" }}>
              {featured.image_url && (
                <div style={{ marginBottom: "24px" }}>
                  <a href={`/articles/${slugify(featured.title)}`}>
                    <img src={featured.image_url} alt={featured.title} style={{
                      width: "100%", height: "420px", objectFit: "cover",
                      objectPosition: "center", borderRadius: "4px", display: "block",
                    }} />
                  </a>
                </div>
              )}
              <div style={{
                fontSize: "11px", color: "var(--teal-600)", fontWeight: 500,
                letterSpacing: "0.06em", marginBottom: "14px",
              }}>{featured.category}</div>
              <h1 style={{
                fontFamily: "var(--font-serif)", fontSize: "34px", fontWeight: 500,
                lineHeight: 1.25, marginBottom: "18px", maxWidth: "600px",
              }}>
                <a href={`/articles/${slugify(featured.title)}`}
                  style={{ color: "inherit", textDecoration: "none", borderBottom: "0.5px solid var(--border)" }}>
                  {featured.title}
                </a>
              </h1>
              <p style={{
                fontSize: "15px", color: "var(--text-secondary)",
                lineHeight: 1.85, maxWidth: "560px", marginBottom: "14px",
              }}>{featured.summary}</p>
              <a href={featured.source_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "12px", color: "var(--teal-600)", textDecoration: "none", letterSpacing: "0.04em" }}>
                {featured.source_name} →
              </a>
            </article>
          )}

          <div style={{ borderTop: "0.5px solid var(--border)", marginBottom: "36px" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {secondary?.map(article => (
              <article key={article.id}>
                {article.image_url && (
                  <div style={{ marginBottom: "16px" }}>
                    <a href={`/articles/${slugify(article.title)}`}>
                      <img src={article.image_url} alt={article.title} style={{
                        width: "100%", height: "220px", objectFit: "cover",
                        objectPosition: "center", borderRadius: "4px", display: "block",
                      }} />
                    </a>
                  </div>
                )}
                <div style={{
                  fontSize: "11px", color: "var(--teal-600)", fontWeight: 500,
                  letterSpacing: "0.06em", marginBottom: "10px",
                }}>{article.category}</div>
                <h2 style={{
                  fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: 500,
                  lineHeight: 1.35, marginBottom: "10px",
                }}>
                  <a href={`/articles/${slugify(article.title)}`}
                    style={{ color: "inherit", textDecoration: "none", borderBottom: "0.5px solid var(--border)" }}>
                    {article.title}
                  </a>
                </h2>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "10px" }}>
                  {article.summary}
                </p>
                <a href={article.source_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "11px", color: "var(--teal-600)", textDecoration: "none", letterSpacing: "0.04em" }}>
                  {article.source_name} →
                </a>
              </article>
            ))}
          </div>

        </div>
      </div>
    </main>
  )
}
