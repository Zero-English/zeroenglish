import { NextResponse, NextRequest } from "next/server";
import { health } from "@/services/health.service";

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Check API health
 *     description: Returns the current health status of the Zero English API.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
export async function GET() {
    return NextResponse.json(health());
}