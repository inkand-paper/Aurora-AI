"use client";
import { useState } from "react";
import Header from "../../components/Header";
import { apiPost } from "../../lib/api";


// ── Types ───────────────────────────────────────────────────
interface RecoveryAction { action: string; time_needed: string; impact: string; }
interface APIResult {
  subject: string; completion_rate: number; performance_prediction: string;
  prediction_reason: string; reality_check: string;
  consequences: string[]; recovery_plan: RecoveryAction[];
  motivational_truth: string;
}

// ── Inline SVG icons ─────────────────────────────────────────
const IconBars = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconZap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────
const gradeColor = (g: string) => {
  const map: Record<string, string> = { A: "var(--green)", B: "var(--blue)", C: "var(--amber)", D: "#f97316", F: "var(--red)" };
  return map[g] ?? "var(--text-2)";
};
const impactColor = (i: string) => {
  if (i === "high")   return "var(--green)";
  if (i === "medium") return "var(--amber)";
  return "var(--text-3)";
};

// ─────────────────────────────────────────────────────────────
export default function RealityPage() {
  const [subject, setSubject] = useState("");
  const [planned, setPlanned] = useState("");
  const [actual,  setActual]  = useState("");
  const [days,    setDays]    = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<APIResult | null>(null);
  const [error,   setError]   = useState("");

  // ── API call ──────────────────────────────────────────────
  const check = async () => {
  if (!subject || !planned || !actual || !days) return;
  setLoading(true); setError(""); setResult(null);
  try {
    const data = await apiPost<APIResult>("/api/reality/check", {
      subject,
      planned_hours: parseFloat(planned),
      actual_hours:  parseFloat(actual),
      exam_days:     parseInt(days),
    });
    setResult(data);
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : "Failed to connect to AURORA");
  } finally { setLoading(false); }
};

  const inputFields = [
    { label: "Subject",               val: subject, set: setSubject, placeholder: "e.g. Mathematics",  type: "text"   },
    { label: "Days until exam",        val: days,    set: setDays,    placeholder: "e.g. 3",            type: "number" },
    { label: "Hours planned to study", val: planned, set: setPlanned, placeholder: "e.g. 10",           type: "number" },
    { label: "Hours actually studied", val: actual,  set: setActual,  placeholder: "e.g. 4",            type: "number" },
  ];

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="page-wrap">
      <Header />

      <main className="page-content">

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <span className="tag-badge" style={{ background: "var(--green-dim)", color: "var(--green)", marginBottom: 16, display: "inline-flex" }}>
            <IconBars/> Reality Mode
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 800, marginBottom: 12 }}>
            Time for an honest<br />
            <span style={{ color: "var(--green)" }}>reality check.</span>
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15, maxWidth: 460 }}>
            No sugarcoating. Enter your study data and get an honest performance prediction with a recovery plan.
          </p>
        </div>

        {/* ── Input card ── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            {inputFields.map((f) => (
              <div key={f.label}>
                <label className="field-label">{f.label}</label>
                <input className="text-input" type={f.type} placeholder={f.placeholder}
                  value={f.val} onChange={(e) => f.set(e.target.value)} />
              </div>
            ))}
          </div>
          <button className="btn" onClick={check}
            disabled={loading || !subject || !planned || !actual || !days}
            style={{ background: "var(--green)" }}>
            {loading
              ? <><span className="spin"/> Analysing your data...</>
              : <><IconBars/> Check My Reality</>}
          </button>
        </div>

        {/* Error */}
        {error && <div className="error-box">{error}</div>}

        {/* ── Results ── */}
        {result && (
          <div className="results-appear" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Grade + Completion rate */}
            <div className="grid-2">
              {[
                { label: "PREDICTED GRADE",  value: result.performance_prediction,       color: gradeColor(result.performance_prediction) },
                { label: "COMPLETION RATE",   value: `${Math.round(result.completion_rate)}%`, color: gradeColor(result.performance_prediction) },
              ].map((item) => (
                <div key={item.label} style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)", padding: "28px 24px", textAlign: "center",
                }}>
                  <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 14 }}>{item.label}</p>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(3rem, 9vw, 5rem)", color: item.color, lineHeight: 1 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Reality check */}
            <div style={{
              background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)",
              borderRadius: "var(--radius-xl)", padding: "22px 26px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--green-dim)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconBars/>
                </div>
                <span className="section-label" style={{ color: "var(--green)" }}>REALITY CHECK</span>
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.65, marginBottom: 10 }}>{result.reality_check}</p>
              <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.55 }}>{result.prediction_reason}</p>
            </div>

            {/* Consequences */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--red-dim)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconZap/>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>If you don't change course</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.consequences.map((c, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, padding: "13px 15px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.18)",
                  }}>
                    <span style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }}><IconArrow/></span>
                    <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>{c}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recovery plan */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--blue-dim)", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconZap/>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Recovery Plan</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.recovery_plan.map((r, i) => (
                  <div key={i} className="row-item">
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: impactColor(r.impact) + "22", color: impactColor(r.impact),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 3 }}>{r.action}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{r.time_needed}</div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                      padding: "4px 9px", borderRadius: 6, flexShrink: 0,
                      background: impactColor(r.impact) + "22", color: impactColor(r.impact),
                      fontFamily: "var(--font-display)",
                    }}>
                      {r.impact.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational truth */}
            <div style={{
              background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)",
              borderRadius: "var(--radius-xl)", padding: "22px 26px",
            }}>
              <span className="section-label" style={{ color: "var(--green)", display: "block", marginBottom: 10 }}>
                AURORA'S TRUTH
              </span>
              <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.6, fontStyle: "italic" }}>
                "{result.motivational_truth}"
              </p>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}