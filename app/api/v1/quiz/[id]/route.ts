import { NextResponse, NextRequest } from "next/server";
import { getQuizQuestionById, updateQuizQuestionById, deleteQuizQuestionById } from "@/services/quiz.service";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const questionId = parseInt(id, 10);

    if (Number.isNaN(questionId)) {
        return NextResponse.json(
            { data: null, message: "Invalid question id", success: false },
            { status: 400 }
        );
    }

    const result = await getQuizQuestionById(questionId);

    if (!result.success) {
        const status = result.message === "Quiz question not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const questionId = parseInt(id, 10);

    if (Number.isNaN(questionId)) {
        return NextResponse.json(
            { data: null, message: "Invalid question id", success: false },
            { status: 400 }
        );
    }

    const body = await request.json();
    const result = await updateQuizQuestionById(questionId, body);

    if (!result.success) {
        const status = result.message === "Quiz question not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const questionId = parseInt(id, 10);

    if (Number.isNaN(questionId)) {
        return NextResponse.json(
            { data: null, message: "Invalid question id", success: false },
            { status: 400 }
        );
    }

    const result = await deleteQuizQuestionById(questionId);

    if (!result.success) {
        const status = result.message === "Quiz question not found" ? 404 : 500;
        return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
}
