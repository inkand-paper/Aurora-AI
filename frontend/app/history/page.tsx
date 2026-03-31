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

// ── Feature display config ────────────────────────────────────
const FEATURE_CONFIG: Record<string, { label: string; color: string; dim: string }> = {
  last_night:   { label: "Last Night Mode",    color: "var(--purple)", dim: "var(--purple-dim)" },
  analogy:      { label: "Analogy Generator",  color: "var(--blue)",   dim: "var(--blue-dim)"   },
  reality:      { label: "Reality Mode",       color: "var(--green)",  dim: "var(--green-dim)"  },
  skill_income: { label: "Skill → Income",     color: "var(--amber)",  dim: "var(--amber-dim)"  },
};

// ── Format date ───────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Get summary line per feature ──────────────────────────────
function getSummary(item: HistoryItem): string {
  const i = item.input_data;
  switch (item.feature_type) {
    case "last_night":   return `${i.subject} — ${i.hours} hours`;
    case "analogy":      return `${i.topic} (${i.subject})`;
    case "reality":      return `${i.subject} — ${i.actual_hours}h of ${i.planned_hours}h planned`;
    case "skill_income": return `${i.skill} (${i.level})`;
    default:             return "Unknown feature";
  }
}

// ─────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [history,  setHistory]  = useState<HistoryItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }
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

  const toggleExpand = (id: number) =>
    setExpanded(prev => prev === id ? null : id);

  return (
    <div className="page-wrap">
      <Header />
      <main className="page-content">

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 12 }}>
            HISTORY
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, marginBottom: 10 }}>
            Your past sessions
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15 }}>
            Every AI session you've run — all saved here.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)" }}>
            <span className="spin" style={{ margin: "0 auto 16px", display: "block" }}/>
            Loading your history...
          </div>
        )}

        {/* Error */}
        {error && <div className="error-box">{error}</div>}

        {/* Empty state */}
        {!loading && !error && history.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 8 }}>
              No history yet
            </h2>
            <p style={{ color: "var(--text-2)", marginBottom: 24 }}>
              Use any feature and your results will be saved here automatically.
            </p>
            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: "var(--radius-md)",
              background: "var(--purple)", color: "white",
              fontFamily: "var(--font-display)", fontWeight: 600,
              fontSize: 14, textDecoration: "none",
            }}>
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* History list */}
        {!loading && history.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Stats row */}
            <div className="grid-4" style={{ marginBottom: 8 }}>
              {Object.entries(FEATURE_CONFIG).map(([key, cfg]) => {
                const count = history.filter(h => h.feature_type === key).length;
                return (
                  <div key={key} style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)", padding: "14px", textAlign: "center",
                  }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: cfg.color, marginBottom: 4 }}>
                      {count}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{cfg.label}</div>
                  </div>
                );
              })}
            </div>

            {/* History items */}
            {history.map((item) => {
              const cfg = FEATURE_CONFIG[item.feature_type];
              const isOpen = expanded === item.id;
              return (
                <div key={item.id} style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)", overflow: "hidden",
                  transition: "border-color 0.2s",
                }}>
                  {/* Header row */}
                  <div onClick={() => toggleExpand(item.id)} style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px", cursor: "pointer",
                    gap: 12,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <span className="tag-badge" style={{ background: cfg.dim, color: cfg.color, flexShrink: 0 }}>
                        {cfg.label}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {getSummary(item)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                        {formatDate(item.created_at)}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)" }}>
                      <div className="grid-2" style={{ marginTop: 16, gap: 12 }}>
                        <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: 16 }}>
                          <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 10 }}>INPUT</p>
                          {Object.entries(item.input_data).map(([k, v]) => (
                            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                              <span style={{ color: "var(--text-2)" }}>{k.replace(/_/g, " ")}</span>
                              <span style={{ color: "var(--text-1)", fontWeight: 500 }}>{String(v)}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: 16 }}>
                          <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 10 }}>OUTPUT PREVIEW</p>
                          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                            {item.feature_type === "last_night" && (item.output_data.survival_tip as string)}
                            {item.feature_type === "analogy" && (item.output_data.simple_definition as string)}
                            {item.feature_type === "reality" && `Grade: ${item.output_data.performance_prediction} — ${item.output_data.reality_check}`}
                            {item.feature_type === "skill_income" && `Min: ${(item.output_data.income_potential as Record<string, string>)?.minimum} · Max: ${(item.output_data.income_potential as Record<string, string>)?.maximum}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}