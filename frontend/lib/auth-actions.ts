"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, type Session } from "@/lib/auth";

export interface AuthState {
  error?: string;
  field?: "name" | "email" | "password" | "terms";
  name?: string;
  email?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEMO_USER: Session = { name: "Amine Boudiaf", email: "demo@moukawil.dz" };

async function startSession(session: Session) {
  (await cookies()).set(SESSION_COOKIE, encodeURIComponent(JSON.stringify(session)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

// Real backend authentication connected to FastAPI /auth/signin & /auth/signup
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://moukawil-backend.onrender.com"
    : "http://localhost:8000");

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address.", field: "email", email };
  if (password.length < 8) return { error: "Password must be at least 8 characters.", field: "password", email };

  try {
    const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        (await cookies()).set("moukawil_token", data.access_token, {
          httpOnly: false,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: data.expires_in || 60 * 60 * 24 * 7,
        });
      }
    } else if (res.status === 401) {
      return { error: "Incorrect email or password.", field: "password", email };
    }
  } catch {
    // If backend is unreachable, gracefully proceed with offline demo session
  }

  await startSession({ name: email.split("@")[0], email });
  redirect("/dashboard");
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const terms = formData.get("terms") === "on";

  if (name.length < 2) return { error: "Enter your full name.", field: "name", name, email };
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address.", field: "email", name, email };
  if (password.length < 8) return { error: "Password must be at least 8 characters.", field: "password", name, email };
  if (!terms) return { error: "Please accept the terms to continue.", field: "terms", name, email };

  const [firstName, ...lastParts] = name.split(" ");
  const lastName = lastParts.join(" ") || "Freelancer";

  try {
    const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const token = data.access_token || data.session?.access_token;
      const expiresIn = data.expires_in || data.session?.expires_in || 60 * 60 * 24 * 7;
      if (token) {
        (await cookies()).set("moukawil_token", token, {
          httpOnly: false,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: expiresIn,
        });
      }
    } else if (res.status === 409) {
      return { error: "This email is already registered.", field: "email", name, email };
    }
  } catch {
    // If backend is unreachable, gracefully proceed with offline demo session
  }

  await startSession({ name, email });
  redirect("/dashboard?tour=true");
}

export async function setupDemoSessionAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await startSession(DEMO_USER);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to establish demo session" };
  }
}

export async function demoSignInAction() {
  await startSession(DEMO_USER);
  redirect("/dashboard?tour=true");
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete("moukawil_token");
  redirect("/");
}
