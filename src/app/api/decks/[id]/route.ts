// src/app/api/decks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id } = await params

    const deck = await prisma.deck.findUnique({
        where: { id },
        include: { cards: true },
    })

    if (!deck || deck.userId !== session.user.id) {
        return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    }

    return NextResponse.json(deck)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id } = await params

    const deck = await prisma.deck.findUnique({ where: { id } })

    if (!deck || deck.userId !== session.user.id) {
        return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    }

    await prisma.deck.delete({ where: { id } })

    return NextResponse.json({ success: true })
}