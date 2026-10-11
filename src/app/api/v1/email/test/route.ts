import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EmailService } from "@/services/email.service";

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

export async function POST(request: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const { toEmail, customConfig } = body;

    if (!toEmail || !toEmail.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid recipient email address." },
        { status: 400 }
      );
    }

    const result = await EmailService.sendTestEmail(toEmail, customConfig);

    return NextResponse.json({
      success: true,
      message: `Test email successfully dispatched to ${toEmail}!`,
      messageId: result.messageId,
    });
  } catch (error: any) {
    const errorMsg = error?.message || "Failed to send test email";
    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 400 }
    );
  }
}
