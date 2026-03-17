//src/app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SourceType } from "@/generated/prisma"

const groq = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { title, sourceType, content, cardCount } = await req.json()

    if (!title || !sourceType || !content || !cardCount) {
        return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    const sourceContext: Record<string, string> = {
        TEXT: `Baseado no seguinte texto:\n\n${content}`,
        URL: `Baseado no conteúdo da URL: ${content}`,
        TOPIC: `Sobre o tópico: ${content}`,
        PDF: `Baseado no seguinte conteúdo extraído de um PDF:\n\n${content}`,
    }

    const prompt = `Você é um especialista em criar flashcards para estudo.

${sourceContext[sourceType]}

Gere exatamente ${cardCount} flashcards no formato de quiz com múltipla escolha.

REGRAS:
- Cada flashcard deve ter uma pergunta clara e objetiva
- 4 alternativas (A, B, C, D) — apenas uma correta
- As alternativas incorretas devem ser plausíveis
- Varie o nível de dificuldade
- Foque nos conceitos mais importantes

Responda SOMENTE com um array JSON válido, sem explicações, sem markdown, sem blocos de código. Exemplo do formato:
[
  {
    "question": "Qual é...?",
    "optionA": "...",
    "optionB": "...",
    "optionC": "...",
    "optionD": "...",
    "correctOption": "A"
  }
]`

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        })

        const rawText = completion.choices[0].message.content ?? ""

        const match = rawText.match(/\[[\s\S]*\]/)
        if (!match) {
            return NextResponse.json({ error: "A IA não retornou cards válidos" }, { status: 500 })
        }

        let cleaned = match[0]

        cleaned = cleaned.replace(/:\s*([^",\]\[{}\n][^,\]\[{}\n]*?)(\s*[,\}])/g, (_, val, end) => {
            const trimmed = val.trim()
            if (trimmed.startsWith('"') || trimmed === 'true' || trimmed === 'false' || !isNaN(Number(trimmed))) {
                return `: ${trimmed}${end}`
            }
            return `: "${trimmed}"${end}`
        })

        let cards
        try {
            cards = JSON.parse(cleaned)
        } catch {
            return NextResponse.json({ error: "A IA retornou JSON inválido. Tente gerar novamente." }, { status: 500 })
        }

        if (!Array.isArray(cards) || cards.length === 0) {
            return NextResponse.json({ error: "A IA não retornou cards válidos" }, { status: 500 })
        }

        const deck = await prisma.$transaction(async (tx) => {
            const newDeck = await tx.deck.create({
                data: {
                    title,
                    sourceType: sourceType as SourceType,
                    userId: session.user.id,
                },
            })

            await tx.card.createMany({
                data: cards.map((card: {
                    question: string
                    optionA: string
                    optionB: string
                    optionC: string
                    optionD: string
                    correctOption: string
                }) => ({
                    ...card,
                    deckId: newDeck.id,
                })),
            })

            return newDeck
        }, {
            timeout: 30000,
        })

        return NextResponse.json({ deckId: deck.id })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Erro ao gerar flashcards" }, { status: 500 })
    }
}