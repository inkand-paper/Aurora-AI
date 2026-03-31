"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { apiPost } from "../../lib/api";
import { isLoggedIn } from "../../lib/auth";

// ── Types ────────────────────────────────────────────────────
interface MustStudy      { topic: string; why: string; time_allocation: string; quick_tip: string; }
interface IfTime         { topic: string; why: string; }
interface SkipTopic      { topic: string; reason: string; }
interface HighProb       { topic: string; confidence: string; reason: string; }
interface CrashSlot      { time_slot: string; activity: string; tip: string; }
interface QuizItem       { question: string; answer: string; }
interface APIResult {
  subject: string; hours_available: number; mode: string;
  must_study: MustStudy[]; if_time_allows: IfTime[];
  skip_these: SkipTopic[]; high_probability_topics: HighProb[];
  crash_plan: CrashSlot[]; quick_quiz: QuizItem[];
  survival_tip: string;
}

// ── Icons ─────────────────────────────────────────────────────
const IconMoon   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IconTarget = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconClock  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconZap    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconCheck  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconSkip   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>;
const IconStar   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

// ── Time mode presets ─────────────────────────────────────────
const TIME_MODES = [
  { label: "2 Hours",  value: 2,  tag: "CRASH MODE",  color: "var(--red)"    },
  { label: "4 Hours",  value: 4,  tag: "SPRINT MODE", color: "var(--amber)"  },
  { label: "8 Hours",  value: 8,  tag: "FULL MODE",   color: "var(--green)"  },
  { label: "Custom",   value: 0,  tag: "CUSTOM",      color: "var(--purple)" },
];

// ─────────────────────────────────────────────────────────────
export default function LastNightPage() {
  const [subject,    setSubject]    = useState("");
  const [hours,      setHours]      = useState("");
  const [selectedMode, setMode]     = useState<number | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState<APIResult | null>(null);
  const [error,      setError]      = useState("");
  const [revealed,   setRevealed]   = useState<Set<number>>(new Set());
  const [activeTab,  setActiveTab]  = useState<"plan"|"quiz"|"skip">("plan");

  useEffect(() => {
    if (!isLoggedIn()) window.location.href = "/login";
  }, []);

  const selectMode = (val: number) => {
    setMode(val);
    if (val !== 0) setHours(String(val));
    else setHours("");
  };

  const generate = async () => {
    if (!subject.trim() || !hours) return;
    setLoading(true); setError(""); setResult(null);
    setRevealed(new Set()); setActiveTab("plan");
    try {
      const data = await apiPost<APIResult>("/api/last-night/generate", {
        subject, hours: parseFloat(hours),
      });
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to connect to AURORA");
    } finally { setLoading(false); }
  };

  const toggle = (i: number) =>
    setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const modeColor = result
    ? result.hours_available <= 2 ? "var(--red)"
    : result.hours_available <= 4 ? "var(--amber)"
    : "var(--green)"
    : "var(--purple)";

  return (
    <div className="page-wrap">
      <Header />
      <main className="page-content">

        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <span className="tag-badge" style={{ background: "var(--purple-dim)", color: "var(--purple)", marginBottom: 16, display: "inline-flex" }}>
            <IconMoon /> Last Night Mode
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 800, marginBottom: 12 }}>
            Exam tomorrow?<br />
            <span style={{ color: "var(--purple)" }}>We've got you.</span>
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15, maxWidth: 460 }}>
            Tell AURORA how much time you have. Get a laser-focused survival plan instantly.
          </p>
        </div>

        {/* Input card */}
        <div className="card" style={{ marginBottom: 20 }}>

          {/* Subject input */}
          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Subject</label>
            <input className="text-input" placeholder="e.g. Thermodynamics"
              value={subject} onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()} />
          </div>

          {/* Time mode selector */}
          <div style={{ marginBottom: 20 }}>
            <label className="field-label">How much time do you have?</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }} className="time-modes">
              {TIME_MODES.map((m) => (
                <button key={m.value} onClick={() => selectMode(m.value)} style={{
                  padding: "12px 8px", borderRadius: "var(--radius-md)",
                  border: `1px solid ${selectedMode === m.value ? m.color : "var(--border)"}`,
                  background: selectedMode === m.value ? m.color + "18" : "var(--bg-elevated)",
                  color: selectedMode === m.value ? m.color : "var(--text-2)",
                  cursor: "pointer", transition: "all 0.15s",
                  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 14, marginBottom: 3 }}>{m.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.8, letterSpacing: "0.06em" }}>{m.tag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom hours input */}
          {selectedMode === 0 && (
            <div style={{ marginBottom: 20 }}>
              <label className="field-label">Enter exact hours</label>
              <input className="text-input" type="number"
                placeholder="e.g. 6" value={hours}
                onChange={(e) => setHours(e.target.value)}
                min="0.5" max="24" step="0.5" />
            </div>
          )}

          <button className="btn" onClick={generate}
            disabled={loading || !subject.trim() || !hours}
            style={{ background: "var(--purple)" }}>
            {loading
              ? <><span className="spin"/> Generating your plan...</>
              : <><IconMoon /> Generate Survival Plan</>}
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* Results */}
        {result && (
          <div className="results-appear" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Mode banner */}
            <div style={{
              background: modeColor + "15",
              border: `1px solid ${modeColor}44`,
              borderRadius: "var(--radius-xl)", padding: "20px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 12,
            }}>
              <div>
                <span className="section-label" style={{ color: modeColor, display: "block", marginBottom: 6 }}>
                  {result.mode}
                </span>
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)" }}>
                  {result.subject} — {result.hours_available} hours
                </p>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)", fontStyle: "italic", maxWidth: 320 }}>
                "{result.survival_tip}"
              </div>
            </div>

            {/* High probability topics */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(245,158,11,0.2)", color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconStar />
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
                  High Probability Exam Topics
                </h2>
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>likely to appear</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.high_probability_topics.map((t, i) => (
                  <div key={i} className="row-item">
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: t.confidence === "high" ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.1)",
                      color: "var(--amber)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <IconStar />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{t.topic}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.reason}</div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5,
                      background: t.confidence === "high" ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.1)",
                      color: "var(--amber)", fontFamily: "var(--font-display)", flexShrink: 0,
                    }}>
                      {t.confidence.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
              {[
                { key: "plan",  label: "Study Plan" },
                { key: "quiz",  label: "Quick Quiz" },
                { key: "skip",  label: "Smart Skip" },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)} style={{
                  padding: "10px 18px", background: "none", border: "none",
                  borderBottom: `2px solid ${activeTab === tab.key ? "var(--purple)" : "transparent"}`,
                  color: activeTab === tab.key ? "var(--text-1)" : "var(--text-2)",
                  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14,
                  cursor: "pointer", transition: "all 0.15s", marginBottom: -1,
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Study Plan */}
            {activeTab === "plan" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Must study */}
                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--purple-dim)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IconTarget />
                    </div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Must Study</h2>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>non-negotiable</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {result.must_study.map((t, i) => (
                      <div key={i} className="row-item">
                        <div style={{
                          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                          background: "var(--purple-dim)", color: "var(--purple)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                        }}>{i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{t.topic}</div>
                          <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>{t.why}</div>
                          <div style={{ fontSize: 12, color: "var(--purple)", fontStyle: "italic" }}>
                            Tip: {t.quick_tip}
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                          <IconClock /> {t.time_allocation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* If time allows */}
                {result.if_time_allows.length > 0 && (
                  <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--blue-dim)", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconClock />
                      </div>
                      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>If Time Allows</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {result.if_time_allows.map((t, i) => (
                        <div key={i} className="row-item">
                          <span style={{ color: "var(--blue)", flexShrink: 0 }}><IconCheck /></span>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>{t.topic}</div>
                            <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.why}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Crash plan */}
                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(239,68,68,0.15)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IconZap />
                    </div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Crash Plan</h2>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>hour by hour</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.crash_plan.map((slot, i) => (
                      <div key={i} className="row-item">
                        <span style={{
                          padding: "4px 10px", borderRadius: 6, flexShrink: 0,
                          background: "var(--purple-dim)", color: "var(--purple)",
                          fontSize: 11, fontWeight: 700, fontFamily: "var(--font-display)",
                          whiteSpace: "nowrap",
                        }}>
                          {slot.time_slot}
                        </span>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 3 }}>{slot.activity}</div>
                          <div style={{ fontSize: 12, color: "var(--text-3)" }}>{slot.tip}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Quiz */}
            {activeTab === "quiz" && (
              <div className="card">
                <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16 }}>
                  Click each card to reveal the answer
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.quick_quiz.map((q, i) => (
                    <div key={i} onClick={() => toggle(i)} style={{
                      padding: "15px", borderRadius: "var(--radius-md)", cursor: "pointer",
                      background: revealed.has(i) ? "var(--green-dim)" : "var(--bg-elevated)",
                      border: `1px solid ${revealed.has(i) ? "rgba(34,197,94,0.28)" : "var(--border)"}`,
                      transition: "all 0.2s",
                    }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>Q{i + 1}. {q.question}</div>
                      {revealed.has(i) ? (
                        <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(34,197,94,0.18)" }}>
                          <span style={{ color: "var(--green)", flexShrink: 0 }}><IconCheck /></span>
                          <span style={{ fontSize: 13, color: "var(--green)", lineHeight: 1.5 }}>{q.answer}</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 5 }}>Click to reveal</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Smart Skip */}
            {activeTab === "skip" && (
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--red-dim)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconSkip />
                  </div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Skip These Tonight</h2>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 14 }}>
                  Don't waste time on these — they're low yield for the time you have.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.skip_these.map((t, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 12, padding: "13px 15px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.18)",
                    }}>
                      <span style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }}><IconSkip /></span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{t.topic}</div>
                        <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @media (max-width: 480px) {
          .time-modes { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}