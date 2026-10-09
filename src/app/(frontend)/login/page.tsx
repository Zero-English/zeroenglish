import { Metadata } from "next";
import { LoginClient } from "@/components/login-client";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in or continue as a guest to start learning English vocabulary.",
  alternates: { canonical: "/login" },
  // A sign-in form has nothing to offer a search result, and indexing it adds
  // a thin page to the site's inventory.
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginClient />;
}