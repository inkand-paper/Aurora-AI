"use client";
import { useState } from "react";
import Header from "../../components/Header";
import { apiPost } from "../../lib/api";
import { isLoggedIn } from "../../lib/auth";
import { useEffect } from "react";

// ── Types ───────────────────────────────────────────────────
interface EarningPath { path: string; platform: string; how_it_works: string; realistic_earning: string; difficulty: string; best_for: string; }
interface DayPlan     { day: number; task: string; time_needed: string; outcome: string; }
interface APIResult {
  skill: string; level: string;
  income_potential: { minimum: string; maximum: string; timeline: string; };
  earning_paths:    EarningPath[];
  seven_day_plan:   DayPlan[];
  first_client_strategy: string;
  biggest_mistake:       string;
}

// ── Inline SVG icons ─────────────────────────────────────────
const IconDollar = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconTrend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconCal = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────
const diffColor = (d: string) => {
  if (d === "easy")   return "var(--green)";
  if (d === "medium") return "var(--amber)";
  return "var(--red)";
};

// ─────────────────────────────────────────────────────────────
export default function SkillIncomePage() {
  const [skill,  setSkill]  = useState("");
  const [level,  setLevel]  = useState("beginner");
  const [hours,  setHours]  = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<APIResult | null>(null);
  const [error,   setError]   = useState("");

  // ── API call ──────────────────────────────────────────────
  const generate = async () => {
  if (!skill.trim() || !hours) return;
  setLoading(true); setError(""); setResult(null);
  try {
    const data = await apiPost<APIResult>("/api/skill-income/generate", {
      skill, level, hours_per_week: parseFloat(hours),
    });
    setResult(data);
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : "Failed to connect to AURORA");
  } finally { setLoading(false); }
};

useEffect(() => {
  if (!isLoggedIn()) {
    window.location.href = "/login";
  }
}, []);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="page-wrap">
      <Header />

      <main className="page-content">

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <span className="tag-badge" style={{ background: "var(--amber-dim)", color: "var(--amber)", marginBottom: 16, display: "inline-flex" }}>
            <IconDollar/> Skill → Income
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 800, marginBottom: 12 }}>
            Your skills are worth<br />
            <span style={{ color: "var(--amber)" }}>real money.</span>
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15, maxWidth: 460 }}>
            Tell AURORA what you know. Get a 7-day plan to start earning — tailored to your skill level.
          </p>
        </div>

        {/* ── Input card ── */}
        <div className="card" style={{ marginBottom: 20 }}>
          {/* 3-column grid on desktop, 1-column on mobile */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16, marginBottom: 20 }} className="skill-grid">
            <div>
              <label className="field-label">Your Skill</label>
              <input className="text-input" placeholder="e.g. Python, Graphic Design"
                value={skill} onChange={(e) => setSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()} />
            </div>
            <div>
              <label className="field-label">Level</label>
              <select className="text-input" value={level} onChange={(e) => setLevel(e.target.value)}
                style={{ cursor: "pointer" }}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="field-label">Free hours / week</label>
              <input className="text-input" type="number" placeholder="e.g. 10"
                value={hours} onChange={(e) => setHours(e.target.value)} min="1" max="40" />
            </div>
          </div>
          <button className="btn" onClick={generate}
            disabled={loading || !skill.trim() || !hours}
            style={{ background: "var(--amber)" }}>
            {loading
              ? <><span className="spin"/> Building income plan...</>
              : <><IconDollar/> Build My Income Plan</>}
          </button>
        </div>

        {/* Error */}
        {error && <div className="error-box">{error}</div>}

        {/* ── Results ── */}
        {result && (
          <div className="results-appear" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Income potential — 3 stat boxes */}
            <div className="grid-3">
              {[
                { label: "MIN / MONTH",   value: result.income_potential.minimum,  color: "var(--amber)" },
                { label: "MAX / MONTH",   value: result.income_potential.maximum,  color: "var(--green)" },
                { label: "FIRST INCOME",  value: result.income_potential.timeline, color: "var(--blue)"  },
              ].map((item) => (
                <div key={item.label} style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)", padding: "22px 14px", textAlign: "center",
                }}>
                  <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 10 }}>{item.label}</p>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(1rem, 2.5vw, 1.35rem)", color: item.color, lineHeight: 1.2 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Earning paths */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--amber-dim)", color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconTrend/>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Earning Paths</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {result.earning_paths.map((p, i) => (
                  <div key={i} className="row-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
                    {/* Path header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                          background: diffColor(p.difficulty) + "22", color: diffColor(p.difficulty),
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
                        }}>{i + 1}</div>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{p.path}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5,
                          background: diffColor(p.difficulty) + "22", color: diffColor(p.difficulty),
                          fontFamily: "var(--font-display)", letterSpacing: "0.06em",
                        }}>
                          {p.difficulty.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--amber)", fontFamily: "var(--font-display)" }}>
                          {p.realistic_earning}
                        </span>
                      </div>
                    </div>
                    {/* Description */}
                    <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 10 }}>
                      {p.how_it_works}
                    </p>
                    {/* Meta */}
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-3)" }}>
                        <IconPin/> {p.platform}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-3)" }}>
                        <IconUser/> {p.best_for}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-day plan */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--amber-dim)", color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconCal/>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>7-Day Launch Plan</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.seven_day_plan.map((d) => (
                  <div key={d.day} className="row-item">
                    <span style={{
                      padding: "4px 11px", borderRadius: 6, flexShrink: 0,
                      background: "var(--amber-dim)", color: "var(--amber)",
                      fontSize: 11, fontWeight: 700, fontFamily: "var(--font-display)", whiteSpace: "nowrap",
                    }}>
                      Day {d.day}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{d.task}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                        {d.time_needed} &nbsp;·&nbsp; {d.outcome}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* First client + Biggest mistake */}
            <div className="grid-2">
              <div style={{ background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: "var(--radius-xl)", padding: "20px 22px" }}>
                <span className="section-label" style={{ color: "var(--green)", display: "block", marginBottom: 10 }}>
                  GET YOUR FIRST CLIENT
                </span>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>
                  {result.first_client_strategy}
                </p>
              </div>
              <div style={{ background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "var(--radius-xl)", padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <span style={{ color: "var(--red)" }}><IconAlert/></span>
                  <span className="section-label" style={{ color: "var(--red)" }}>BIGGEST MISTAKE</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>
                  {result.biggest_mistake}
                </p>
              </div>
            </div>

          </div>
        )}
      </main>

      <style>{`
        @media (max-width: 640px) {
          .skill-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}