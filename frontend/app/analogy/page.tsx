"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { apiPost } from "../../lib/api";
import { isLoggedIn } from "../../lib/auth";

// ── Types ───────────────────────────────────────────────────
interface Analogy { title: string; scenario: string; explanation: string; memorable_line: string; }
interface APIResult {
  topic: string; subject: string; simple_definition: string;
  analogies: Analogy[]; common_mistakes: string[]; exam_tip: string;
}

// ── Inline SVG icons ─────────────────────────────────────────
const IconBrain = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.7-4.46 2.5 2.5 0 0 1-1.03-4.2 2.5 2.5 0 0 1 4.19-4.38z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.7-4.46 2.5 2.5 0 0 0 1.03-4.2 2.5 2.5 0 0 0-4.19-4.38z"/>
  </svg>
);
const IconBook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const IconBulb = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>
);
const IconStar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────
export default function AnalogyPage() {
  const [topic,     setTopic]     = useState("");
  const [subject,   setSubject]   = useState("");
  const [mode,      setMode]      = useState<"funny" | "story" | "teacher" | "savage">("teacher");
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<APIResult | null>(null);
  const [error,     setError]     = useState("");
  const [coinError, setCoinError] = useState("");

  // ── Auth guard (runs first) ───────────────────────────────
  useEffect(() => {
    if (!isLoggedIn()) window.location.href = "/login";
  }, []);

  // ── API call ──────────────────────────────────────────────
  const generate = async () => {
    if (!topic.trim() || !subject.trim()) return;
    setCoinError("");
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await apiPost<APIResult>("/api/analogy/generate", { topic, subject, mode });
      setResult(data);
      // Deduct coins for premium modes AFTER successful generation
      if (mode !== "teacher") {
        try {
          await apiPost("/api/coins/spend", {
            amount: 15,
            reason: `Premium analogy mode: ${mode}`,
          });
        } catch {
          setCoinError("⚠️ Could not deduct coins — you may not have enough balance.");
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to connect to AURORA");
    } finally { setLoading(false); }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="page-wrap">
      <Header />

      <main className="page-content">

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <span className="tag-badge" style={{ background: "var(--blue-dim)", color: "var(--blue)", marginBottom: 16, display: "inline-flex" }}>
            <IconBrain/> Analogy Generator
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 800, marginBottom: 12 }}>
            Can&apos;t understand it?<br />
            <span style={{ color: "var(--blue)" }}>Let&apos;s make it click.</span>
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15, maxWidth: 460 }}>
            AURORA converts complex concepts into real-life analogies you&apos;ll never forget.
          </p>
        </div>

        {/* ── Input card ── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div>
              <label className="field-label">Concept you don&apos;t understand</label>
              <input className="text-input" placeholder="e.g. Entropy"
                value={topic} onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()} />
            </div>
            <div>
              <label className="field-label">Subject</label>
              <input className="text-input" placeholder="e.g. Thermodynamics"
                value={subject} onChange={(e) => setSubject(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()} />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="field-label">Analogy Mode</label>
            {mode !== "teacher" && (
              <p style={{ fontSize: 12, color: "var(--amber)", marginBottom: 8 }}>
                ⚡ Premium mode — costs 15 coins after generation
              </p>
            )}
            <select
              className="text-input"
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
              style={{ cursor: "pointer" }}
            >
              <option value="teacher">Teacher-style (Free)</option>
              <option value="funny">Funny 😂 (15 coins)</option>
              <option value="story">Story-based 📖 (15 coins)</option>
              <option value="savage">Savage 💀 (15 coins)</option>
            </select>
          </div>
          <button className="btn" onClick={generate}
            disabled={loading || !topic.trim() || !subject.trim()}
            style={{ background: "var(--blue)" }}>
            {loading
              ? <><span className="spin"/> Building analogy...</>
              : <><IconBrain/> Make It Click</>}
          </button>
        </div>

        {/* Errors */}
        {error     && <div className="error-box">{error}</div>}
        {coinError && <div style={{ background: "var(--amber-dim)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "var(--radius-md)", padding: "12px 16px", color: "var(--amber)", fontSize: 13, marginBottom: 16 }}>{coinError}</div>}

        {/* ── Results ── */}
        {result && (
          <div className="results-appear" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Simple definition */}
            <div style={{
              background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.18)",
              borderRadius: "var(--radius-xl)", padding: "22px 26px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--blue-dim)", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconBook/>
                </div>
                <span className="section-label" style={{ color: "var(--blue)" }}>SIMPLE DEFINITION</span>
              </div>
              <p style={{ fontSize: 18, fontWeight: 500, color: "var(--text-1)", lineHeight: 1.55 }}>
                {result.simple_definition}
              </p>
            </div>

            {/* Analogies */}
            {result.analogies.map((a, i) => (
              <div key={i} className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--blue-dim)", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconBulb/>
                  </div>
                  <span className="section-label" style={{ color: "var(--blue)" }}>ANALOGY {i + 1}</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, marginBottom: 18, color: "var(--text-1)" }}>
                  {a.title}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Scenario */}
                  <div className="row-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <span className="section-label" style={{ color: "var(--text-3)", marginBottom: 8 }}>THE SCENARIO</span>
                    <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65 }}>{a.scenario}</p>
                  </div>

                  {/* How it connects */}
                  <div className="row-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <span className="section-label" style={{ color: "var(--text-3)", marginBottom: 8 }}>HOW IT CONNECTS</span>
                    <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65 }}>{a.explanation}</p>
                  </div>

                  {/* Remember this */}
                  <div style={{
                    background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)",
                    borderRadius: "var(--radius-md)", padding: "15px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ color: "var(--blue)" }}><IconStar/></span>
                      <span className="section-label" style={{ color: "var(--blue)" }}>REMEMBER THIS</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", lineHeight: 1.5, fontStyle: "italic" }}>
                      &quot;{a.memorable_line}&quot;
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Common mistakes */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--red-dim)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconAlert/>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Common Mistakes</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.common_mistakes.map((m, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, padding: "13px 15px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.18)",
                  }}>
                    <span style={{ color: "var(--red)", fontWeight: 700, flexShrink: 0 }}>✕</span>
                    <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>{m}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam tip */}
            <div style={{
              background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.22)",
              borderRadius: "var(--radius-xl)", padding: "22px 26px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <span style={{ color: "var(--green)" }}><IconStar/></span>
                <span className="section-label" style={{ color: "var(--green)" }}>EXAM TIP</span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.65 }}>{result.exam_tip}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}