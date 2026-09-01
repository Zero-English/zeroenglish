"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <NextAuthSessionProvider basePath="/api/v1/auth">
            {children}
        </NextAuthSessionProvider>
    );
}
