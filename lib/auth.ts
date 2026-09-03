import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import logger from "@/utils/logger";
import prisma from "@/utils/prisma";
import "dotenv/config";

const baseAdapter = PrismaAdapter(prisma);

function logCall(method: string, ...args: unknown[]): void {
    logger.info(`[prisma-adapter] ${method}`, { args });
}

const adapter: Adapter = {
    ...baseAdapter,

    createUser: async (user: AdapterUser) => {
        logger.info("[prisma-adapter] createUser", { user });
        const email = user.email ?? "";
        const userName =
            user.name?.trim() ||
            email.split("@")[0] ||
            `user_${Date.now().toString(36)}`;

        const data = {
            ...user,
            user_name: userName,
        } as AdapterUser & { user_name: string };

        const result = (await baseAdapter.createUser?.(data)) as ReturnType<
            NonNullable<Adapter["createUser"]>
        >;
        logger.info("[prisma-adapter] createUser result", { result });
        return result;
    },

    getUser: async (id) => {
        logCall("getUser", { id });
        const userId = Number(id);
        const result = (await prisma.user.findUnique({
            where: {
                id: userId,
            },
        })) as ReturnType<NonNullable<Adapter["getUser"]>>;
        logger.info("[prisma-adapter] getUser result", { result });
        return result;
    },

    getUserByEmail: async (email) => {
        logCall("getUserByEmail", { email });
        const result = (await baseAdapter.getUserByEmail?.(email)) as ReturnType<
            NonNullable<Adapter["getUserByEmail"]>
        >;
        logger.info("[prisma-adapter] getUserByEmail result", { result });
        return result;
    },

    getUserByAccount: async ({ provider, providerAccountId }) => {
        logCall("getUserByAccount", { provider, providerAccountId });
        const result = (await baseAdapter.getUserByAccount?.({
            provider,
            providerAccountId,
        })) as ReturnType<NonNullable<Adapter["getUserByAccount"]>>;
        logger.info("[prisma-adapter] getUserByAccount result", { result });
        return result;
    },

    updateUser: async (user) => {
        logCall("updateUser", { user });
        const result = (await baseAdapter.updateUser?.(user)) as ReturnType<
            NonNullable<Adapter["updateUser"]>
        >;
        logger.info("[prisma-adapter] updateUser result", { result });
        return result;
    },

    deleteUser: async (id) => {
        logCall("deleteUser", { id });
        await baseAdapter.deleteUser?.(id);
    },

    linkAccount: async (account: Parameters<NonNullable<Adapter["linkAccount"]>>[0]) => {
        logCall("linkAccount", { account });
        const result = (await baseAdapter.linkAccount?.(account)) as ReturnType<
            NonNullable<Adapter["linkAccount"]>
        >;
        logger.info("[prisma-adapter] linkAccount result", { result });
        return result;
    },

    unlinkAccount: async (account: Parameters<NonNullable<Adapter["unlinkAccount"]>>[0]) => {
        logCall("unlinkAccount", { account });
        const result = (await baseAdapter.unlinkAccount?.(
            account
        )) as ReturnType<NonNullable<Adapter["unlinkAccount"]>>;
        logger.info("[prisma-adapter] unlinkAccount result", { result });
        return result;
    },

    createSession: async (session) => {
        logCall("createSession", { session });
        const result = (await baseAdapter.createSession?.(session)) as ReturnType<
            NonNullable<Adapter["createSession"]>
        >;
        logger.info("[prisma-adapter] createSession result", { result });
        return result;
    },

    getSessionAndUser: async (sessionToken) => {
        logCall("getSessionAndUser", { sessionToken });
        const result = (await baseAdapter.getSessionAndUser?.(
            sessionToken
        )) as ReturnType<NonNullable<Adapter["getSessionAndUser"]>>;
        logger.info("[prisma-adapter] getSessionAndUser result", { result });
        return result;
    },

    updateSession: async (session) => {
        logCall("updateSession", { session });
        const result = (await baseAdapter.updateSession?.(session)) as ReturnType<
            NonNullable<Adapter["updateSession"]>
        >;
        logger.info("[prisma-adapter] updateSession result", { result });
        return result;
    },

    deleteSession: async (sessionToken) => {
        logCall("deleteSession", { sessionToken });
        await baseAdapter.deleteSession?.(sessionToken);
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
        async signIn({ user }) {
            logger.info("Logged in Successfully", { user });
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: Number(user.id) },
                    select: { role: true },
                });
                token.role = dbUser?.role ?? "user";
            }
            return token;
        },
        session({ session, token }) {
            if (session.user && token?.sub) {
                session.user.id = Number(token.sub);
            }
            if (session.user && token?.role) {
                session.user.role = token.role as "user" | "admin";
            }
            return session;
        },
    },
};
