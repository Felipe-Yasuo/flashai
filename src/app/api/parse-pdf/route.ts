import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { pdfRatelimit } from "@/lib/ratelimit"

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { success, limit, remaining, reset } = await pdfRatelimit.limit(session.user.id)
    if (!success) {
        return NextResponse.json(
            { error: `Limite diário de ${limit} uploads de PDF atingido. Tente novamente em ${new Date(reset).toLocaleTimeString("pt-BR")}.` },
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": String(limit),
                    "X-RateLimit-Remaining": String(remaining),
                    "X-RateLimit-Reset": String(reset),
                    "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
                },
            }
        )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file || file.type !== "application/pdf") {
        return NextResponse.json({ error: "Arquivo PDF inválido" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // pdf-parse v1 é CJS puro — deve ser importado dinamicamente para evitar
    // que o bundler do Next.js tente processar seus internos
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse")
    const data = await pdfParse(buffer)

    return NextResponse.json({ text: data.text })
}
