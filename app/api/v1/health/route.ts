import { NextResponse, NextRequest } from "next/server";
import { health } from "@/services/health.service";

export async function GET() {
    return NextResponse.json(health());
}
