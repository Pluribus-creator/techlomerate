import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

export default async function OldMarketPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const { data: articles } = await supabase
    .from('market_articles')
    .select('*')
    .eq('status', 'approved')
    .order('published_at', { ascending: false })

  const featured = articles?.find(a => a.featured)
  const secondary = articles?.filter(a => !a.featured).slice(0, 99)

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", overflow: "clip" }}>

      <div style={{ height: "2px", background: "var(--teal-400)" }} />

      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 40px", borderBottom: "0.5px solid var(--border-teal)",
        position: "sticky", top: 0, zIndex: 99, background: "var(--bg)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <a href="/" style={{
            fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: 500,
            letterSpacing: "0.03em", color: "var(--fg)", textDecoration: "none",
          }}>Techlomerate</a>
          <span style={{ color: "var(--text-tertiary)", fontSize: "16px" }}>·</span>
          <span style={{
            fontFamily: "var(--font-serif)", fontSize: "18px", fontWeight: 500,
            color: "var(--teal-600)", letterSpacing: "0.03em",
          }}>The Old Market</span>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <a href="/about" style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "none", letterSpacing: "0.04em" }}>About</a>
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>{today}</span>
        </div>
      </nav>

      <a href="https://www.apple.com" target="_blank" rel="noopener noreferrer" style={{
        display: "block", position: "relative,
        borderBottom: "0.5px solid var(--border-teal)", textDecoration: "none",
      }}>
       
        <img src="/assets/applemothershipad.png" alt="Apple" style={{
          width: "100%", height: "280px", objectFit: "cover",
          objectPosition: "center 60%", display: "block",
        }} />
      </a>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "40px 40px 24px" }}>
        <div style={{
          fontSize: "12px", color: "var(--text-tertiary)", lineHeight: 1.6,
          padding: "16px 20px", borderLeft: "2px solid var(--teal-400)", marginBottom: "40px",
        }}>
          News and analysis of AI and technology markets. Not financial advice. Published every weekday.
          
        </div>
      </div>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 40px 80px", position: "relative" }}>
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
                  <img src={featured.image_url} alt={featured.title} style={{
                    width: "100%", height: "420px", objectFit: "cover",
                    objectPosition: "center", borderRadius: "4px", display: "block",
                  }} />
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", color: "var(--teal-600)", fontWeight: 500, letterSpacing: "0.06em" }}>
                  {featured.category}
                </div>
                {featured.ticker && (
                  <div style={{
                    fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em",
                    padding: "2px 8px", borderRadius: "4px", color: "#fff",
                    background: "linear-gradient(90deg, #FF6B6B, #FFB347, #FFD700, #5BC8F5, #9B59B6)",
                  }}>{featured.ticker}</div>
                )}
              </div>
              <h1 style={{
                fontFamily: "var(--font-serif)", fontSize: "34px", fontWeight: 500,
                lineHeight: 1.25, marginBottom: "18px", maxWidth: "600px",
              }}>
                <a href={featured.source_url} target="_blank" rel="noopener noreferrer"
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

          {featured && <div style={{ borderTop: "0.5px solid var(--border)", marginBottom: "36px" }} />}

          {(!articles || articles.length === 0) && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-tertiary)", fontSize: "14px" }}>
              The Old Market opens soon.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {secondary?.map(article => (
              <article key={article.id}>
                {article.image_url && (
                  <div style={{ marginBottom: "16px" }}>
                    <img src={article.image_url} alt={article.title} style={{
                      width: "100%", height: "220px", objectFit: "cover",
                      objectPosition: "center", borderRadius: "4px", display: "block",
                    }} />
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                  <div style={{ fontSize: "11px", color: "var(--teal-600)", fontWeight: 500, letterSpacing: "0.06em" }}>
                    {article.category}
                  </div>
                  {article.ticker && (
                    <div style={{
                      fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em",
                      padding: "2px 8px", borderRadius: "4px", color: "#fff",
                      background: "linear-gradient(90deg, #FF6B6B, #FFB347, #FFD700, #5BC8F5, #9B59B6)",
                    }}>{article.ticker}</div>
                  )}
                </div>
                <h2 style={{
                  fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: 500,
                  lineHeight: 1.35, marginBottom: "10px",
                }}>
                  <a href={article.source_url} target="_blank" rel="noopener noreferrer"
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
