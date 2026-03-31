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

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const login = async () => {
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      const data = await apiPost<AuthResponse>("/api/auth/login", { email, password });
      saveAuth(data.access_token, data.user);
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
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
            Welcome back
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Sign in to your AURORA account
          </p>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>

            <div>
              <label className="field-label">Email</label>
              <input className="text-input" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()} />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input className="text-input" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()} />
            </div>
          </div>

          {error && (
            <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>
          )}

          <button className="btn" onClick={login}
            disabled={loading || !email || !password}
            style={{ background: "var(--purple)", marginBottom: 20 }}>
            {loading
              ? <><span className="spin"/> Signing in...</>
              : "Sign In"}
          </button>

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--text-2)" }}>
            Don't have an account?{" "}
            <Link href="/register" style={{ color: "var(--purple)", fontWeight: 600, textDecoration: "none" }}>
              Sign up free
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}