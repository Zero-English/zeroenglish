import nodemailer from "nodemailer";
import prisma from "@/utils/prisma";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string | null;
  isEnabled: boolean;
}

/**
 * Retrieve the active SMTP configuration from database or fallback to environment variables.
 */
export async function getSmtpConfig(): Promise<SmtpConfig> {
  try {
    const dbConfig = await prisma.emailConfig.findFirst({
      where: { id: 1 },
    });

    if (dbConfig) {
      return {
        host: dbConfig.smtpHost || "smtp.gmail.com",
        port: dbConfig.smtpPort || 465,
        secure: dbConfig.smtpSecure ?? true,
        user: dbConfig.smtpUser || process.env.SMTP_USER || "",
        pass: dbConfig.smtpPass || process.env.SMTP_PASS || "",
        fromName: dbConfig.fromName || "Zero English",
        fromEmail: dbConfig.fromEmail || dbConfig.smtpUser || process.env.SMTP_FROM || "noreply@zeroenglish.com",
        replyTo: dbConfig.replyTo,
        isEnabled: dbConfig.isEnabled,
      };
    }
  } catch (error) {
    console.warn("Failed to load email config from DB, falling back to env:", error);
  }

  // Fallback to environment variables
  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465", 10),
    secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    fromName: process.env.SMTP_FROM_NAME || "Zero English",
    fromEmail: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@zeroenglish.com",
    replyTo: process.env.SMTP_REPLY_TO || null,
    isEnabled: true,
  };
}

/**
 * Create a nodemailer transporter using provided config or dynamically fetched config.
 */
export async function createSmtpTransporter(customConfig?: Partial<SmtpConfig>) {
  const baseConfig = await getSmtpConfig();

  // Merge custom config, preventing masked or empty password from overwriting the real DB password
  let resolvedPass = baseConfig.pass;
  if (customConfig?.pass && customConfig.pass !== "••••••••" && customConfig.pass.trim() !== "") {
    resolvedPass = customConfig.pass;
  }

  const config: SmtpConfig = {
    host: customConfig?.host || baseConfig.host || "smtp.gmail.com",
    port: customConfig?.port ? Number(customConfig.port) : baseConfig.port,
    secure: customConfig?.secure !== undefined ? customConfig.secure : baseConfig.secure,
    user: (customConfig?.user !== undefined ? customConfig.user : baseConfig.user).trim(),
    pass: resolvedPass.trim(),
    fromName: customConfig?.fromName || baseConfig.fromName || "Zero English",
    fromEmail: customConfig?.fromEmail || baseConfig.fromEmail || baseConfig.user,
    replyTo: customConfig?.replyTo !== undefined ? customConfig.replyTo : baseConfig.replyTo,
    isEnabled: customConfig?.isEnabled !== undefined ? customConfig.isEnabled : baseConfig.isEnabled,
  };

  const isGmail = config.host.toLowerCase().includes("gmail.com");
  // Clean Google App Password spaces if present (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const cleanPass = isGmail ? config.pass.replace(/\s+/g, "") : config.pass;

  let transporterOptions: any;

  if (isGmail) {
    // Gmail service configuration with robust auth
    transporterOptions = {
      service: "gmail",
      auth: {
        user: config.user,
        pass: cleanPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };
  } else {
    // Custom SMTP server configuration
    transporterOptions = {
      host: config.host,
      port: config.port,
      secure: config.secure, // true for 465, false for 587 or other ports
      auth: {
        user: config.user,
        pass: cleanPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };
  }

  const transporter = nodemailer.createTransport(transporterOptions);
  return { transporter, config: { ...config, pass: cleanPass } };
}

/**
 * Verify SMTP connection credentials.
 */
export async function verifySmtpConnection(configToTest?: Partial<SmtpConfig>): Promise<{ success: boolean; message: string }> {
  try {
    const { transporter, config } = await createSmtpTransporter(configToTest);
    if (!config.user || !config.pass) {
      return {
        success: false,
        message: "SMTP User and App Password are required. Please configure your Gmail and Google App Password.",
      };
    }
    await transporter.verify();
    return { success: true, message: "SMTP connection verified successfully!" };
  } catch (error: any) {
    const errMsg = error?.message || "Failed to verify SMTP credentials.";
    if (errMsg.includes("Invalid login") || errMsg.includes("535") || errMsg.includes("Username and Password not accepted")) {
      return {
        success: false,
        message: "Gmail Authentication Failed: Invalid email or Google App Password. Please generate a 16-character App Password from your Google Account security settings.",
      };
    }
    return {
      success: false,
      message: errMsg,
    };
  }
}
