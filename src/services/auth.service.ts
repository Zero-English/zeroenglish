import logger from "@/utils/logger";

export interface LogoutResult {
    success: boolean;
    message: string;
    data: Record<string, unknown> | null;
}

export const AUTH_COOKIE_NAMES = [
    "next-auth.session-token",
    "next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.session-token",
    "__Secure-next-auth.csrf-token",
    "__Secure-next-auth.callback-url",
    "__Host-next-auth.csrf-token",
];

export const logoutUser = (): LogoutResult => {
    try {
        logger.info("User requested logout");
        return {
            success: true,
            message: "Logged out successfully",
            data: {
                loggedOut: true,
            },
        };
    } catch (error) {
        logger.error("User logout failed", { error });
        return {
            success: false,
            message: "Logout failed",
            data: null,
        };
    }
};