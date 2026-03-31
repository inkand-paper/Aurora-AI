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

export default function RegisterPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

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
            Join AURORA — it's completely free
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
              <input className="text-input" type="password" placeholder="Min. 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && register()} />
            </div>
          </div>

          {error && (
            <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>
          )}

          <button className="btn" onClick={register}
            disabled={loading || !name || !email || !password}
            style={{ background: "var(--purple)", marginBottom: 20 }}>
            {loading
              ? <><span className="spin"/> Creating account...</>
              : "Create Account"}
          </button>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-2)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--purple)", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms note */}
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-3)", marginTop: 20 }}>
          By signing up you agree to use AURORA responsibly.
        </p>
      </div>
    </div>
  );
}