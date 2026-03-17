// src/app/api/dashboard/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const userId = session.user.id

    const [decks, cardCount, sessionCount] = await Promise.all([
        prisma.deck.findMany({
            where: { userId },
            include: { _count: { select: { cards: true } } },
            orderBy: { createdAt: "desc" },
        }),
        prisma.card.count({ where: { deck: { userId } } }),
        prisma.studySession.count({ where: { userId } }),
    ])

    return NextResponse.json({
        decks,
        stats: {
            decks: decks.length,
            cards: cardCount,
            sessions: sessionCount,
        },
    })
}