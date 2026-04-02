"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { getUser, saveAuth, getToken, AuthUser } from "../../lib/auth";
import { apiPost, apiGet } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [name,    setName]    = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");
  const [coins,   setCoins]   = useState<number | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    setName(u.name);
    // Load coin balance
    apiGet<{ balance: number }>("/api/coins/balance")
      .then((d) => setCoins(d.balance))
      .catch(() => setCoins(0));
  }, [router]);

  const updateProfile = async () => {
    if (!name.trim()) return;
    setLoading(true); setError(""); setSuccess("");
    try {
      const data = await apiPost<AuthUser>("/api/auth/update-profile", { name });
      const token = getToken() || "";
      saveAuth(token, data);
      setUser(data);
      setSuccess("Profile updated successfully!");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="page-wrap">
      <Header />
      <main className="page-content" style={{ maxWidth: 560 }}>

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <p className="section-label" style={{ color: "var(--text-3)", marginBottom: 12 }}>
            ACCOUNT
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, marginBottom: 10 }}>
            Your Profile
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 15 }}>
            Manage your account details.
          </p>
        </div>

        {/* Avatar + name */}
        <div style={{
          display: "flex", alignItems: "center", gap: 18,
          marginBottom: 32, padding: "20px 24px",
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "var(--purple)", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24,
            flexShrink: 0,
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
              {user.name}
            </div>
            <div style={{ fontSize: 14, color: "var(--text-2)" }}>{user.email}</div>
          </div>
        </div>

        {/* Edit form */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
            Edit Profile
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
            <div>
              <label className="field-label">Full Name</label>
              <input className="text-input" type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && updateProfile()} />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input className="text-input" type="email" value={user.email}
                disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>
                Email cannot be changed
              </p>
            </div>
          </div>

          {success && (
            <div style={{
              background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: "var(--radius-md)", padding: "12px 16px",
              color: "var(--green)", fontSize: 14, marginBottom: 16,
            }}>
              {success}
            </div>
          )}

          {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}

          <button className="btn" onClick={updateProfile}
            disabled={loading || !name.trim() || name === user.name}
            style={{ background: "var(--purple)" }}>
            {loading ? <><span className="spin"/> Saving...</> : "Save Changes"}
          </button>
        </div>

        {/* Account info */}
        <div className="card">
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
            Account Info
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "User ID",  value: `#${user.id}` },
              { label: "Email",    value: user.email },
              { label: "Plan",     value: "Free" },
              { label: "Aurora Coins", value: coins !== null ? `${coins} coins` : "…" },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "12px 16px",
                background: "var(--bg-elevated)", borderRadius: "var(--radius-md)",
              }}>
                <span style={{ fontSize: 14, color: "var(--text-2)" }}>{item.label}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}