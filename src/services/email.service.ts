import path from "path";
import fs from "fs";
import prisma from "@/utils/prisma";
import { createSmtpTransporter, getSmtpConfig, SmtpConfig } from "./email/smtp-transport";
import { DEFAULT_EMAIL_TEMPLATES } from "./email/default-templates";
import { renderTemplate } from "./email/template-renderer";

export interface SendEmailOptions {
  templateKey?: string;
  to: string;
  recipientUserId?: number;
  subject?: string;
  html?: string;
  text?: string;
  data?: Record<string, any>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Get logo inline CID attachment and reference
 */
function getLogoAttachment(): { attachments: any[]; logoCid: string } {
  const logoPath = path.join(process.cwd(), "public", "assets", "logo", "main-logo.png");
  if (fs.existsSync(logoPath)) {
    return {
      attachments: [
        {
          filename: "zeroenglish-logo.png",
          path: logoPath,
          cid: "zeroenglish-logo",
        },
      ],
      logoCid: "cid:zeroenglish-logo",
    };
  }
  return {
    attachments: [],
    logoCid: "https://zeroenglish.org/assets/logo/main-logo.png",
  };
}

export class EmailService {
  /**
   * Ensure default templates exist in DB. If not, insert them.
   */
  static async seedDefaultTemplates(): Promise<void> {
    try {
      for (const tpl of DEFAULT_EMAIL_TEMPLATES) {
        const existing = await prisma.emailTemplate.findUnique({
          where: { key: tpl.key },
        });

        if (!existing) {
          await prisma.emailTemplate.create({
            data: {
              key: tpl.key,
              name: tpl.name,
              description: tpl.description,
              subject: tpl.subject,
              bodyHtml: tpl.bodyHtml,
              bodyText: tpl.bodyText,
              variables: tpl.variables,
              isActive: tpl.isActive ?? true,
              autoTriggerEnabled: tpl.autoTriggerEnabled,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error seeding default email templates:", error);
    }
  }

  /**
   * Get all email templates with auto-seeding if empty.
   */
  static async getTemplates() {
    await this.seedDefaultTemplates();
    return prisma.emailTemplate.findMany({
      orderBy: { id: "asc" },
    });
  }

  /**
   * Get single template by key.
   */
  static async getTemplateByKey(key: string) {
    let tpl = await prisma.emailTemplate.findUnique({
      where: { key },
    });
    if (!tpl) {
      await this.seedDefaultTemplates();
      tpl = await prisma.emailTemplate.findUnique({
        where: { key },
      });
    }
    return tpl;
  }

  /**
   * Update template.
   */
  static async updateTemplate(
    key: string,
    data: {
      name?: string;
      subject?: string;
      bodyHtml?: string;
      bodyText?: string;
      isActive?: boolean;
      autoTriggerEnabled?: boolean;
    }
  ) {
    return prisma.emailTemplate.update({
      where: { key },
      data,
    });
  }

  /**
   * Create a new email template.
   */
  static async createTemplate(data: {
    key: string;
    name: string;
    description?: string;
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    variables?: string[];
    isActive?: boolean;
    autoTriggerEnabled?: boolean;
  }) {
    const formattedKey = data.key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    const existing = await prisma.emailTemplate.findUnique({
      where: { key: formattedKey },
    });

    if (existing) {
      throw new Error(`A template with key "${formattedKey}" already exists.`);
    }

    return prisma.emailTemplate.create({
      data: {
        key: formattedKey,
        name: data.name.trim(),
        description: data.description || "",
        subject: data.subject.trim(),
        bodyHtml: data.bodyHtml,
        bodyText: data.bodyText || "",
        variables: data.variables || [],
        isActive: data.isActive ?? true,
        autoTriggerEnabled: data.autoTriggerEnabled ?? false,
      },
    });
  }

  /**
   * Delete custom template.
   */
  static async deleteTemplate(key: string) {
    const isDefault = DEFAULT_EMAIL_TEMPLATES.some((t) => t.key === key);
    if (isDefault) {
      throw new Error("System default templates cannot be deleted, but can be deactivated.");
    }

    return prisma.emailTemplate.delete({
      where: { key },
    });
  }

  /**
   * Reset template to default.
   */
  static async resetTemplateToDefault(key: string) {
    const defaultTpl = DEFAULT_EMAIL_TEMPLATES.find((t) => t.key === key);
    if (!defaultTpl) {
      throw new Error(`Default template with key "${key}" not found.`);
    }

    return prisma.emailTemplate.upsert({
      where: { key },
      create: {
        key: defaultTpl.key,
        name: defaultTpl.name,
        description: defaultTpl.description,
        subject: defaultTpl.subject,
        bodyHtml: defaultTpl.bodyHtml,
        bodyText: defaultTpl.bodyText,
        variables: defaultTpl.variables,
        isActive: defaultTpl.isActive ?? true,
        autoTriggerEnabled: defaultTpl.autoTriggerEnabled,
      },
      update: {
        name: defaultTpl.name,
        description: defaultTpl.description,
        subject: defaultTpl.subject,
        bodyHtml: defaultTpl.bodyHtml,
        bodyText: defaultTpl.bodyText,
        variables: defaultTpl.variables,
        isActive: defaultTpl.isActive ?? true,
        autoTriggerEnabled: defaultTpl.autoTriggerEnabled,
      },
    });
  }

  /**
   * Get SMTP configuration.
   */
  static async getConfig() {
    return getSmtpConfig();
  }

  /**
   * Save SMTP configuration into EmailConfig.
   */
  static async saveConfig(config: Partial<SmtpConfig>) {
    return prisma.emailConfig.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        smtpHost: config.host || "smtp.gmail.com",
        smtpPort: config.port || 465,
        smtpSecure: config.secure ?? true,
        smtpUser: config.user || "",
        smtpPass: config.pass || "",
        fromName: config.fromName || "Zero English",
        fromEmail: config.fromEmail || config.user || "noreply@zeroenglish.com",
        replyTo: config.replyTo || null,
        isEnabled: config.isEnabled ?? true,
      },
      update: {
        smtpHost: config.host,
        smtpPort: config.port,
        smtpSecure: config.secure,
        smtpUser: config.user,
        smtpPass: config.pass,
        fromName: config.fromName,
        fromEmail: config.fromEmail,
        replyTo: config.replyTo,
        isEnabled: config.isEnabled,
      },
    });
  }

  /**
   * Send an email with full logging.
   */
  static async sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
    const { to, recipientUserId, templateKey } = options;
    const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://zeroenglish.org";
    const { attachments, logoCid } = getLogoAttachment();

    const data = {
      logoUrl: logoCid,
      siteUrl,
      currentYear: new Date().getFullYear(),
      ...(options.data || {}),
    };

    let subject = options.subject || "";
    let html = options.html || "";
    let text = options.text || "";

    // If templateKey is provided, load template from DB
    let template = null;
    if (templateKey) {
      template = await this.getTemplateByKey(templateKey);
      if (template) {
        if (!template.isActive) {
          return {
            success: false,
            error: `Email template "${templateKey}" is currently disabled.`,
          };
        }
        subject = subject || renderTemplate(template.subject, data);
        html = html || renderTemplate(template.bodyHtml, data);
        text = text || (template.bodyText ? renderTemplate(template.bodyText, data) : "");
      }
    }

    const { transporter, config } = await createSmtpTransporter();

    if (!config.isEnabled) {
      return {
        success: false,
        error: "Email delivery is disabled in SMTP settings.",
      };
    }

    if (!config.user || !config.pass) {
      const errMsg = "SMTP User / App Password not configured.";
      await prisma.emailLog.create({
        data: {
          recipientEmail: to,
          recipientUserId,
          templateKey,
          subject: subject || "No Subject",
          status: "FAILED",
          errorMessage: errMsg,
          metadata: data,
        },
      });
      return { success: false, error: errMsg };
    }

    try {
      const fromFormatted = config.fromName
        ? `"${config.fromName}" <${config.fromEmail || config.user}>`
        : config.fromEmail || config.user;

      const info = await transporter.sendMail({
        from: fromFormatted,
        to,
        replyTo: config.replyTo || undefined,
        subject,
        html,
        text: text || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      // Log success
      await prisma.emailLog.create({
        data: {
          recipientEmail: to,
          recipientUserId,
          templateKey,
          subject,
          status: "SENT",
          metadata: { ...data, messageId: info.messageId },
        },
      });

      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      const errMsg = error?.message || "Unknown error during email dispatch.";
      console.error(`Failed to send email to ${to}:`, error);

      // Log failure
      await prisma.emailLog.create({
        data: {
          recipientEmail: to,
          recipientUserId,
          templateKey,
          subject: subject || "Failed to send",
          status: "FAILED",
          errorMessage: errMsg,
          metadata: data,
        },
      });

      return { success: false, error: errMsg };
    }
  }

  /**
   * Test SMTP dispatch.
   */
  static async sendTestEmail(toEmail: string, customConfig?: Partial<SmtpConfig>) {
    const { transporter, config } = await createSmtpTransporter(customConfig);

    if (!config.user || !config.pass) {
      const errMsg = "SMTP User / Gmail Address or App Password is not configured. Please enter your credentials.";
      await prisma.emailLog.create({
        data: {
          recipientEmail: toEmail,
          templateKey: "TEST_EMAIL",
          subject: "Mailer Verification Test — Zero English",
          status: "FAILED",
          errorMessage: errMsg,
          metadata: { host: config.host },
        },
      });
      throw new Error(errMsg);
    }

    const fromFormatted = config.fromName
      ? `"${config.fromName}" <${config.fromEmail || config.user}>`
      : config.fromEmail || config.user;

    const { attachments, logoCid } = getLogoAttachment();
    const testSubject = "Mailer Verification Test — Zero English";
    const testHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mailer Verification Test — Zero English</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #18181b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 48px 16px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
                <tr>
                  <td height="4" style="background: #18181b;"></td>
                </tr>
                <tr>
                  <td align="center" style="padding: 40px 32px 20px 32px;">
                    <img src="${logoCid}" alt="Zero English" style="height: 52px; width: auto; max-width: 220px; display: block; border: 0;" />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0 32px 24px 32px;">
                    <div style="display: inline-block; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 9999px; padding: 4px 12px; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #059669; margin-bottom: 14px;">
                      Connection Verified
                    </div>
                    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #09090b; letter-spacing: -0.4px; line-height: 1.3;">
                      SMTP Connection Successful
                    </h1>
                    <p style="margin: 0; font-size: 13px; color: #71717a; line-height: 1.6;">
                      Your outgoing mail server is properly connected and ready for automated dispatches.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 32px 28px 32px;">
                    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 18px; font-size: 12px; color: #3f3f46; line-height: 1.7;">
                      <div style="margin-bottom: 6px;"><strong>Host:</strong> <code style="color: #ea580c; font-size: 11px;">${config.host}:${config.port}</code></div>
                      <div style="margin-bottom: 6px;"><strong>Sender:</strong> ${fromFormatted}</div>
                      <div><strong>Timestamp:</strong> ${new Date().toUTCString()}</div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #f4f4f5; background-color: #fafafa; padding: 20px 32px; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.6;">
                      Zero English Platform · Automated Mailer<br>
                      © ${new Date().getFullYear()} Zero English. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      const info = await transporter.sendMail({
        from: fromFormatted,
        to: toEmail,
        subject: testSubject,
        html: testHtml,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      await prisma.emailLog.create({
        data: {
          recipientEmail: toEmail,
          templateKey: "TEST_EMAIL",
          subject: testSubject,
          status: "SENT",
          metadata: { messageId: info.messageId, host: config.host },
        },
      });

      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      let errMsg = error?.message || "Failed to dispatch test email.";
      if (
        errMsg.includes("Invalid login") ||
        errMsg.includes("535") ||
        errMsg.includes("Username and Password not accepted")
      ) {
        errMsg =
          "Gmail Authentication Failed: Invalid Google App Password. Please generate a 16-character App Password at myaccount.google.com/apppasswords and make sure 2-Step Verification is enabled.";
      }

      await prisma.emailLog.create({
        data: {
          recipientEmail: toEmail,
          templateKey: "TEST_EMAIL",
          subject: testSubject,
          status: "FAILED",
          errorMessage: errMsg,
          metadata: { host: config.host },
        },
      });

      throw new Error(errMsg);
    }
  }

  /**
   * Automatically send wishing / result emails to all exam participants based on leaderboard ranking.
   */
  static async sendExamLeaderboardWishes(examId: number) {
    // 1. Fetch exam details
    const exam = await prisma.quizExam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new Error(`Quiz Exam with ID ${examId} not found.`);
    }

    // 2. Check if auto triggers are enabled
    const top3Template = await this.getTemplateByKey("LEADERBOARD_RANKING_TOP3");
    const participantTemplate = await this.getTemplateByKey("LEADERBOARD_PARTICIPANT");

    if (!top3Template?.autoTriggerEnabled && !participantTemplate?.autoTriggerEnabled) {
      return {
        message: "Automated leaderboard wishing emails are currently disabled in template settings.",
        sentCount: 0,
        results: [],
      };
    }

    // 3. Fetch all completed/submitted exam results for this exam
    const examResults = await prisma.combinedExamResult.findMany({
      where: {
        examId,
        status: "SUBMITTED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { scoreInPercent: "desc" },
        { timeTotalQuiz: "asc" },
      ],
    });

    if (!examResults.length) {
      return {
        message: "No completed exam submissions found for this exam.",
        sentCount: 0,
        results: [],
      };
    }

    const totalParticipants = examResults.length;
    const resultsSummary: Array<{ userId: number; email: string; rank: number; success: boolean; error?: string }> = [];

    const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://zeroenglish.com";
    const leaderboardUrl = `${siteUrl}/leaderboard`;

    // 4. Iterate and dispatch emails with rank calculation
    for (let index = 0; index < examResults.length; index++) {
      const result = examResults[index];
      const rank = index + 1;
      const user = result.user;

      if (!user?.email) continue;

      const userName = user.name || "Student";
      const totalScore = result.totalScore;
      const scoreInPercent = Math.round(result.scoreInPercent);
      const isTop3 = rank <= 3;
      const rankSuffix = rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";
      const certificateUrl = `${siteUrl}/exam/${examId}/certificate`;

      const templateData = {
        userName,
        userEmail: user.email,
        examTitle: exam.title,
        rank,
        rankSuffix,
        totalParticipants,
        totalScore,
        scoreInPercent,
        leaderboardUrl,
        certificateUrl,
      };

      const templateKeyToUse = isTop3 ? "LEADERBOARD_RANKING_TOP3" : "LEADERBOARD_PARTICIPANT";

      try {
        const sendRes = await this.sendEmail({
          templateKey: templateKeyToUse,
          to: user.email,
          recipientUserId: user.id,
          data: templateData,
        });

        resultsSummary.push({
          userId: user.id,
          email: user.email,
          rank,
          success: sendRes.success,
          error: sendRes.error,
        });
      } catch (err: any) {
        resultsSummary.push({
          userId: user.id,
          email: user.email,
          rank,
          success: false,
          error: err?.message || "Failed to dispatch email",
        });
      }
    }

    const sentCount = resultsSummary.filter((r) => r.success).length;

    return {
      message: `Processed leaderboard emails for ${examResults.length} participants (${sentCount} sent successfully).`,
      totalParticipants,
      sentCount,
      results: resultsSummary,
    };
  }

  /**
   * Broadcast custom email to selected audience.
   */
  static async sendBulkBroadcast(params: {
    audience: "ALL" | "ADMINS" | "SPECIFIC";
    specificEmails?: string[];
    subject: string;
    bodyHtml: string;
    templateKey?: string;
  }) {
    let targetUsers: Array<{ id?: number; email: string; name?: string | null }> = [];

    if (params.audience === "ALL") {
      targetUsers = (await prisma.user.findMany({
        where: { email: { not: "" } },
        select: { id: true, email: true, name: true },
      })) as any[];
    } else if (params.audience === "ADMINS") {
      targetUsers = (await prisma.user.findMany({
        where: { role: "admin", email: { not: "" } },
        select: { id: true, email: true, name: true },
      })) as any[];
    } else if (params.audience === "SPECIFIC" && params.specificEmails) {
      targetUsers = params.specificEmails.map((email) => ({
        email: email.trim(),
        name: "Valued Member",
      }));
    }

    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    for (const user of targetUsers) {
      if (!user.email) continue;
      const data = {
        userName: user.name || "Student",
        userEmail: user.email,
        currentYear: new Date().getFullYear(),
      };

      const renderedSubject = renderTemplate(params.subject, data);
      const renderedHtml = renderTemplate(params.bodyHtml, data);

      const res = await this.sendEmail({
        to: user.email,
        recipientUserId: user.id,
        templateKey: params.templateKey || "CUSTOM_BROADCAST",
        subject: renderedSubject,
        html: renderedHtml,
        data,
      });

      results.push({
        email: user.email,
        success: res.success,
        error: res.error,
      });
    }

    const sentCount = results.filter((r) => r.success).length;
    return {
      total: targetUsers.length,
      sentCount,
      results,
    };
  }

  /**
   * Get paginated email logs with filtering.
   */
  static async getLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    templateKey?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status && ["SENT", "FAILED", "PENDING"].includes(params.status)) {
      where.status = params.status;
    }

    if (params.templateKey) {
      where.templateKey = params.templateKey;
    }

    if (params.search) {
      where.OR = [
        { recipientEmail: { contains: params.search, mode: "insensitive" } },
        { subject: { contains: params.search, mode: "insensitive" } },
        { errorMessage: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.emailLog.count({ where }),
      prisma.emailLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sentAt: "desc" },
      }),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }
}
