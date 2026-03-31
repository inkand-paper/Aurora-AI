"use client";
import { useState } from "react";
import Header from "../../components/Header";
import { apiPost } from "../../lib/api";
import { isLoggedIn } from "../../lib/auth";
import { useEffect } from "react";

// ── Types ───────────────────────────────────────────────────
interface Topic    { topic: string; importance: string; time_allocation: string; why: string; }
interface StudySlot{ time_slot: string; activity: string; tip: string; }
interface QuizItem { question: string; answer: string; }
interface APIResult{
  subject: string; hours_available: number;
  priority_topics: Topic[]; study_plan: StudySlot[];
  quick_quiz: QuizItem[]; survival_tip: string;
}

// ── Inline SVG icons ─────────────────────────────────────────
const IconMoon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconZap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────
const importanceColor = (imp: string) => imp === "high" ? "var(--red)" : "var(--amber)";

// ─────────────────────────────────────────────────────────────
export default function LastNightPage() {
  const [subject,  setSubject]  = useState("");
  const [hours,    setHours]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<APIResult | null>(null);
  const [error,    setError]    = useState("");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  // ── API call ───────────────────────────────────────────────
  const generate = async () => {
    if (!subject.trim() || !hours) return;
    setLoading(true); setError(""); setResult(null); setRevealed(new Set());
    try {
      const data = await apiPost<APIResult>("/api/last-night/generate", {
        subject, hours: parseFloat(hours),
      });
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to connect to AURORA");
    } finally { setLoading(false); }
  };

  const toggleQuiz = (i: number) =>
    setRevealed((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });


  useEffect(() => {
  if (!isLoggedIn()) {
    window.location.href = "/login";
  }
}, []);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="page-wrap">
      <Header />

      <main className="page-content">

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <span className="tag-badge" style={{ background: "var(--purple-dim)", color: "var(--purple)", marginBottom: 16, display: "inline-flex" }}>
            <IconMoon /> Last Night Mode
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 800, marginBottom: 12 }}>
            Exam tomorrow?<br />
            <span style={{ color: "var(--purple)" }}>We've got you.</span>
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15, maxWidth: 460 }}>
            Enter your subject and hours available. AURORA builds a laser-focused survival plan instantly.
          </p>
        </div>

        {/* ── Input card ── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div>
              <label className="field-label">Subject</label>
              <input className="text-input" placeholder="e.g. Thermodynamics"
                value={subject} onChange={(e) => setSubject(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()} />
            </div>
            <div>
              <label className="field-label">Hours available</label>
              <input className="text-input" type="number" placeholder="e.g. 6"
                value={hours} onChange={(e) => setHours(e.target.value)}
                min="0.5" max="24" step="0.5"
                onKeyDown={(e) => e.key === "Enter" && generate()} />
            </div>
          </div>
          <button className="btn" onClick={generate}
            disabled={loading || !subject.trim() || !hours}
            style={{ background: "var(--purple)" }}>
            {loading
              ? <><span className="spin"/> Generating plan...</>
              : <><IconMoon/> Generate Survival Plan</>}
          </button>
        </div>

        {/* Error */}
        {error && <div className="error-box">{error}</div>}

        {/* ── Results ── */}
        {result && (
          <div className="results-appear" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* AURORA says banner */}
            <div style={{
              background: "var(--purple-glow)", border: "1px solid rgba(124,92,252,0.22)",
              borderRadius: "var(--radius-xl)", padding: "22px 26px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--purple-dim)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconZap/>
                </div>
                <span className="section-label" style={{ color: "var(--purple)" }}>AURORA SAYS</span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 500, color: "var(--text-1)", lineHeight: 1.6, fontStyle: "italic" }}>
                "{result.survival_tip}"
              </p>
            </div>

            {/* Priority topics */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--purple-dim)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconTarget/>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Priority Topics</h2>
                <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 2 }}>Focus here first</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.priority_topics.map((t, i) => (
                  <div key={i} className="row-item">
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: importanceColor(t.importance) + "22",
                      color: importanceColor(t.importance),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{t.topic}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.why}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: importanceColor(t.importance), letterSpacing: "0.05em", marginBottom: 3 }}>
                        {t.importance.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
                        <IconClock/> {t.time_allocation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study plan */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--blue-dim)", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconClock/>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Hour-by-Hour Plan</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.study_plan.map((slot, i) => (
                  <div key={i} className="row-item">
                    <span style={{
                      padding: "4px 11px", borderRadius: 6, flexShrink: 0,
                      background: "var(--purple-dim)", color: "var(--purple)",
                      fontSize: 11, fontWeight: 700, fontFamily: "var(--font-display)", whiteSpace: "nowrap",
                    }}>
                      {slot.time_slot}
                    </span>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{slot.activity}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{slot.tip}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick quiz */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--green-dim)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconZap/>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Quick Quiz</h2>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16 }}>
                Click each card to reveal the answer
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.quick_quiz.map((q, i) => (
                  <div key={i} onClick={() => toggleQuiz(i)} style={{
                    padding: "15px", borderRadius: "var(--radius-md)", cursor: "pointer",
                    background: revealed.has(i) ? "var(--green-dim)" : "var(--bg-elevated)",
                    border: `1px solid ${revealed.has(i) ? "rgba(34,197,94,0.28)" : "var(--border)"}`,
                    transition: "all 0.2s",
                  }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>Q{i + 1}. {q.question}</div>
                    {revealed.has(i) ? (
                      <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(34,197,94,0.18)" }}>
                        <span style={{ color: "var(--green)", flexShrink: 0, marginTop: 1 }}><IconCheck/></span>
                        <span style={{ fontSize: 13, color: "var(--green)", lineHeight: 1.5 }}>{q.answer}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 5 }}>Click to reveal</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}