// src/app/api/decks/[id]/share/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id } = await params

    const deck = await prisma.deck.findUnique({ where: { id } })

    if (!deck || deck.userId !== session.user.id) {
        return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    }

    if (deck.isPublic) {
        // Desativa o compartilhamento
        const updated = await prisma.deck.update({
            where: { id },
            data: { isPublic: false, shareToken: null },
        })
        return NextResponse.json(updated)
    } else {
        // Ativa e gera token único
        const shareToken = randomBytes(16).toString("hex")
        const updated = await prisma.deck.update({
            where: { id },
            data: { isPublic: true, shareToken },
        })
        return NextResponse.json(updated)
    }
}