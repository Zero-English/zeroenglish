import { NextResponse, NextRequest } from "next/server";
import { ping } from "@/services/ping.service";

/**
 * @openapi
 * /api/v1/ping:
 *   get:
 *     summary: Ping the API
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Successful ping
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pong
 */
export async function GET() {
    return NextResponse.json(ping());
}
