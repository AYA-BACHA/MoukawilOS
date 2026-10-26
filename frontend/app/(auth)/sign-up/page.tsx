import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account • MoukawilOS" };

export default async function SignUpPage() {
  if (await getSession()) redirect("/dashboard");
  return <SignUpForm />;
}
