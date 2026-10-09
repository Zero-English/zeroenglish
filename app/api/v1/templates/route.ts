import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTemplates, createTemplate } from "@/services/template.service";
import { TemplateType } from "@/generated/prisma/enums";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as TemplateType | undefined;
    const isActive = searchParams.get("isActive") !== null 
      ? searchParams.get("isActive") === "true" 
      : undefined;

    const result = await getTemplates({ type, isActive });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ templates: result.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name || !body.type || !body.elements) {
      return NextResponse.json(
        { error: "Name, type, and elements are required" },
        { status: 400 }
      );
    }

    const result = await createTemplate({
      name: body.name,
      description: body.description,
      type: body.type,
      width: body.width,
      height: body.height,
      backgroundColor: body.backgroundColor,
      backgroundMediaId: body.backgroundMediaId,
      elements: body.elements,
      isDefault: body.isDefault,
      createdById: (session.user as any)?.id ? parseInt((session.user as any).id, 10) : null,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ template: result.data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
