"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/last-night",   label: "Last Night" },
  { href: "/analogy",      label: "Analogy" },
  { href: "/reality",      label: "Reality" },
  { href: "/skill-income", label: "Skill → Income" },
];

export default function Header() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <>
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(8,8,16,0.82)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}>

          {/* ── Logo ── */}
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 9,
            textDecoration: "none", flexShrink: 0,
          }}>
            <div style={{
              width: 31, height: 31,
              borderRadius: 9,
              background: "var(--purple)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: 15, color: "white",
            }}>A</div>
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: 16,
              color: "var(--text-1)",
            }}>AURORA</span>
          </Link>

          {/* ── Center nav (hidden on mobile) ── */}
          <nav id="header-nav" style={{
            display: "flex", alignItems: "center",
            gap: 2, flex: 1, justifyContent: "center",
          }}>
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{
                  padding: "6px 13px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  fontFamily: "var(--font-body)",
                  color: active ? "var(--text-1)" : "var(--text-2)",
                  background: active ? "var(--bg-elevated)" : "transparent",
                  border: active ? "1px solid var(--border-md)" : "1px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right button ── */}
          {isLanding ? (
            <Link href="/dashboard" style={{
              padding: "8px 18px",
              borderRadius: 9,
              background: "var(--purple)",
              color: "white",
              fontSize: 13, fontWeight: 600,
              fontFamily: "var(--font-display)",
              textDecoration: "none",
              flexShrink: 0,
            }}>
              Dashboard
            </Link>
          ) : (
            <Link href="/dashboard" style={{
              padding: "8px 16px",
              borderRadius: 9,
              background: "var(--bg-elevated)",
              color: "var(--text-2)",
              fontSize: 13, fontWeight: 500,
              fontFamily: "var(--font-body)",
              textDecoration: "none",
              border: "1px solid var(--border)",
              flexShrink: 0,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Dashboard
            </Link>
          )}
        </div>
      </header>

      {/* Hide center nav on mobile */}
      <style>{`
        @media (max-width: 660px) {
          #header-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}