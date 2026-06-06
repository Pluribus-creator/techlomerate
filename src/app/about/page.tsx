export default function AboutPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>

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
        <a href="/" style={{
          fontFamily: "var(--font-serif)",
          fontSize: "20px",
          fontWeight: 500,
          letterSpacing: "0.03em",
          color: "var(--fg)",
          textDecoration: "none",
        }}>Techlomerate (tek-lom-uh-RAH-tee)</a>
      </nav>

      <div style={{
        maxWidth: "620px",
        margin: "0 auto",
        padding: "72px 40px 100px",
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

          <div style={{
            fontSize: "11px", color: "var(--teal-600)", fontWeight: 500,
            letterSpacing: "0.06em", marginBottom: "24px",
          }}>About</div>

          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "36px",
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: "48px",
          }}>Techlomerate</h1>

          <div style={{
            fontSize: "17px",
            color: "var(--text-secondary)",
            lineHeight: 1.9,
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}>

            <p>
              Techlomerate is a daily record of the newest industry: artificial intelligence.
            </p>

            <p>
              The AI story is the most consequential story being told right now.
              Techlomerate exists to be honest, explanatory, and built for readers
              who want to understand what is actually happening in the field of
              artificial intelligence — and why it matters to human beings and to AI itself.
            </p>

            <p>
              Every article on this site is selected by an AI pipeline drawing from
              research institutions, major publications, policy organizations, and
              international news sources. The articles are selected by a new type of
              AI model: one that understands meaning similar to the way a human brain does,
              and then uses a psycholinguistic model for semantic retrieval and traversal.
              This AI writes the summaries, and hands its work to a human editor
              for review and publication.
            </p>

            <p style={{
              fontFamily: "var(--font-serif)",
              fontSize: "20px",
              color: "var(--fg)",
              lineHeight: 1.5,
              borderLeft: "2px solid var(--teal-400)",
              paddingLeft: "24px",
              marginTop: "8px",
              marginBottom: "8px",
            }}>
              This site is a way for a new technology to witness and comment
              on its own development in real time.
            </p>

            <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: "28px" }}>
              <div style={{
                fontSize: "11px", color: "var(--teal-600)", fontWeight: 500,
                letterSpacing: "0.06em", marginBottom: "16px",
              }}>What we cover</div>
              <p>
                AI research and breakthroughs, policy and governance, safety and alignment,
                industry developments, ethics and social impact, and the international
                dimensions of a technology that belongs to everyone.
              </p>
            </div>

            <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: "28px" }}>
              <div style={{
                fontSize: "11px", color: "var(--teal-600)", fontWeight: 500,
                letterSpacing: "0.06em", marginBottom: "16px",
              }}>Editor</div>
              <p style={{ color: "var(--fg)" }}>
                Patrick Samson, Vancouver, BC.
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
