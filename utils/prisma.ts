import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import logger from "./logger";

// const dbUrl =
//     process.env.DATABASE_URL_PRODUCTION ||
//     process.env.DATABASE_URL_DEVELOPMENT ||
//     process.env.DATABASE_URL;
// const adapter = new PrismaPg({ connectionString: dbUrl });

const connectionString = `${process.env?.["DATABASE_URL"]}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export const connectionCheck = async () => {
    try {
        const [sizeResult] = await prisma.$queryRaw<
            { size: string }[]
        >`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;
        logger.info(`Database size is ${sizeResult?.size}`);
        const [nameResult] = await prisma.$queryRaw<
            { name: string }[]
        >`SELECT current_database()::text as name`;
        logger.info(`Database name is ${nameResult?.name}`);
        logger.info(
            `Prisma is connected to DB: ${nameResult?.name} at ${connectionString}. Database size: ${sizeResult?.size}`,
        );
    } catch (error) {
        logger.warn(
            `ERROR ON PRISMA INITIAL CONNECTION AND INITIAL HEALTH CHECK.\nCan't connect to DB. ${error}`,
        );
    }
};

connectionCheck();

export default prisma;
