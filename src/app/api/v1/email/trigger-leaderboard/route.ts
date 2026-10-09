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
    const { examId } = body;

    const parsedExamId = parseInt(examId, 10);
    if (Number.isNaN(parsedExamId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing exam ID." },
        { status: 400 }
      );
    }

    const result = await EmailService.sendExamLeaderboardWishes(parsedExamId);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to trigger leaderboard emails" },
      { status: 500 }
    );
  }
}
