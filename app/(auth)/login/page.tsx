import { LoginForm } from "@/container/forms/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — Laundry Lane Admin",
  description: "Sign in to your Laundry Lane admin dashboard.",
};

export default function LoginPage() {
  return <LoginForm />;
}
