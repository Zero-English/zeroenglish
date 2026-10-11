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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { key } = await params;
    const template = await EmailService.getTemplateByKey(key);
    if (!template) {
      return NextResponse.json(
        { success: false, message: `Template "${key}" not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load template" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { key } = await params;
    const body = await request.json();

    const updated = await EmailService.updateTemplate(key, {
      name: body.name,
      subject: body.subject,
      bodyHtml: body.bodyHtml,
      bodyText: body.bodyText,
      isActive: body.isActive,
      autoTriggerEnabled: body.autoTriggerEnabled,
    });

    return NextResponse.json({
      success: true,
      message: "Template updated successfully!",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { key } = await params;
    const reset = await EmailService.resetTemplateToDefault(key);
    return NextResponse.json({
      success: true,
      message: "Template restored to original default.",
      data: reset,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to reset template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  try {
    const { key } = await params;
    await EmailService.deleteTemplate(key);
    return NextResponse.json({
      success: true,
      message: `Template "${key}" deleted successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete template" },
      { status: 400 }
    );
  }
}
