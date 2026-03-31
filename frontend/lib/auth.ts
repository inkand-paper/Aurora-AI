// Manages JWT token and user state across the app

const TOKEN_KEY = "aurora_token";
const USER_KEY  = "aurora_user";

export interface AuthUser {
  id:    number;
  name:  string;
  email: string;
}

// ── Save after login/register ──
export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ── Get token for API calls ──
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// ── Get current user ──
export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ── Check if logged in ──
export function isLoggedIn(): boolean {
  return !!getToken();
}

// ── Logout ──
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}