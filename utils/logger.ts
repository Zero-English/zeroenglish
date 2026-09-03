import { createLogger, format, transports } from "winston";
const colorizer = format.colorize();

const logFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
        return `${timestamp} [${level}]: ${message} ${metaString}`;
    })
);

const consoleLogFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message, ...meta }) => {
        const levelColored = colorizer.colorize(
            level,
            `${level.toUpperCase()}`
        );
        const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";

        return `${timestamp} [${levelColored}]: ${message} ${metaString}`;
    })
);

const logger = createLogger({
    level: "info",
    format: logFormat,
    transports: [
        new transports.Console({
            format: consoleLogFormat,
        }),

    ],
    exitOnError: false,
});

export default logger;