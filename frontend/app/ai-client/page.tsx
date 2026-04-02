"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { apiPost, apiGet } from "../../lib/api";
import { isLoggedIn } from "../../lib/auth";

// ── Types ─────────────────────────────────────────────────────
interface Brief {
  client_name:                    string;
  client_personality:             string;
  personality_hint:               string;
  project_title:                  string;
  brief:                          string;
  requirements:                   string[];
  budget:                         string;
  deadline:                       string;
  red_flags:                      string[];
  suggested_clarification_questions: string[];
  _personality:                   { type: string };
}

interface Feedback {
  client_reaction:    string;
  client_score:       number;
  verdict:            string;
  strengths:          string[];
  improvements:       string[];
  soft_skill_feedback: {
    communication:         string;
    professionalism:       string;
    requirement_adherence: string;
  };
  mentor_note:  string;
  coins_earned: number;
  new_balance:  number;
  coins_reason: string;
}

// ── Icons ─────────────────────────────────────────────────────
const IconBriefcase = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const IconCoin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const IconAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

// ── Personality styles ─────────────────────────────────────────
const PERSONALITY_STYLES: Record<string, { color: string; dim: string; label: string }> = {
  strict:    { color: "var(--red)",    dim: "var(--red-dim)",    label: "Strict Client" },
  chill:     { color: "var(--green)",  dim: "var(--green-dim)",  label: "Chill Client" },
  confusing: { color: "var(--amber)",  dim: "var(--amber-dim)",  label: "Confusing Client" },
  impatient: { color: "#f97316",       dim: "rgba(249,115,22,0.15)", label: "Impatient Client" },
};

// ── Verdict styles ─────────────────────────────────────────────
const VERDICT_STYLES: Record<string, { color: string; dim: string; label: string }> = {
  accepted:        { color: "var(--green)",  dim: "var(--green-dim)",  label: "Accepted" },
  revision_needed: { color: "var(--amber)",  dim: "var(--amber-dim)",  label: "Revision Needed" },
  rejected:        { color: "var(--red)",    dim: "var(--red-dim)",    label: "Rejected" },
};

// ── Steps ─────────────────────────────────────────────────────
type Step = "skill" | "brief" | "submit" | "feedback";

// ─────────────────────────────────────────────────────────────
export default function AIClientPage() {
  const [step,       setStep]       = useState<Step>("skill");
  const [skill,      setSkill]      = useState("");
  const [brief,      setBrief]      = useState<Brief | null>(null);
  const [submission, setSubmission] = useState("");
  const [feedback,   setFeedback]   = useState<Feedback | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [balance,    setBalance]    = useState<number | null>(null);
  const [mentorUnlocked, setMentorUnlocked] = useState(false);
  const [mentorUnlockLoading, setMentorUnlockLoading] = useState(false);
  const [mentorUnlockError, setMentorUnlockError] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) { window.location.href = "/login"; return; }
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const data = await apiGet<{ balance: number }>("/api/client/coins");
      setBalance(data.balance);
    } catch { /* silent */ }
  };

  // ── Step 1: Get brief ──────────────────────────────────────
  const getBrief = async () => {
    if (!skill.trim()) return;
    setLoading(true); setError("");
    try {
      const data = await apiPost<Brief>("/api/client/brief", { skill });
      setBrief(data);
      setStep("brief");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate brief");
    } finally { setLoading(false); }
  };

  // ── Step 2: Submit work ────────────────────────────────────
  const submitWork = async () => {
    if (!submission.trim() || !brief) return;
    setLoading(true); setError("");
    setMentorUnlocked(false);
    setMentorUnlockError("");
    try {
      const data = await apiPost<Feedback>("/api/client/evaluate", {
        skill,
        brief:            brief.brief,
        submission,
        // Prefer stored personality type; fall back for older payloads.
        personality_type: brief._personality?.type ?? brief.client_personality,
      });
      setFeedback(data);
      setBalance(data.new_balance);
      setStep("feedback");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to evaluate submission");
    } finally { setLoading(false); }
  };

  // ── Reset ──────────────────────────────────────────────────
  const reset = () => {
    setStep("skill"); setSkill(""); setBrief(null);
    setSubmission(""); setFeedback(null); setError("");
    setMentorUnlocked(false);
    setMentorUnlockError("");
  };

  const unlockMentorNote = async () => {
    setMentorUnlockLoading(true);
    setMentorUnlockError("");
    try {
      await apiPost("/api/coins/spend", {
        amount: 10,
        reason: "Unlock AI Client mentor note",
      });
      setMentorUnlocked(true);
    } catch (e: unknown) {
      setMentorUnlockError(e instanceof Error ? e.message : "Unlock failed");
    } finally {
      setMentorUnlockLoading(false);
    }
  };

  const personality = brief ? PERSONALITY_STYLES[brief.client_personality] ?? PERSONALITY_STYLES.strict : null;

  return (
    <div className="page-wrap">
      <Header />
      <main className="page-content">

        {/* Page header */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="tag-badge" style={{ background: "rgba(249,115,22,0.15)", color: "#f97316", marginBottom: 16, display: "inline-flex" }}>
              <IconBriefcase /> AI Client Mode
            </span>
            <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 800, marginBottom: 12 }}>
              Practice with a<br />
              <span style={{ color: "#f97316" }}>real AI client.</span>
            </h1>
            <p style={{ color: "var(--text-2)", fontSize: 15, maxWidth: 460 }}>
              Get a realistic client brief, submit your work, receive honest feedback, and earn Aurora Coins.
            </p>
          </div>

          {/* Coins balance */}
          {balance !== null && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "var(--radius-lg)", padding: "14px 20px",
            }}>
              <div style={{ color: "var(--amber)" }}><IconCoin /></div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--amber)", lineHeight: 1 }}>
                  {balance}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Aurora Coins</div>
              </div>
            </div>
          )}
        </div>

        {/* Progress steps */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32, overflowX: "auto" }}>
          {[
            { key: "skill",    label: "1. Your Skill" },
            { key: "brief",    label: "2. Client Brief" },
            { key: "submit",   label: "3. Submit Work" },
            { key: "feedback", label: "4. Feedback" },
          ].map((s, i) => {
            const steps: Step[] = ["skill", "brief", "submit", "feedback"];
            const current = steps.indexOf(step);
            const thisIdx = steps.indexOf(s.key as Step);
            const done    = thisIdx < current;
            const active  = thisIdx === current;
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  padding: "7px 14px", borderRadius: 20,
                  fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)",
                  background: active ? "#f97316" : done ? "rgba(249,115,22,0.2)" : "var(--bg-elevated)",
                  color: active ? "white" : done ? "#f97316" : "var(--text-3)",
                  border: `1px solid ${active ? "#f97316" : done ? "rgba(249,115,22,0.4)" : "var(--border)"}`,
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}>
                  {done ? "✓ " : ""}{s.label}
                </div>
                {i < 3 && (
                  <div style={{ width: 24, height: 1, background: done ? "rgba(249,115,22,0.4)" : "var(--border)", flexShrink: 0 }}/>
                )}
              </div>
            );
          })}
        </div>

        {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}

        {/* ── STEP 1: Skill input ── */}
        {step === "skill" && (
          <div className="card">
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              What&apos;s your skill?
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 20 }}>
              Enter any skill — coding, design, writing, video editing, Excel, anything. AURORA will generate a realistic client project for it.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label className="field-label">Your Skill</label>
              <input className="text-input" placeholder="e.g. Python, Logo Design, Video Editing, Excel..."
                value={skill} onChange={(e) => setSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && getBrief()} />
            </div>

            {/* Example skills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {["Python", "Logo Design", "Content Writing", "Video Editing", "Excel", "Social Media"].map((s) => (
                <button key={s} onClick={() => setSkill(s)} style={{
                  padding: "6px 12px", borderRadius: 20,
                  background: skill === s ? "rgba(249,115,22,0.2)" : "var(--bg-elevated)",
                  border: `1px solid ${skill === s ? "rgba(249,115,22,0.5)" : "var(--border)"}`,
                  color: skill === s ? "#f97316" : "var(--text-2)",
                  fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)",
                  transition: "all 0.15s",
                }}>
                  {s}
                </button>
              ))}
            </div>

            <button className="btn" onClick={getBrief}
              disabled={loading || !skill.trim()}
              style={{ background: "#f97316" }}>
              {loading
                ? <><span className="spin"/> Finding you a client...</>
                : <><IconBriefcase /> Get My Client Brief</>}
            </button>
          </div>
        )}

        {/* ── STEP 2: Client brief ── */}
        {step === "brief" && brief && personality && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Client identity */}
            <div style={{
              background: personality.dim,
              border: `1px solid ${personality.color}44`,
              borderRadius: "var(--radius-xl)", padding: "22px 26px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: personality.color, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18,
                }}>
                  {brief.client_name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
                    {brief.client_name}
                  </div>
                  <span className="tag-badge" style={{ background: personality.color + "22", color: personality.color, fontSize: 10, padding: "3px 8px" }}>
                    {personality.label}
                  </span>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right", fontSize: 13, color: "var(--text-2)" }}>
                  <div>Budget: <strong>{brief.budget}</strong></div>
                  <div>Deadline: <strong>{brief.deadline}</strong></div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-2)", fontStyle: "italic", marginBottom: 0 }}>
                {brief.personality_hint}
              </p>
            </div>

            {/* Project brief */}
            <div className="card">
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 6 }}>
                {brief.project_title}
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 20, padding: "14px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", borderLeft: `3px solid ${personality.color}` }}>
                &quot;{brief.brief}&quot;
              </p>

              <div className="section-label" style={{ color: "var(--text-3)", marginBottom: 10 }}>REQUIREMENTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {brief.requirements.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#f97316", flexShrink: 0, marginTop: 2 }}><IconCheck /></span>
                    <span style={{ fontSize: 14, color: "var(--text-2)" }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Red flags */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ color: "var(--red)" }}><IconAlert /></span>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>Watch Out For</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {brief.red_flags.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "11px 14px", borderRadius: "var(--radius-md)", background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.18)" }}>
                    <span style={{ color: "var(--red)", flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 13, color: "var(--text-2)" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clarification questions hint */}
            <div style={{ background: "var(--purple-glow)", border: "1px solid rgba(124,92,252,0.22)", borderRadius: "var(--radius-lg)", padding: "16px 20px" }}>
              <p className="section-label" style={{ color: "var(--purple)", marginBottom: 10 }}>
                AURORA HINTS — Smart Questions to Ask
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {brief.suggested_clarification_questions.map((q, i) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--text-2)" }}>
                    💡 {q}
                  </div>
                ))}
              </div>
            </div>

            <button className="btn" onClick={() => setStep("submit")}
              style={{ background: "#f97316" }}>
              I&apos;ve Read the Brief — Submit My Work →
            </button>
          </div>
        )}

        {/* ── STEP 3: Submit work ── */}
        {step === "submit" && brief && personality && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Brief reminder */}
            <div style={{ background: personality.dim, border: `1px solid ${personality.color}33`, borderRadius: "var(--radius-lg)", padding: "16px 20px" }}>
              <p className="section-label" style={{ color: personality.color, marginBottom: 6 }}>
                CLIENT: {brief.client_name} ({personality.label})
              </p>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>
                &quot;{brief.brief}&quot;
              </p>
            </div>

            {/* Submission */}
            <div className="card">
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
                Your Submission
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
                Describe your work, paste your solution, or explain what you delivered. Write as if you&apos;re messaging the client directly.
              </p>
              <textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder={`Hi ${brief.client_name}, I've completed the project. Here's what I delivered...\n\n[Describe your work in detail]`}
                rows={10}
                style={{
                  width: "100%", background: "var(--bg-elevated)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                  padding: "14px 16px", color: "var(--text-1)",
                  fontFamily: "var(--font-body)", fontSize: 14,
                  outline: "none", resize: "vertical", lineHeight: 1.7,
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "#f97316"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              />
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8, textAlign: "right" }}>
                {submission.length} characters {submission.length < 50 ? "— write more detail" : ""}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep("brief")} style={{
                padding: "13px 20px", borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)", color: "var(--text-2)",
                border: "1px solid var(--border)", cursor: "pointer",
                fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14,
              }}>
                ← Back
              </button>
              <button className="btn" onClick={submitWork}
                disabled={loading || submission.trim().length < 20}
                style={{ background: "#f97316" }}>
                {loading
                  ? <><span className="spin"/> Client is reviewing...</>
                  : "Submit to Client →"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Feedback ── */}
        {step === "feedback" && feedback && brief && personality && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Verdict banner */}
            {(() => {
              const v = VERDICT_STYLES[feedback.verdict] ?? VERDICT_STYLES.accepted;
              return (
                <div style={{
                  background: v.dim, border: `1px solid ${v.color}44`,
                  borderRadius: "var(--radius-xl)", padding: "22px 26px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: 16,
                }}>
                  <div>
                    <p className="section-label" style={{ color: v.color, marginBottom: 6 }}>
                      VERDICT
                    </p>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2rem)", color: v.color }}>
                      {v.label}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2.5rem, 6vw, 3.5rem)", color: v.color, lineHeight: 1 }}>
                      {feedback.client_score}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>/ 100</div>
                  </div>
                </div>
              );
            })()}

            {/* Coins earned */}
            <div style={{
              background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "var(--radius-lg)", padding: "18px 22px",
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              <div style={{ color: "var(--amber)", fontSize: 28 }}>🪙</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--amber)" }}>
                  +{feedback.coins_earned} Aurora Coins earned!
                </div>
                <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 3 }}>
                  {feedback.coins_reason} · New balance: {feedback.new_balance} coins
                </div>
              </div>
            </div>

            {/* Client reaction */}
            <div style={{
              background: personality.dim, border: `1px solid ${personality.color}33`,
              borderRadius: "var(--radius-xl)", padding: "20px 24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: personality.color, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15,
                }}>
                  {brief.client_name.charAt(0)}
                </div>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{brief.client_name}</span>
                  <span className="tag-badge" style={{ background: personality.color + "22", color: personality.color, fontSize: 10, marginLeft: 8 }}>
                    {personality.label}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.7, fontStyle: "italic" }}>
                &quot;{feedback.client_reaction}&quot;
              </p>
            </div>

            {/* Strengths + Improvements */}
            <div className="grid-2">
              <div className="card">
                <p className="section-label" style={{ color: "var(--green)", marginBottom: 12 }}>STRENGTHS</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {feedback.strengths.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "11px 14px", borderRadius: "var(--radius-md)", background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.2)" }}>
                      <span style={{ color: "var(--green)", flexShrink: 0 }}><IconCheck /></span>
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <p className="section-label" style={{ color: "var(--red)", marginBottom: 12 }}>IMPROVE</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {feedback.improvements.map((imp, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "11px 14px", borderRadius: "var(--radius-md)", background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.18)" }}>
                      <span style={{ color: "var(--red)", flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Soft skills */}
            <div className="card">
              <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 14 }}>SOFT SKILL FEEDBACK</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(feedback.soft_skill_feedback).map(([key, val]) => (
                  <div key={key} className="row-item">
                    <div style={{ width: 120, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "capitalize" }}>
                        {key.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AURORA mentor note */}
            {mentorUnlocked ? (
              <div style={{ background: "var(--purple-glow)", border: "1px solid rgba(124,92,252,0.25)", borderRadius: "var(--radius-xl)", padding: "20px 24px" }}>
                <p className="section-label" style={{ color: "var(--purple)", marginBottom: 10 }}>
                  AURORA MENTOR NOTE
                </p>
                <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.65, fontStyle: "italic" }}>
                  &quot;{feedback.mentor_note}&quot;
                </p>
              </div>
            ) : (
              <div style={{ background: "var(--purple-glow)", border: "1px solid rgba(124,92,252,0.25)", borderRadius: "var(--radius-xl)", padding: "20px 24px" }}>
                <p className="section-label" style={{ color: "var(--purple)", marginBottom: 10 }}>
                  AURORA MENTOR NOTE
                </p>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--purple)" }}>
                  Locked
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                  Unlock for <strong style={{ color: "var(--purple)" }}>10 coins</strong> to see the mentor coaching.
                </div>
                <button
                  className="btn"
                  onClick={unlockMentorNote}
                  disabled={mentorUnlockLoading}
                  style={{ background: "var(--purple)", marginTop: 14, width: "100%" }}
                >
                  {mentorUnlockLoading ? "Unlocking..." : "Unlock Mentor Note"}
                </button>
                {mentorUnlockError && <div style={{ marginTop: 10, fontSize: 12, color: "var(--red)" }}>{mentorUnlockError}</div>}
              </div>
            )}

            {/* Try again */}
            <button className="btn" onClick={reset}
              style={{ background: "#f97316" }}>
              <IconRefresh /> Try Another Client
            </button>
          </div>
        )}
      </main>
    </div>
  );
}