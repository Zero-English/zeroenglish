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
    const { audience, specificEmails, subject, bodyHtml, templateKey } = body;

    if (!subject || !bodyHtml) {
      return NextResponse.json(
        { success: false, message: "Subject and HTML content are required." },
        { status: 400 }
      );
    }

    if (!["ALL", "ADMINS", "SPECIFIC"].includes(audience)) {
      return NextResponse.json(
        { success: false, message: "Invalid audience type." },
        { status: 400 }
      );
    }

    if (audience === "SPECIFIC" && (!Array.isArray(specificEmails) || specificEmails.length === 0)) {
      return NextResponse.json(
        { success: false, message: "Please provide at least one recipient email." },
        { status: 400 }
      );
    }

    const result = await EmailService.sendBulkBroadcast({
      audience,
      specificEmails,
      subject,
      bodyHtml,
      templateKey,
    });

    return NextResponse.json({
      success: true,
      message: `Broadcast processed: ${result.sentCount} of ${result.total} delivered.`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to broadcast email" },
      { status: 500 }
    );
  }
}
