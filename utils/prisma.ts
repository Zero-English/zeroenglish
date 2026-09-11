import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import logger from "./logger";

// const dbUrl =
//     process.env.DATABASE_URL_PRODUCTION ||
//     process.env.DATABASE_URL_DEVELOPMENT ||
//     process.env.DATABASE_URL;
// const adapter = new PrismaPg({ connectionString: dbUrl });

const connectionString = `${process.env?.["DATABASE_URL"] ?? ""}`;

// Never log the full connection string: it embeds the DB user/password.
// Derive a safe identifier (host[:port]) for diagnostics instead.
const safeDbHost = (() => {
    try {
        const parsed = new URL(connectionString);
        return parsed.host || "unknown";
    } catch {
        return "unknown";
    }
})();

const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 25_000,
    connectionTimeoutMillis: 15_000,
});

pool.on("error", (error) => {
    logger.warn(`Unexpected error on idle Prisma DB client: ${error.message}`);
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

const TRANSIENT_CONNECTION_ERROR =
    /Connection terminated unexpectedly|Connection pool timeout|ECONNRESET|EPIPE|connect ETIMEDOUT|connection (?:closed|reset|terminated)|server closed the connection/i;

export const withPrismaRetry = async <T>(
    operation: () => Promise<T>,
    retries = 2,
): Promise<T> => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            const message = error instanceof Error ? error.message : String(error);
            if (!TRANSIENT_CONNECTION_ERROR.test(message) || attempt === retries) break;
            await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
        }
    }
    throw lastError;
};

export const connectionCheck = async () => {
    try {
        const [sizeResult] = await prisma.$queryRaw<
            { size: string }[]
        >`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;
        const [nameResult] = await prisma.$queryRaw<
            { name: string }[]
        >`SELECT current_database()::text as name`;
        logger.info(
            `Prisma is connected to DB "${nameResult?.name}" at ${safeDbHost} (size: ${sizeResult?.size})`,
        );
    } catch (error) {
        logger.warn(
            `ERROR ON PRISMA INITIAL CONNECTION AND INITIAL HEALTH CHECK.\nCan't connect to DB. ${error}`,
        );
    }
};

connectionCheck();

export default prisma;