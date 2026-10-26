import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in • MoukawilOS" };

export default async function SignInPage() {
  if (await getSession()) redirect("/dashboard");
  return <SignInForm />;
}
