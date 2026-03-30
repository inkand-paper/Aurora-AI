"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "../components/Header";

// ── Rotating headline words ──────────────────────────────────
const WORDS  = ["Survive.", "Understand.", "Improve.", "Earn."];
const COLORS = ["var(--purple)", "var(--blue)", "var(--green)", "var(--amber)"];

// ── Feature list ─────────────────────────────────────────────
const FEATURES = [
  {
    title: "Last Night Mode",
    desc:  "Hours before your exam? Get a compressed study plan, ranked topics, and a self-test quiz — instantly.",
    href:  "/last-night",
    color: "var(--purple)",
    dim:   "var(--purple-dim)",
    tag:   "PANIC MODE",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
  },
  {
    title: "Analogy Generator",
    desc:  "Stuck on a concept? AURORA turns complex theory into real-life analogies that actually stick.",
    href:  "/analogy",
    color: "var(--blue)",
    dim:   "var(--blue-dim)",
    tag:   "UNDERSTAND",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="18" x2="15" y2="18"/>
        <line x1="10" y1="22" x2="14" y2="22"/>
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
      </svg>
    ),
  },
  {
    title: "Reality Mode",
    desc:  "Planned 10 hours, studied 3? AURORA shows where you stand and exactly how to recover.",
    href:  "/reality",
    color: "var(--green)",
    dim:   "var(--green-dim)",
    tag:   "TRACK",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    title: "Skill → Income",
    desc:  "Turn what you already know into freelance income. Get a 7-day execution plan for your skill level.",
    href:  "/skill-income",
    color: "var(--amber)",
    dim:   "var(--amber-dim)",
    tag:   "EARN",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
];

const STATS = [
  { value: "4",    label: "AI Features" },
  { value: "10s",  label: "To get a plan" },
  { value: "Free", label: "Groq-powered" },
  { value: "24/7", label: "Always available" },
];

// ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx((i) => (i + 1) % WORDS.length); setVisible(true); }, 350);
    }, 2300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page-wrap">
      <Header />

      {/* Ambient purple glow behind hero */}
      <div style={{
        position: "fixed", top: "8%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 420,
        background: "radial-gradient(ellipse, rgba(124,92,252,0.07) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <main style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 24px 100px", textAlign: "center" }}>

          {/* Live badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--bg-card)", border: "1px solid var(--border-md)",
            borderRadius: 100, padding: "7px 16px", marginBottom: 40,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "var(--green)",
              display: "inline-block", animation: "livePulse 2s ease infinite",
            }}/>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>
              AI-Powered Academic Survival System
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.6rem)", fontWeight: 800, marginBottom: 20 }}>
            Stop Panicking.
            <br />
            <span style={{
              color: COLORS[idx],
              opacity: visible ? 1 : 0,
              display: "inline-block",
              transition: "opacity 0.35s ease, color 0.35s ease",
            }}>
              {WORDS[idx]}
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)", color: "var(--text-2)",
            maxWidth: 520, margin: "0 auto 44px", lineHeight: 1.75,
          }}>
            Your AI co-pilot for last-minute exam prep, understanding hard concepts,
            tracking study habits, and monetising your skills.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
            <Link href="/last-night" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 26px", borderRadius: "var(--radius-md)",
              background: "var(--purple)", color: "white",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15,
              textDecoration: "none", transition: "opacity 0.2s",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              Exam Tomorrow? Start Here
            </Link>
            <Link href="/dashboard" className="btn-outline">
              Explore All Features
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid-4" style={{ maxWidth: 500, margin: "0 auto" }}>
            {STATS.map((s) => (
              <div key={s.label} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", padding: "16px 10px", textAlign: "center",
              }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--purple)", marginBottom: 4 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────── */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>

          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 12 }}>
              FEATURES
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700 }}>
              Everything a student needs
            </h2>
          </div>

          <div className="grid-2" style={{ gap: 16 }}>
            {FEATURES.map((f) => (
  <Link 
    key={f.title} 
    href={f.href} 
    className="feature-card" 
    style={{
      display: "block",
      background: "var(--bg-card)", 
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl)", 
      padding: "28px",
      textDecoration: "none",
      transition: "all 0.2s ease", 
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: f.dim, color: f.color,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {f.icon}
      </div>
      <span className="tag-badge" style={{ background: f.dim, color: f.color }}>
        {f.tag}
      </span>
    </div>
    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, marginBottom: 10, color: "var(--text-1)" }}>
      {f.title}
    </h3>
    <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 20 }}>
      {f.desc}
    </p>
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: f.color, fontFamily: "var(--font-display)" }}>
      Try now
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
      </svg>
    </div>
  </Link>
))}{FEATURES.map((f) => (
  <Link 
  key={f.title} 
  href={f.href} 
  className="feature-card" // This handles the hover via the <style> tag below
  style={{
    display: "block",
    background: "var(--bg-card)", 
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-xl)", 
    padding: "28px",
    textDecoration: "none",
    transition: "all 0.2s ease", 
  }}
>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: f.dim, color: f.color,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {f.icon}
      </div>
      <span className="tag-badge" style={{ background: f.dim, color: f.color }}>
        {f.tag}
      </span>
    </div>
    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, marginBottom: 10, color: "var(--text-1)" }}>
      {f.title}
    </h3>
    <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 20 }}>
      {f.desc}
    </p>
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: f.color, fontFamily: "var(--font-display)" }}>
      Try now
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
      </svg>
    </div>
  </Link>
))}
          </div>
        </section>

        {/* ── BOTTOM CTA ───────────────────────────────────── */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)", padding: "clamp(40px, 6vw, 72px)",
            textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            {/* inner glow */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400, height: 200,
              background: "radial-gradient(ellipse, rgba(124,92,252,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}/>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700, marginBottom: 16, position: "relative" }}>
              Ready to survive your semester?
            </h2>
            <p style={{ color: "var(--text-2)", marginBottom: 36, fontSize: 16, position: "relative" }}>
              Built for students who refuse to give up.
            </p>
            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 30px", borderRadius: "var(--radius-md)",
              background: "var(--purple)", color: "white",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15,
              textDecoration: "none", position: "relative",
            }}>
              Open Dashboard
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>
        AURORA — AI Academic Survival System
      </footer>

      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.35} }

        /* The fix for your hover effect */
        .feature-card:hover {
          border-color: var(--border-md) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
