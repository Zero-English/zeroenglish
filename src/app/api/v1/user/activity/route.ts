import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/utils/prisma";
import { getServerSession } from "next-auth";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  await prisma.user.update({
    where: {
      id: Number(session.user.id),
    },
    data: {
      lastActivityAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
  });
}