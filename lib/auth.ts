import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import "dotenv/config";

export const authOptions: NextAuthOptions = {
    secret: process.env.AUTH_SECRET,
    session: {strategy: "jwt"},
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || "",
            clientSecret: process.env.GOOGLE_SECRET || "",
        }),
    ],
};
