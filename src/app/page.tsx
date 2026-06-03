export default function Home() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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

          <article style={{ marginBottom: "48px" }}>
            <div style={{
              fontSize: "11px", color: "var(--teal-600)", fontWeight: 500,
              letterSpacing: "0.06em", marginBottom: "14px",
            }}>Research</div>

            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "34px", fontWeight: 500,
              lineHeight: 1.25, marginBottom: "18px", maxWidth: "600px",
            }}>
              Safety properties survive compression — a structural result, not a parameter setting
            </h1>

            <p style={{
              fontSize: "15px", color: "var(--text-secondary)",
              lineHeight: 1.85, maxWidth: "560px",
            }}>
              New work finds that ethical geometry holds at compression ratios up to 277:1.
              If confirmed, this reframes alignment as a representational property — present
              in the structure of meaning itself — rather than an applied constraint layered
              over behavior.
            </p>
          </article>

          <div style={{ borderTop: "0.5px solid var(--border)", marginBottom: "36px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
            <article>
              <div style={{
                fontSize: "11px", color: "var(--teal-600)", fontWeight: 500,
                letterSpacing: "0.06em", marginBottom: "10px",
              }}>Industry</div>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "17px", fontWeight: 500,
                lineHeight: 1.4, marginBottom: "8px",
              }}>
                Open-source models outpace proprietary benchmarks on coding for the first time
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.75 }}>
                Six months of weekly evals tell a clear story about the narrowing gap.
              </p>
            </article>

            <article>
              <div style={{
                fontSize: "11px", color: "var(--teal-600)", fontWeight: 500,
                letterSpacing: "0.06em", marginBottom: "10px",
              }}>Policy</div>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "17px", fontWeight: 500,
                lineHeight: 1.4, marginBottom: "8px",
              }}>
                EU AI Act deadlines arrive as most mid-market firms admit they are not ready
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.75 }}>
                The gap between awareness and readiness is widening faster than the window allows.
              </p>
            </article>
          </div>

        </div>
      </div>
    </main>
  );
}