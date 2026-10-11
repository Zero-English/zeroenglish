import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EmailService } from "@/services/email.service";
import { verifySmtpConnection } from "@/services/email/smtp-transport";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const role = session.user.role?.toLowerCase();
  if (role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const config = await EmailService.getConfig();
    // Mask password before sending to client
    const maskedPass = config.pass ? "••••••••" : "";
    return NextResponse.json({
      success: true,
      data: {
        ...config,
        hasPassword: Boolean(config.pass),
        pass: maskedPass,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load email config" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const currentConfig = await EmailService.getConfig();

    const updatedConfig: any = {
      host: body.host ?? currentConfig.host,
      port: body.port ? parseInt(body.port, 10) : currentConfig.port,
      secure: body.secure ?? currentConfig.secure,
      user: body.user ?? currentConfig.user,
      fromName: body.fromName ?? currentConfig.fromName,
      fromEmail: body.fromEmail ?? currentConfig.fromEmail,
      replyTo: body.replyTo !== undefined ? body.replyTo : currentConfig.replyTo,
      isEnabled: body.isEnabled !== undefined ? body.isEnabled : currentConfig.isEnabled,
    };

    // Only update pass if user supplied a new password and it is not the masked string
    if (body.pass && body.pass !== "••••••••") {
      updatedConfig.pass = body.pass;
    } else {
      updatedConfig.pass = currentConfig.pass;
    }

    // Verify SMTP connection before saving (if credentials are provided)
    if (updatedConfig.user && updatedConfig.pass) {
      const verifyResult = await verifySmtpConnection(updatedConfig);
      if (!verifyResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: `SMTP Connection test failed: ${verifyResult.message}`,
          },
          { status: 400 }
        );
      }
    }

    await EmailService.saveConfig(updatedConfig);

    return NextResponse.json({
      success: true,
      message: "SMTP configuration updated and verified successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to save email config" },
      { status: 500 }
    );
  }
}
