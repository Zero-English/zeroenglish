import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/utils/prisma";
import "dotenv/config";

const baseAdapter = PrismaAdapter(prisma);

const adapter: Adapter = {
    ...baseAdapter,
    createUser: async (user: AdapterUser) => {
        const email = user.email ?? "";
        const userName =
            user.name?.trim() ||
            email.split("@")[0] ||
            `user_${Date.now().toString(36)}`;

        const data = {
            ...user,
            user_name: userName,
        } as AdapterUser & { user_name: string };

        return baseAdapter.createUser?.(data) as ReturnType<
            NonNullable<Adapter["createUser"]>
        >;
    },
};

export const authOptions: NextAuthOptions = {
    adapter,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || "",
            clientSecret: process.env.GOOGLE_SECRET || "",
        }),
    ],
    callbacks: {
        session({ session, token }) {
            if (session.user && token?.sub) {
                session.user.id = Number(token.sub);
            }
            return session;
        },
    },
};
