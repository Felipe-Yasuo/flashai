// src/app/api/cards/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id } = await params

    // Verifica se o card pertence ao usuário
    const card = await prisma.card.findUnique({
        where: { id },
        include: { deck: true },
    })

    if (!card || card.deck.userId !== session.user.id) {
        return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    }

    await prisma.card.delete({ where: { id } })

    return NextResponse.json({ success: true })
}