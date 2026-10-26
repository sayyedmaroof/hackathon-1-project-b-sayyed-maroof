import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Come back to the fares you flipped.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
