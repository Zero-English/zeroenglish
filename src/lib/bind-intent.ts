// Shared definition of the cookie that arms the "bind guest account" intent.
// Armed by POST /api/v1/auth/bind/begin and consumed by the NextAuth OAuth
// callback handler (app/api/auth/[...nextauth]/route.ts) so the signIn callback
// knows to only allow brand-new Google accounts.
export const BIND_COOKIE = "pending_bind";

export const BIND_COOKIE_MAX_AGE = 60 * 10; // 10 minutes