import { Metadata } from "next";
import { LoginClient } from "@/components/login-client";

export const metadata: Metadata = {
  title: "Login | Zero English",
  description: "Sign in or continue as a guest to start learning English vocabulary.",
};

export default function LoginPage() {
  return <LoginClient />;
}