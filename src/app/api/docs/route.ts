import { swaggerSpec } from "@/utils/swagger";

export async function GET() {
    return Response.json(swaggerSpec);
}