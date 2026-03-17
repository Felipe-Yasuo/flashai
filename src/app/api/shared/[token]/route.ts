// src/app/api/shared/[token]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params

    const deck = await prisma.deck.findUnique({
        where: { shareToken: token, isPublic: true },
        include: { cards: true },
    })

    if (!deck) {
        return NextResponse.json({ error: "Baralho não encontrado ou não compartilhado" }, { status: 404 })
    }

    return NextResponse.json(deck)
}