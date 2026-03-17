// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Todos os campos são obrigatórios" },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })

        if (existingUser) {
            return NextResponse.json(
                { error: "Email já cadastrado" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        })

        return NextResponse.json(
            { message: "Usuário criado com sucesso", userId: user.id },
            { status: 201 }
        )
    } catch {
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}