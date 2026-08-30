import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

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
        new DailyRotateFile({
            dirname: "logs",
            filename: "app-info-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "10m",
            maxFiles: "15d",
            level: "info",
            auditFile: "../../logs/.audit.json",
        }),
        new DailyRotateFile({
            dirname: "logs",
            filename: "app-error-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "10m",
            maxFiles: "30d",
            level: "error",
            auditFile: "../../logs/.audit.json",
        }),
    ],
    exitOnError: false,
});

export default logger;