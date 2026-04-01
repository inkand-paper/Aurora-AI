"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { apiGet } from "../../lib/api";
import { isLoggedIn } from "../../lib/auth";
import Link from "next/link";

interface HistoryItem {
  id:           number;
  feature_type: string;
  input_data:   Record<string, unknown>;
  output_data:  Record<string, unknown>;
  created_at:   string;
}

const FEATURE_CONFIG: Record<string, { label: string; color: string; dim: string }> = {
  last_night:   { label: "Last Night Mode",   color: "var(--purple)", dim: "var(--purple-dim)" },
  analogy:      { label: "Analogy Generator", color: "var(--blue)",   dim: "var(--blue-dim)"   },
  reality:      { label: "Reality Mode",      color: "var(--green)",  dim: "var(--green-dim)"  },
  skill_income: { label: "Skill → Income",    color: "var(--amber)",  dim: "var(--amber-dim)"  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getSummary(item: HistoryItem): string {
  const i = item.input_data;
  switch (item.feature_type) {
    case "last_night":   return `${i.subject} — ${i.hours} hours`;
    case "analogy":      return `${i.topic} (${i.subject})`;
    case "reality":      return `${i.subject} — ${i.actual_hours}h of ${i.planned_hours}h planned`;
    case "skill_income": return `${i.skill} (${i.level})`;
    default:             return "Session";
  }
}

// ── Last Night Detail ─────────────────────────────────────────
function LastNightDetail({ data }: { data: Record<string, unknown> }) {
  const mustStudy  = (data.must_study || data.priority_topics) as Array<Record<string,string>>;
  const crashPlan  = (data.crash_plan || data.study_plan)       as Array<Record<string,string>>;
  const quiz       = data.quick_quiz       as Array<Record<string,string>>;
  const highProb   = data.high_probability_topics as Array<Record<string,string>> | undefined;
  const skipThese  = data.skip_these as Array<Record<string,string>> | undefined;
  const tip        = data.survival_tip as string;
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setRevealed(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Survival tip */}
      <div style={{ background: "var(--purple-glow)", border: "1px solid rgba(124,92,252,0.22)", borderRadius: "var(--radius-lg)", padding: "18px 22px" }}>
        <p className="section-label" style={{ color: "var(--purple)", marginBottom: 8 }}>AURORA SAYS</p>
        <p style={{ fontSize: 15, fontStyle: "italic", lineHeight: 1.6 }}>"{tip}"</p>
      </div>

      {/* High probability topics — new entries only */}
      {highProb && highProb.length > 0 && (
        <div className="card">
          <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 14 }}>HIGH PROBABILITY TOPICS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {highProb.map((t, i) => (
              <div key={i} className="row-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{t.topic}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.reason}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: "rgba(245,158,11,0.2)", color: "var(--amber)", fontFamily: "var(--font-display)" }}>
                  {t.confidence?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Must study / priority topics */}
      {mustStudy && mustStudy.length > 0 && (
        <div className="card">
          <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 14 }}>
            {data.must_study ? "MUST STUDY" : "PRIORITY TOPICS"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mustStudy.map((t, i) => (
              <div key={i} className="row-item">
                <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: "var(--purple-dim)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{t.topic}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.why}</div>
                  {t.quick_tip && <div style={{ fontSize: 12, color: "var(--purple)", fontStyle: "italic", marginTop: 3 }}>Tip: {t.quick_tip}</div>}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0 }}>{t.time_allocation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skip these — new entries only */}
      {skipThese && skipThese.length > 0 && (
        <div className="card">
          <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 14 }}>SKIP THESE</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {skipThese.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-md)", background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.18)" }}>
                <span style={{ color: "var(--red)", fontWeight: 700 }}>✕</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{t.topic}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crash plan / study plan */}
      {crashPlan && crashPlan.length > 0 && (
        <div className="card">
          <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 14 }}>
            {data.crash_plan ? "CRASH PLAN" : "HOUR-BY-HOUR PLAN"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {crashPlan.map((slot, i) => (
              <div key={i} className="row-item">
                <span style={{ padding: "4px 10px", borderRadius: 6, background: "var(--purple-dim)", color: "var(--purple)", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
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
      )}

      {/* Quiz */}
      {quiz && quiz.length > 0 && (
        <div className="card">
          <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 14 }}>QUICK QUIZ</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quiz.map((q, i) => (
              <div key={i} onClick={() => toggle(i)} style={{
                padding: 14, borderRadius: "var(--radius-md)", cursor: "pointer",
                background: revealed.has(i) ? "var(--green-dim)" : "var(--bg-elevated)",
                border: `1px solid ${revealed.has(i) ? "rgba(34,197,94,0.28)" : "var(--border)"}`,
                transition: "all 0.2s",
              }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>Q{i + 1}. {q.question}</div>
                {revealed.has(i)
                  ? <div style={{ fontSize: 13, color: "var(--green)", marginTop: 8 }}>✓ {q.answer}</div>
                  : <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>Click to reveal</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Analogy Detail ────────────────────────────────────────────
function AnalogyDetail({ data }: { data: Record<string, unknown> }) {
  const analogies = data.analogies       as Array<Record<string,string>>;
  const mistakes  = data.common_mistakes as string[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Definition */}
      <div style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: "var(--radius-lg)", padding: "18px 22px" }}>
        <p className="section-label" style={{ color: "var(--blue)", marginBottom: 8 }}>SIMPLE DEFINITION</p>
        <p style={{ fontSize: 16, fontWeight: 500 }}>{data.simple_definition as string}</p>
      </div>

      {/* Analogies */}
      {analogies?.map((a, i) => (
        <div key={i} className="card">
          <p className="section-label" style={{ color: "var(--blue)", marginBottom: 10 }}>ANALOGY {i + 1} — {a.title}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="row-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <span className="section-label" style={{ color: "var(--text-3)", marginBottom: 6 }}>THE SCENARIO</span>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65 }}>{a.scenario}</p>
            </div>
            <div className="row-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <span className="section-label" style={{ color: "var(--text-3)", marginBottom: 6 }}>HOW IT CONNECTS</span>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65 }}>{a.explanation}</p>
            </div>
            <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: "var(--radius-md)", padding: 14 }}>
              <p className="section-label" style={{ color: "var(--blue)", marginBottom: 6 }}>REMEMBER THIS</p>
              <p style={{ fontSize: 15, fontWeight: 600, fontStyle: "italic" }}>"{a.memorable_line}"</p>
            </div>
          </div>
        </div>
      ))}

      {/* Mistakes */}
      <div className="card">
        <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 12 }}>COMMON MISTAKES</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mistakes?.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-md)", background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.18)" }}>
              <span style={{ color: "var(--red)", fontWeight: 700 }}>✕</span>
              <p style={{ fontSize: 14, color: "var(--text-2)" }}>{m}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Exam tip */}
      <div style={{ background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: "var(--radius-lg)", padding: "18px 22px" }}>
        <p className="section-label" style={{ color: "var(--green)", marginBottom: 8 }}>EXAM TIP</p>
        <p style={{ fontSize: 15, fontWeight: 500 }}>{data.exam_tip as string}</p>
      </div>
    </div>
  );
}

// ── Reality Detail ────────────────────────────────────────────
function RealityDetail({ data }: { data: Record<string, unknown> }) {
  const recovery     = data.recovery_plan as Array<Record<string,string>>;
  const consequences = data.consequences  as string[];
  const gradeColor   = (g: string) => {
    const map: Record<string,string> = { A: "var(--green)", B: "var(--blue)", C: "var(--amber)", D: "#f97316", F: "var(--red)" };
    return map[g] ?? "var(--text-2)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Grade + Completion */}
      <div className="grid-2">
        {[
          { label: "PREDICTED GRADE",  value: data.performance_prediction as string },
          { label: "COMPLETION RATE",  value: `${Math.round(data.completion_rate as number)}%` },
        ].map(item => (
          <div key={item.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "24px", textAlign: "center" }}>
            <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 10 }}>{item.label}</p>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2.5rem, 7vw, 4rem)", color: gradeColor(data.performance_prediction as string) }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Reality check */}
      <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: "var(--radius-lg)", padding: "18px 22px" }}>
        <p className="section-label" style={{ color: "var(--green)", marginBottom: 8 }}>REALITY CHECK</p>
        <p style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 8 }}>{data.reality_check as string}</p>
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>{data.prediction_reason as string}</p>
      </div>

      {/* Consequences */}
      <div className="card">
        <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 12 }}>IF YOU DON'T CHANGE COURSE</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {consequences?.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-md)", background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.18)" }}>
              <span style={{ color: "var(--red)" }}>→</span>
              <p style={{ fontSize: 14, color: "var(--text-2)" }}>{c}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery plan */}
      <div className="card">
        <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 12 }}>RECOVERY PLAN</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recovery?.map((r, i) => (
            <div key={i} className="row-item">
              <div style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: r.impact === "high" ? "rgba(34,197,94,0.2)" : r.impact === "medium" ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.08)",
                color: r.impact === "high" ? "var(--green)" : r.impact === "medium" ? "var(--amber)" : "var(--text-3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
              }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 3 }}>{r.action}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{r.time_needed}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5,
                background: r.impact === "high" ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)",
                color: r.impact === "high" ? "var(--green)" : "var(--amber)",
                fontFamily: "var(--font-display)",
              }}>{r.impact?.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational truth */}
      <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: "var(--radius-lg)", padding: "18px 22px" }}>
        <p className="section-label" style={{ color: "var(--green)", marginBottom: 8 }}>AURORA'S TRUTH</p>
        <p style={{ fontSize: 15, fontWeight: 500, fontStyle: "italic" }}>"{data.motivational_truth as string}"</p>
      </div>
    </div>
  );
}

// ── Skill Income Detail ───────────────────────────────────────
function SkillIncomeDetail({ data }: { data: Record<string, unknown> }) {
  const paths   = data.earning_paths  as Array<Record<string,string>>;
  const plan    = data.seven_day_plan as Array<Record<string,unknown>>;
  const income  = data.income_potential as Record<string,string>;
  const diffColor = (d: string) => d === "easy" ? "var(--green)" : d === "medium" ? "var(--amber)" : "var(--red)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Income potential */}
      <div className="grid-3">
        {[
          { label: "MIN / MONTH",  value: income?.minimum,  color: "var(--amber)" },
          { label: "MAX / MONTH",  value: income?.maximum,  color: "var(--green)" },
          { label: "FIRST INCOME", value: income?.timeline, color: "var(--blue)"  },
        ].map(item => (
          <div key={item.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "20px 14px", textAlign: "center" }}>
            <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 8 }}>{item.label}</p>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Earning paths */}
      <div className="card">
        <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 14 }}>EARNING PATHS</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {paths?.map((p, i) => (
            <div key={i} className="row-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: diffColor(p.difficulty) + "22", color: diffColor(p.difficulty), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11 }}>{i + 1}</div>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{p.path}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 5, background: diffColor(p.difficulty) + "22", color: diffColor(p.difficulty), fontFamily: "var(--font-display)" }}>{p.difficulty?.toUpperCase()}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)" }}>{p.realistic_earning}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 8 }}>{p.how_it_works}</p>
              <div style={{ display: "flex", gap: 14 }}>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>📍 {p.platform}</span>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>👤 {p.best_for}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7 day plan */}
      <div className="card">
        <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 14 }}>7-DAY LAUNCH PLAN</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {plan?.map((d) => (
            <div key={d.day as number} className="row-item">
              <span style={{ padding: "4px 10px", borderRadius: 6, background: "var(--amber-dim)", color: "var(--amber)", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
                Day {d.day as number}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 3 }}>{d.task as string}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{d.time_needed as string} · {d.outcome as string}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* First client + Biggest mistake */}
      <div className="grid-2">
        <div style={{ background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: "var(--radius-xl)", padding: "20px 22px" }}>
          <p className="section-label" style={{ color: "var(--green)", marginBottom: 8 }}>GET YOUR FIRST CLIENT</p>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{data.first_client_strategy as string}</p>
        </div>
        <div style={{ background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "var(--radius-xl)", padding: "20px 22px" }}>
          <p className="section-label" style={{ color: "var(--red)", marginBottom: 8 }}>BIGGEST MISTAKE</p>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{data.biggest_mistake as string}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main History Page ─────────────────────────────────────────
export default function HistoryPage() {
  const [history,  setHistory]  = useState<HistoryItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) { window.location.href = "/login"; return; }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await apiGet<HistoryItem[]>("/api/history/");
      setHistory(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load history");
    } finally { setLoading(false); }
  };

  function getSummary(item: HistoryItem): string {
    const i = item.input_data;
    switch (item.feature_type) {
      case "last_night":   return `${i.subject} — ${i.hours} hours`;
      case "analogy":      return `${i.topic} (${i.subject})`;
      case "reality":      return `${i.subject} — ${i.actual_hours}h of ${i.planned_hours}h planned`;
      case "skill_income": return `${i.skill} (${i.level})`;
      default:             return "Session";
    }
  }

  // ── Detail view ──
  if (selected) {
    const cfg = FEATURE_CONFIG[selected.feature_type];
    return (
      <div className="page-wrap">
        <Header />
        <main className="page-content">
          {/* Back button */}
          <button onClick={() => setSelected(null)} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-2)", fontSize: 14, fontFamily: "var(--font-body)",
            marginBottom: 24, padding: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to History
          </button>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <span className="tag-badge" style={{ background: cfg.dim, color: cfg.color, marginBottom: 12, display: "inline-flex" }}>
              {cfg.label}
            </span>
            <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 6 }}>
              {getSummary(selected)}
            </h1>
            <p style={{ color: "var(--text-3)", fontSize: 13 }}>{formatDate(selected.created_at)}</p>
          </div>

          {/* Full detail based on feature type */}
          {selected.feature_type === "last_night"   && <LastNightDetail   data={selected.output_data} />}
          {selected.feature_type === "analogy"      && <AnalogyDetail     data={selected.output_data} />}
          {selected.feature_type === "reality"      && <RealityDetail     data={selected.output_data} />}
          {selected.feature_type === "skill_income" && <SkillIncomeDetail data={selected.output_data} />}
        </main>
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="page-wrap">
      <Header />
      <main className="page-content">

        <div style={{ marginBottom: 36 }}>
          <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 12 }}>HISTORY</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, marginBottom: 10 }}>
            Your past sessions
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15 }}>
            Click any session to see the full result.
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)" }}>
            <div className="spin" style={{ margin: "0 auto 16px" }}/>
            Loading your history...
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        {!loading && !error && history.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
          }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 8 }}>No history yet</h2>
            <p style={{ color: "var(--text-2)", marginBottom: 24 }}>Use any feature and results will be saved here.</p>
            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: "var(--radius-md)",
              background: "var(--purple)", color: "white",
              fontFamily: "var(--font-display)", fontWeight: 600,
              fontSize: 14, textDecoration: "none",
            }}>Go to Dashboard</Link>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 8 }}>
              {Object.entries(FEATURE_CONFIG).map(([key, cfg]) => {
                const count = history.filter(h => h.feature_type === key).length;
                return (
                  <div key={key} style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)", padding: "14px", textAlign: "center",
                  }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: cfg.color, marginBottom: 4 }}>{count}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{cfg.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Items */}
            {history.map((item) => {
              const cfg = FEATURE_CONFIG[item.feature_type];
              return (
                <div key={item.id} onClick={() => setSelected(item)} style={{
  display: "flex", alignItems: "center",
  justifyContent: "space-between",
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)", padding: "14px 16px",
  cursor: "pointer", gap: 8,
  transition: "border-color 0.2s, transform 0.15s",
  overflow: "hidden", width: "100%",
}}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-md)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1, overflow: "hidden" }}>
  <span className="tag-badge" style={{ background: cfg.dim, color: cfg.color, flexShrink: 0, fontSize: 9 }}>
    {cfg.label}
  </span>
                    <span style={{ 
  fontSize: 13, 
  fontWeight: 500, 
  overflow: "hidden", 
  textOverflow: "ellipsis", 
  whiteSpace: "nowrap",
  maxWidth: "100%",
  display: "block",
}}>
  {getSummary(item)}
</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)",display: "none" }} className="history-date">{formatDate(item.created_at)}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}