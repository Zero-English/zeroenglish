import { NextResponse, NextRequest } from "next/server";
import { ping } from "@/services/ping.service";

export async function GET() {
    return NextResponse.json(ping());
}
