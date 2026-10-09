import logger from "./utils/logger";
import { connectionCheck } from "./utils/prisma";

export async function startup() {
    logger.info("Starting up the application...");
    connectionCheck();
}
