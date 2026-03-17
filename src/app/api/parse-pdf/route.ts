import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
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
