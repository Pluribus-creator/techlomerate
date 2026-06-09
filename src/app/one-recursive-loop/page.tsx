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

export default async function OneRecursiveLoopPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const { data: articles } = await supabase
    .from('apple_articles')
    .select('*')
    .eq('status', 'approved')
    .order('published_at', { ascending: false })

  const featured = articles?.find(a => a.featured)
  const secondary = articles?.filter(a => !a.featured).slice(0, 99)

  const rainbowStyle = {
    background: "linear-gradient(90deg, #F25430, #F5A623, #F8E71C, #7ED321, #4A90E2, #9013FE)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", overflow: "clip" }}>

      <div style={{ height: "2px", background: "linear-gradient(90deg, #F25430, #F5A623, #F8E71C, #7ED321, #4A90E2, #9013FE)", }} />

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
            letterSpacing: "0.03em", ...rainbowStyle,
          }}>One Recursive Loop</span>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <a href="/about" style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "none", letterSpacing: "0.04em" }}>About</a>
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>{today}</span>
        </div>
      </nav>

      <a href="https://www.apple.com" target="_blank" rel="noopener noreferrer" style={{
        display: "block", position: "sticky", top: "58px", zIndex: 100,
        borderBottom: "0.5px solid var(--border-teal)", textDecoration: "none",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, background: "rgba(0,0,0,0.4)",
          color: "#fff", fontSize: "11px", fontWeight: 400, padding: "3px 10px",
          letterSpacing: "0.08em", fontFamily: "var(--font-serif)", fontStyle: "italic", zIndex: 2,
        }}>broadside</div>
        <img src="/assets/applemothershipad.png" alt="Apple" style={{
          width: "100%", height: "200px", objectFit: "cover",
          objectPosition: "center 30%", display: "block",
        }} />
      </a>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "40px 40px 24px" }}>
        <div style={{
          fontSize: "12px", color: "var(--text-tertiary)", lineHeight: 1.6,
          padding: "16px 20px", borderLeft: "2px solid transparent",
          borderImage: "linear-gradient(90deg, #FF6B6B, #FFB347, #FFD700, #5BC8F5, #9B59B6) 1",
          marginBottom: "40px",
        }}>
          Apple coverage for people who think carefully about the relationship between humans and their tools.
          One Recursive Loop — because the company that built the computer keeps building computers that build computers.
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
              <div style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", marginBottom: "14px", ...rainbowStyle }}>
                {featured.category}
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
                style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "none", letterSpacing: "0.04em" }}>
                {featured.source_name} →
              </a>
            </article>
          )}

          {featured && <div style={{ borderTop: "0.5px solid var(--border)", marginBottom: "36px" }} />}

          {(!articles || articles.length === 0) && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-tertiary)", fontSize: "14px" }}>
              One Recursive Loop opens soon.
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
                <div style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", marginBottom: "10px", ...rainbowStyle }}>
                  {article.category}
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
                  style={{ fontSize: "11px", color: "var(--text-tertiary)", textDecoration: "none", letterSpacing: "0.04em" }}>
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
