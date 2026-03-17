import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { deckId, score, total } = await req.json()

    const studySession = await prisma.studySession.create({
        data: {
            userId: session.user.id,
            deckId,
            score,
            total,
        },
    })

    return NextResponse.json(studySession)
}