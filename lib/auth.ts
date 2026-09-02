import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/utils/prisma";
import "dotenv/config";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET,
    session: { strategy: "database" },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || "",
            clientSecret: process.env.GOOGLE_SECRET || "",
        }),
    ],
    callbacks: {
        session({ session, user }) {
            if (session.user && user?.id) {
                session.user.id = user.id as unknown as number;
            }
            return session;
        },
    },
};
