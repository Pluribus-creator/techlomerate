import Footer from '@/components/Footer'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORY_COLORS: Record<string, string> = {
  Humanoids: "#E8A33D",
  Industrial: "#C77B30",
  Research: "#4A90E2",
  Labor: "#B5651D",
  Embodiment: "#D4A24E",
  Policy: "#6B7A8F",
}

type Article = {
  id: string
  title: string
  summary: string
  category: string
  source_url: string
  source_name: string
  featured: boolean
  image_url: string | null
  published_at: string
}

export default async function DefinitelyNotSkynet() {
  const { data: articles } = await supabase
    .from('robotics_articles')
    .select('*')
    .eq('status', 'approved')
    .order('published_at', { ascending: false })

  const featured = articles?.find((a: Article) => a.featured) || articles?.[0]
  const secondary = articles?.filter((a: Article) => a.id !== featured?.id).slice(0, 99) || []

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

      <div style={{ height: "2px", background: "#E8A33D" }} />

      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 40px", borderBottom: "0.5px solid #E8A33D",
        position: "sticky", top: 0, zIndex: 99, background: "var(--bg)", flexWrap: "wrap", gap: "10px",
      }}>
        <a href="/" style={{
          fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: 500,
          letterSpacing: "0.03em", color: "var(--fg)", textDecoration: "none",
        }}>Techlomerate</a>
        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          <a href="/the-old-market" style={{ fontSize: "12px", color: "var(--teal-600)", textDecoration: "none", letterSpacing: "0.04em" }}>The Old Market</a>
          <a href="/one-recursive-loop" style={{ fontSize: "12px", textDecoration: "none", letterSpacing: "0.04em" }}>
            <span style={{ color: "#F25430" }}>One</span>{" "}
            <span style={{ color: "#4A90E2" }}>Recursive</span>{" "}
            <span style={{ color: "#9013FE" }}>Loop</span>
          </a>
          <a href="/about" style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "none", letterSpacing: "0.04em" }}>About</a>
        </div>
      </nav>

      {/* Masthead */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "56px 40px 32px", textAlign: "center" }}>
        <h1 style={{
          fontFamily: "var(--font-serif)", fontSize: "44px", fontWeight: 500,
          letterSpacing: "0.02em", color: "var(--fg)", marginBottom: "10px", lineHeight: 1.1,
        }}>
          Definitely Not Skynet
        </h1>
        <p style={{
          fontSize: "13px", color: "#C77B30", letterSpacing: "0.08em",
          textTransform: "uppercase", fontWeight: 500, marginBottom: "16px",
        }}>
          The Body Electric
        </p>
        <p style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "16px",
          color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "560px", margin: "0 auto",
        }}>
          Intelligence is leaving the screen and entering the world. A record of the machines
          that move, lift, walk, and work — and the human stakes of all of it.
        </p>
      </div>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 40px 80px" }}>

        {/* Featured */}
        {featured && (
          <a href={featured.source_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit", display: "block", marginBottom: "56px" }}>
            {featured.image_url && (
              <div style={{ marginBottom: "20px", borderRadius: "4px", overflow: "hidden" }}>
                <img src={featured.image_url} alt={featured.title} style={{
                  width: "100%", height: "439px", objectFit: "cover", display: "block",
                }} />
              </div>
            )}
            <div style={{
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              color: CATEGORY_COLORS[featured.category] || "#E8A33D", marginBottom: "12px",
            }}>
              {featured.category}
            </div>
            <h2 style={{
              fontFamily: "var(--font-serif)", fontSize: "34px", fontWeight: 500,
              lineHeight: 1.15, marginBottom: "14px", color: "var(--fg)",
            }}>
              {featured.title}
            </h2>
            <p style={{ fontSize: "17px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {featured.summary}
            </p>
          </a>
        )}

        {/* Secondary list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {secondary.map((article: Article) => (
            <a key={article.id} href={article.source_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit", display: "block", borderTop: "0.5px solid var(--border)", paddingTop: "32px" }}>
              {article.image_url && (
                <div style={{ marginBottom: "16px", borderRadius: "4px", overflow: "hidden" }}>
                  <img src={article.image_url} alt={article.title} style={{
                    width: "100%", height: "220px", objectFit: "cover", objectPosition: "center 30%", display: "block",
                  }} />
                </div>
              )}
              <div style={{
                fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                color: CATEGORY_COLORS[article.category] || "#E8A33D", marginBottom: "10px",
              }}>
                {article.category}
              </div>
              <h3 style={{
                fontFamily: "var(--font-serif)", fontSize: "24px", fontWeight: 500,
                lineHeight: 1.2, marginBottom: "10px", color: "var(--fg)",
              }}>
                {article.title}
              </h3>
              <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                {article.summary}
              </p>
            </a>
          ))}
        </div>

        {(!articles || articles.length === 0) && (
          <p style={{ fontSize: "16px", color: "var(--text-tertiary)", textAlign: "center", padding: "60px 0" }}>
            The first dispatches are being prepared.
          </p>
        )}

      </div>

      <Footer />
    </main>
  )
}
