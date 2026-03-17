// src/app/api/review/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isDueToday } from "@/lib/spaced-repetition"

export async function GET() {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const today = new Date()
    today.setHours(23, 59, 59, 999)

    // Busca cards de todos os baralhos do usuário que vencem hoje ou nunca foram estudados
    const cards = await prisma.card.findMany({
        where: {
            deck: { userId: session.user.id },
            OR: [
                { nextReview: null },
                { nextReview: { lte: today } },
            ],
        },
        include: { deck: { select: { title: true } } },
        orderBy: { nextReview: "asc" },
    })

    return NextResponse.json(cards)
}