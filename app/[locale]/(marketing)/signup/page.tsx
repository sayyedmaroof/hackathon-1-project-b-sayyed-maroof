import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Keep the fares you flip. This preview does not create a real account.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
