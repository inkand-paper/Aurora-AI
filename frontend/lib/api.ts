const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Get token from localStorage ──
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aurora_token");
}

// ── Main API helper — sends token automatically ──
export async function apiPost<T>(endpoint: string, body: object): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data as T;
}

// ── GET request helper (for history page) ──
export async function apiGet<T>(endpoint: string): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data as T;
}