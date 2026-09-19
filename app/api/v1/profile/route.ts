import { NextResponse } from "next/server";
import { requireAuth, getApiSessionUser } from "@/lib/api-auth";
import { getUserProfile, updateUserProfile } from "@/services/user.service";
import { profileUpdateSchema } from "@/utils/validation/zod";
import { Class as ClassEnum, Gender as GenderEnum } from "@/generated/prisma/enums";
import logger from "@/utils/logger";

/**
 * @openapi
 * /api/v1/profile:
 *   get:
 *     summary: Get your own profile
 *     description: Returns the authenticated user's profile fields (name, username, institution, bio, class, gender, social links).
 *     tags:
 *       - Profile
 *     responses:
 *       200:
 *         description: Profile details
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update your own profile
 *     description: Updates the authenticated user's editable profile fields.
 *     tags:
 *       - Profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               user_name:
 *                 type: string
 *               institutionName:
 *                 type: string
 *               bio:
 *                 type: string
 *               class:
 *                 type: string
 *               gender:
 *                 type: string
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
export async function GET() {
    const error = await requireAuth();
    if (error) return error;

    const user = await getApiSessionUser();
    if (!user) return NextResponse.json({ data: null, message: "Unauthorized", success: false }, { status: 401 });

    const result = await getUserProfile(user.id);

    if (!result.success) {
        return NextResponse.json(result, { status: result.message === "User not found" ? 404 : 500 });
    }

    return NextResponse.json(result);
}

export async function PUT(request: Request) {
    const error = await requireAuth();
    if (error) return error;

    const user = await getApiSessionUser();
    if (!user) return NextResponse.json({ data: null, message: "Unauthorized", success: false }, { status: 401 });

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { data: null, message: "Invalid JSON body", success: false },
            { status: 400 }
        );
    }

    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0];
        const location = firstError?.path?.join(".");
        const detail = firstError?.message ?? "Invalid data";
        const message = location
            ? `Validation failed at "${location}": ${detail}`
            : `Validation failed: ${detail}`;
        logger.warn(`Profile update rejected: validation failed`, { location, detail });
        return NextResponse.json(
            { data: null, message, success: false },
            { status: 400 }
        );
    }

    const result = await updateUserProfile(user.id, {
        ...parsed.data,
        class: parsed.data.class as ClassEnum | null | undefined,
        gender: parsed.data.gender as GenderEnum | null | undefined,
    });

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }

    logger.info(`Profile updated`, { id: user.id });
    return NextResponse.json(result);
}