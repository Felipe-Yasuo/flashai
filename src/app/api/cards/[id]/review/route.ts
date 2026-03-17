// src/app/api/cards/[id]/review/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getNextReviewDate, type Difficulty } from "@/lib/spaced-repetition"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id } = await params
    const { difficulty } = await req.json() as { difficulty: Difficulty }

    const card = await prisma.card.findUnique({
        where: { id },
        include: { deck: true },
    })

    if (!card || card.deck.userId !== session.user.id) {
        return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    }

    const nextReview = getNextReviewDate(difficulty)
    const intervalMap: Record<Difficulty, number> = { easy: 7, hard: 3, again: 1 }

    const updated = await prisma.card.update({
        where: { id },
        data: {
            nextReview,
            interval: intervalMap[difficulty],
        },
    })

    return NextResponse.json(updated)
}