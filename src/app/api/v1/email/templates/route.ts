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

export async function GET() {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const templates = await EmailService.getTemplates();
    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // If body contains template creation parameters
    if (body?.name && body?.subject && body?.bodyHtml) {
      const newTemplate = await EmailService.createTemplate({
        key: body.key || body.name.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
        name: body.name,
        description: body.description,
        subject: body.subject,
        bodyHtml: body.bodyHtml,
        bodyText: body.bodyText,
        variables: body.variables || ["userName", "userEmail", "logoUrl", "currentYear"],
        isActive: body.isActive ?? true,
        autoTriggerEnabled: body.autoTriggerEnabled ?? false,
      });

      return NextResponse.json({
        success: true,
        message: "Email template created successfully!",
        data: newTemplate,
      });
    }

    // Otherwise, default to seeding/syncing defaults
    await EmailService.seedDefaultTemplates();
    const templates = await EmailService.getTemplates();
    return NextResponse.json({
      success: true,
      message: "All templates verified and synchronized.",
      data: templates,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process templates" },
      { status: 400 }
    );
  }
}
