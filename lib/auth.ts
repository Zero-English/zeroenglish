import { AsyncLocalStorage } from "node:async_hooks";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import logger from "@/utils/logger";
import prisma from "@/utils/prisma";
import "dotenv/config";

// Request-scoped bind intent. Armed by the NextAuth route handler (via the
// AsyncLocalStorage context) just before it runs the OAuth callback when a
// guest clicked "Continue with Google" to bind an account. The signIn
// callback reads it to reject Google accounts that already exist in the
// database (only brand-new accounts may be bound, and they receive the
// guest's synced localStorage data). Using AsyncLocalStorage keeps the intent
// isolated per-request so concurrent logins can never observe each other's
// state.
export const bindIntentStore = new AsyncLocalStorage<{ pending: boolean }>();

export function markBindIntentPending(): void {
    const store = bindIntentStore.getStore();
    if (store) store.pending = true;
}

export function clearBindIntent(): void {
    const store = bindIntentStore.getStore();
    if (store) store.pending = false;
}

async function accountAlreadyExists(user: {
    id?: number | string | null;
    email?: string | null;
}, account?: {
    provider?: string | null;
    providerAccountId?: string | null;
} | null): Promise<boolean> {
    const email = user?.email?.toLowerCase().trim();
    if (email) {
        const found = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        if (found) return true;
    }
    if (account?.provider && account.providerAccountId) {
        const linked = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                },
            },
            select: { userId: true },
        });
        if (linked) return true;
    }
    return false;
}

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

        return (await baseAdapter.createUser?.(data)) as ReturnType<
            NonNullable<Adapter["createUser"]>
        >;
    },

    getUser: async (id) => {
        const userId = Number(id);
        return (await prisma.user.findUnique({
            where: {
                id: userId,
            },
        })) as ReturnType<NonNullable<Adapter["getUser"]>>;
    },

    getUserByEmail: async (email) =>
        (await baseAdapter.getUserByEmail?.(email)) as ReturnType<
            NonNullable<Adapter["getUserByEmail"]>
        >,

    getUserByAccount: async ({ provider, providerAccountId }) =>
        (await baseAdapter.getUserByAccount?.({
            provider,
            providerAccountId,
        })) as ReturnType<NonNullable<Adapter["getUserByAccount"]>>,

    updateUser: async (user) =>
        (await baseAdapter.updateUser?.(user)) as ReturnType<
            NonNullable<Adapter["updateUser"]>
        >,

    deleteUser: async (id) => {
        await baseAdapter.deleteUser?.(id);
    },

    linkAccount: async (account: Parameters<NonNullable<Adapter["linkAccount"]>>[0]) =>
        (await baseAdapter.linkAccount?.(account)) as ReturnType<
            NonNullable<Adapter["linkAccount"]>
        >,

    unlinkAccount: async (account: Parameters<NonNullable<Adapter["unlinkAccount"]>>[0]) =>
        (await baseAdapter.unlinkAccount?.(
            account
        )) as ReturnType<NonNullable<Adapter["unlinkAccount"]>>,

    createSession: async (session) =>
        (await baseAdapter.createSession?.(session)) as ReturnType<
            NonNullable<Adapter["createSession"]>
        >,

    getSessionAndUser: async (sessionToken) =>
        (await baseAdapter.getSessionAndUser?.(
            sessionToken
        )) as ReturnType<NonNullable<Adapter["getSessionAndUser"]>>,

    updateSession: async (session) =>
        (await baseAdapter.updateSession?.(session)) as ReturnType<
            NonNullable<Adapter["updateSession"]>
        >,

    deleteSession: async (sessionToken) => {
        await baseAdapter.deleteSession?.(sessionToken);
    },
};

export const authOptions: NextAuthOptions = {
    adapter,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    pages: { error: "/login" },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || "",
            clientSecret: process.env.GOOGLE_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            const bind = bindIntentStore.getStore();
            if (bind?.pending) {
                let exists = true;
                try {
                    exists = await accountAlreadyExists(user, account);
                } catch (error) {
                    logger.error("Bind intent existence check failed — rejecting", { error });
                }
                logger.info("Bind intent sign-in", { email: user?.email, exists });
                if (exists) {
                    logger.warn(
                        "Bind rejected: account already exists — guest data will NOT be synced",
                        { email: user?.email, provider: account?.provider }
                    );
                    return false;
                }
            }
            logger.info("Logged in successfully", { userId: user?.id });
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
                const sub = Number(token.sub);
                // Only accept a real, positive DB user id. Anything else (e.g. a
                // stale token carrying a provider account id) is left undefined
                // so protected routes return 401 instead of FK-violating.
                if (Number.isSafeInteger(sub) && sub > 0) {
                    session.user.id = sub;
                }
            }
            if (session.user && token?.role) {
                session.user.role = token.role as "user" | "admin";
            }
            return session;
        },
    },
};
