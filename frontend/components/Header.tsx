"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, logout, AuthUser } from "../lib/auth";
import { apiGet } from "../lib/api";

const navLinks = [
  { href: "/last-night",   label: "Last Night" },
  { href: "/analogy",      label: "Analogy" },
  { href: "/reality",      label: "Reality" },
  { href: "/skill-income", label: "Skill → Income" },
  { href: "/ai-client",    label: "AI Client" },
  { href: "/history",      label: "History" },
];

export default function Header() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [user,     setUser]     = useState<AuthUser | null>(() => getUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [coins,    setCoins]    = useState<number | null>(null);

  // Track window width with JS — 100% reliable
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 860);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch coin balance whenever user changes
  useEffect(() => {
    if (!user) { setCoins(null); return; }
    apiGet<{ balance: number }>("/api/coins/balance")
      .then((d) => setCoins(d.balance))
      .catch(() => setCoins(null));
  }, [user]);

  // Close menu on route change (avoid setState synchronously in effect)
  useEffect(() => {
    const id = window.setTimeout(() => setMenuOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      const header = document.getElementById("aurora-header");
      if (header && !header.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setCoins(null);
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <header id="aurora-header" style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(8,8,16,0.95)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>

      {/* ── Main bar ── */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "0 20px", height: 58,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12,
      }}>

        {/* Logo — always visible */}
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 9,
          textDecoration: "none", flexShrink: 0,
        }}>
          <div style={{
            width: 31, height: 31, borderRadius: 9,
            background: "var(--purple)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: 15, color: "white",
          }}>A</div>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 16, color: "var(--text-1)",
          }}>AURORA</span>
        </Link>

        {/* Desktop nav — only when NOT mobile */}
        {!isMobile && (
          <nav style={{
            display: "flex", alignItems: "center",
            gap: 2, flex: 1, justifyContent: "center",
          }}>
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{
                  padding: "6px 11px", borderRadius: 8,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--text-1)" : "var(--text-2)",
                  background: active ? "var(--bg-elevated)" : "transparent",
                  border: active ? "1px solid var(--border-md)" : "1px solid transparent",
                  textDecoration: "none", transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Desktop right — only when NOT mobile */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {user ? (
              <>
                <Link href="/account" style={{
                  fontSize: 13, color: "var(--text-2)",
                  textDecoration: "none", padding: "6px 10px",
                  borderRadius: 8, whiteSpace: "nowrap",
                  transition: "color 0.15s",
                }}>
                  Hi, {user.name.split(" ")[0]}
                </Link>
                {coins !== null && (
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: "var(--amber)",
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 7, padding: "4px 9px",
                    fontFamily: "var(--font-display)",
                    whiteSpace: "nowrap",
                  }}>
                    ⚡ {coins}
                  </span>
                )}
                <button onClick={handleLogout} style={{
                  padding: "7px 14px", borderRadius: 8,
                  background: "var(--bg-elevated)", color: "var(--text-2)",
                  fontSize: 13, fontWeight: 500,
                  border: "1px solid var(--border)",
                  cursor: "pointer", fontFamily: "var(--font-body)",
                }}>Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login" style={{
                  padding: "7px 14px", borderRadius: 8,
                  background: "var(--bg-elevated)", color: "var(--text-2)",
                  fontSize: 13, fontWeight: 500,
                  textDecoration: "none", border: "1px solid var(--border)",
                }}>Sign in</Link>
                <Link href="/register" style={{
                  padding: "7px 14px", borderRadius: 8,
                  background: "var(--purple)", color: "white",
                  fontSize: 13, fontWeight: 600,
                  textDecoration: "none", fontFamily: "var(--font-display)",
                }}>Sign up</Link>
              </>
            )}
          </div>
        )}

        {/* Mobile hamburger — only when mobile */}
        {isMobile && (
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            style={{
              background: menuOpen ? "var(--bg-elevated)" : "transparent",
              border: "1px solid var(--border-md)",
              borderRadius: 8, padding: "7px 10px",
              cursor: "pointer", color: "var(--text-1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s", flexShrink: 0,
            }}>
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6"  x2="6"  y2="18"/>
                <line x1="6"  y1="6"  x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {/* ── Mobile dropdown — only when mobile AND menu open ── */}
      {isMobile && menuOpen && (
        <div style={{
          background: "rgba(8,8,16,0.98)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 16px 20px",
        }}>

          {/* Nav links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 14 }}>
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: "12px 14px", borderRadius: 10,
                    fontSize: 15, fontWeight: active ? 600 : 400,
                    color: active ? "var(--text-1)" : "var(--text-2)",
                    background: active ? "var(--bg-elevated)" : "transparent",
                    textDecoration: "none", display: "block",
                    transition: "background 0.15s",
                  }}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", marginBottom: 14 }}/>

          {/* User section */}
          {user ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

              {/* Profile row */}
              <Link href="/account" onClick={() => setMenuOpen(false)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 10,
                textDecoration: "none", transition: "background 0.15s",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--purple)", color: "white", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 14 }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{user.email}</div>
                </div>
              </Link>

              {/* Sign out */}
              <button onClick={handleLogout} style={{
                padding: "12px 14px", borderRadius: 10, width: "100%",
                background: "var(--red-dim)", color: "var(--red)",
                fontSize: 14, fontWeight: 500,
                border: "1px solid rgba(239,68,68,0.2)",
                cursor: "pointer", textAlign: "left",
                fontFamily: "var(--font-body)",
              }}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                padding: "13px 14px", borderRadius: 10, textAlign: "center",
                background: "var(--bg-elevated)", color: "var(--text-1)",
                fontSize: 14, fontWeight: 500, textDecoration: "none",
                border: "1px solid var(--border)",
              }}>Sign in</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} style={{
                padding: "13px 14px", borderRadius: 10, textAlign: "center",
                background: "var(--purple)", color: "white",
                fontSize: 14, fontWeight: 600, textDecoration: "none",
                fontFamily: "var(--font-display)",
              }}>Sign up free</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}