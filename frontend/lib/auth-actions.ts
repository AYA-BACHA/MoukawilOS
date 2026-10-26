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

// NOTE: demo authentication. Credentials are validated for shape only and no account is stored.
// Swap the body of these actions for your real provider once the backend auth is available.
export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address.", field: "email", email };
  if (password.length < 8) return { error: "Password must be at least 8 characters.", field: "password", email };

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

  await startSession({ name, email });
  redirect("/dashboard");
}

export async function demoSignInAction() {
  await startSession(DEMO_USER);
  redirect("/dashboard");
}

export async function signOutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}
