import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id?: number;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

    interface User {
        id: number;
    }
}
