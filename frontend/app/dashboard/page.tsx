import Link from "next/link";
import Header from "../../components/Header";

const FEATURES = [
  {
    title: "Last Night Mode",
    desc:  "Input subject + time left. Get a compressed study plan, ranked topics, and a quick quiz.",
    href:  "/last-night",
    color: "var(--purple)",
    dim:   "var(--purple-dim)",
    tag:   "PANIC MODE",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
  },
  {
    title: "Analogy Generator",
    desc:  "Can't understand a concept? Get real-life analogies that make it click instantly.",
    href:  "/analogy",
    color: "var(--blue)",
    dim:   "var(--blue-dim)",
    tag:   "UNDERSTAND",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
      </svg>
    ),
  },
  {
    title: "Reality Mode",
    desc:  "Track planned vs actual study time. Get an honest performance prediction and recovery plan.",
    href:  "/reality",
    color: "var(--green)",
    dim:   "var(--green-dim)",
    tag:   "TRACK",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    title: "Skill → Income",
    desc:  "Turn your skills into income. Get a 7-day execution plan tailored to your level.",
    href:  "/skill-income",
    color: "var(--amber)",
    dim:   "var(--amber-dim)",
    tag:   "EARN",
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
];

export default function DashboardPage() {
  return (
    <div className="page-wrap">
      <Header />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── Page heading ── */}
        <div style={{ marginBottom: 40 }}>
          <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 12 }}>
            DASHBOARD
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, marginBottom: 10 }}>
            What do you need today?
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15 }}>
            Choose a tool and AURORA gets to work immediately.
          </p>
        </div>

        {/* ── Emergency banner ── */}
        <Link href="/last-night" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--purple)", borderRadius: "var(--radius-xl)",
          padding: "28px 32px", textDecoration: "none",
          marginBottom: 28, gap: 16, transition: "opacity 0.2s",
        }}>
          <div>
            <p className="section-label" style={{ color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
              EMERGENCY ACCESS
            </p>
            <h2 style={{ fontWeight: 800, fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", color: "white", marginBottom: 4 }}>
              Exam Tomorrow?
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
              Get your survival plan in under 10 seconds
            </p>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,0.14)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </Link>

        {/* ── Feature cards grid ── */}
        <div className="grid-2" style={{ gap: 14 }}>
          {FEATURES.map((f) => (
            <Link key={f.title} href={f.href} style={{
              display: "block",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)", padding: "26px",
              textDecoration: "none", transition: "border-color 0.2s, transform 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 11,
                  background: f.dim, color: f.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {f.icon}
                </div>
                <span className="tag-badge" style={{ background: f.dim, color: f.color }}>
                  {f.tag}
                </span>
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginBottom: 8, color: "var(--text-1)" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 18 }}>
                {f.desc}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: f.color, fontFamily: "var(--font-display)" }}>
                Open
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}