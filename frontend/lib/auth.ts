import { cookies } from "next/headers";

export const SESSION_COOKIE = "moukawil_session";

export interface Session {
  name: string;
  email: string;
}

/** Reads the demo session cookie. Replace with your real auth provider (Supabase, NextAuth...) when the backend is ready. */
export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<Session>;
    return parsed.email ? { name: parsed.name ?? "", email: parsed.email } : null;
  } catch {
    return null;
  }
}
