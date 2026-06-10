export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{
      borderTop: "0.5px solid var(--border-teal)",
      background: "var(--bg)",
      padding: "40px",
    }}>
      <div style={{
        maxWidth: "780px",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{
            fontFamily: "var(--font-serif)", fontSize: "16px", fontWeight: 500,
            letterSpacing: "0.03em", color: "var(--fg)",
          }}>Techlomerate</span>
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)", letterSpacing: "0.03em" }}>
            A daily record of artificial intelligence. Vancouver, BC.
          </span>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          <a href="/about" style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "none", letterSpacing: "0.04em" }}>About</a>
          <a href="/contact" style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "none", letterSpacing: "0.04em" }}>Contact</a>
          <a href="/privacy" style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "none", letterSpacing: "0.04em" }}>Privacy</a>
          <a href="/the-old-market" style={{ fontSize: "12px", color: "var(--teal-600)", textDecoration: "none", letterSpacing: "0.04em" }}>The Old Market</a>
          <a href="/one-recursive-loop" style={{ fontSize: "12px", textDecoration: "none", letterSpacing: "0.04em" }}>
            <span style={{ color: "#F25430" }}>One</span>{" "}
            <span style={{ color: "#4A90E2" }}>Recursive</span>{" "}
            <span style={{ color: "#9013FE" }}>Loop</span>
          </a>
        </div>
      </div>
      <div style={{
        maxWidth: "780px", margin: "24px auto 0", paddingTop: "20px",
        borderTop: "0.5px solid var(--border)",
        fontSize: "11px", color: "var(--text-tertiary)", letterSpacing: "0.03em",
      }}>
        © {year} Techlomerate. Edited by Patrick Samson.
      </div>
    </footer>
  )
}
