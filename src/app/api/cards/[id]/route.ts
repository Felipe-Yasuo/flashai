// src/app/api/cards/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id } = await params

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id } = await params
    const { question, optionA, optionB, optionC, optionD } = await req.json()

    const card = await prisma.card.findUnique({
        where: { id },
        include: { deck: true },
    })

    if (!card || card.deck.userId !== session.user.id) {
        return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
    }

    const updated = await prisma.card.update({
        where: { id },
        data: { question, optionA, optionB, optionC, optionD },
    })

    return NextResponse.json(updated)
}