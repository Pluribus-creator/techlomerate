import { supabase } from '@/lib/supabase'

export const revalidate = 60

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
  const secondary = articles?.filter(a => !a.featured).slice(0, 2)

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

      <div style={{ height: "2px", background: "var(--teal-400)" }} />

      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 40px",
        borderBottom: "0.5px solid var(--border-teal)",
      }}>
        <span style={{
          fontFamily: "var(--font-serif)",
          fontSize: "20px",
          fontWeight: 500,
          letterSpacing: "0.03em",
        }}>Techlomerate</span>
        <span style={{
          fontSize: "12px",
          color: "var(--text-tertiary)",
          letterSpacing: "0.05em",
        }}>{today}</span>
      </nav>

      <div style={{
        background: "var(--teal-50)",
        borderBottom: "0.5px solid var(--border-teal)",
        height: "82px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0,
          background: "var(--teal-100)", color: "var(--teal-600)",
          fontSize: "11px", fontWeight: 500,
          padding: "3px 8px", letterSpacing: "0.06em",
        }}>AD</div>
        <div style={{
          position: "absolute", top: 0, right: 0,
          background: "var(--teal-100)", color: "var(--teal-600)",
          fontSize: "11px", fontWeight: 500,
          padding: "3px 8px", letterSpacing: "0.06em",
        }}>AD</div>
        <span style={{
          color: "var(--text-tertiary)",
          fontSize: "12px",
          letterSpacing: "0.08em",
          fontStyle: "italic",
        }}>patron · this space intentional</span>
      </div>

      <div style={{
        maxWidth: "780px",
        margin: "0 auto",
        padding: "52px 40px 80px",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 23px, rgba(29, 158, 117, 0.04) 23px, rgba(29, 158, 117, 0.04) 24px)",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>

          {featured && (
            <article style={{ marginBottom: "48px" }}>
              <div style={{
                fontSize: "11px", color: "var(--teal-600)", fontWeight: 500,
                letterSpacing: "0.06em", marginBottom: "14px",
              }}>{featured.category}</div>
              <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "34px", fontWeight: 500,
                lineHeight: 1.25, marginBottom: "18px", maxWidth: "600px",
              }}>{featured.title}</h1>
              <p style={{
                fontSize: "15px", color: "var(--text-secondary)",
                lineHeight: 1.85, maxWidth: "560px",
              }}>{featured.summary}</p>
            </article>
          )}

          <div style={{ borderTop: "0.5px solid var(--border)", marginBottom: "36px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
            {secondary?.map(article => (
              <article key={article.id}>
                <div style={{
                  fontSize: "11px", color: "var(--teal-600)", fontWeight: 500,
                  letterSpacing: "0.06em", marginBottom: "10px",
                }}>{article.category}</div>
                <h2 style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "17px", fontWeight: 500,
                  lineHeight: 1.4, marginBottom: "8px",
                }}>{article.title}</h2>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.75 }}>
                  {article.summary}
                </p>
              </article>
            ))}
          </div>

        </div>
      </div>
    </main>
  )
}
