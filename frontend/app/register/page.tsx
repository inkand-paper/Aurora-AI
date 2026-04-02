"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveAuth } from "../../lib/auth";
import { apiPost } from "../../lib/api";

interface AuthResponse {
  access_token: string;
  user: { id: number; name: string; email: string };
}

const IconEye = ({ show }: { show: boolean }) => show ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const register = async () => {
    if (!name || !email || !password) return;
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const data = await apiPost<AuthResponse>("/api/auth/register", { name, email, password });
      saveAuth(data.access_token, data.user);
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-base)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "var(--purple)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: 20, color: "white", margin: "0 auto 16px",
            }}>A</div>
          </Link>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", marginBottom: 8 }}>
            Create your account
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Join AURORA — it&apos;s completely free
          </p>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>

            <div>
              <label className="field-label">Full Name</label>
              <input className="text-input" type="text" placeholder="Your name"
                value={name} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && register()} />
            </div>

            <div>
              <label className="field-label">Email</label>
              <input className="text-input" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && register()} />
            </div>

            <div>
              <label className="field-label">Password</label>
              <div style={{ position: "relative" }}>
                <input className="text-input" type={showPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && register()}
                  style={{ paddingRight: 44 }} />
                <button onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none",
                  color: "var(--text-3)", cursor: "pointer",
                  display: "flex", alignItems: "center",
                  padding: 0,
                }}>
                  <IconEye show={showPass} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>
          )}

          <button className="btn" onClick={register}
            disabled={loading || !name || !email || !password}
            style={{ background: "var(--purple)", marginBottom: 20 }}>
            {loading ? <><span className="spin"/> Creating account...</> : "Create Account"}
          </button>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-2)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--purple)", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-3)", marginTop: 20 }}>
          By signing up you agree to use AURORA responsibly.
        </p>
      </div>
    </div>
  );
}