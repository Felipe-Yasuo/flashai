// src/app/(app)/decks/[id]/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

const sourceLabels: Record<string, string> = {
    TEXT: "Texto",
    PDF: "PDF",
    URL: "URL",
    TOPIC: "Tópico",
}

const optionLabels = ["A", "B", "C", "D"]

export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) redirect("/login")

    const { id } = await params

    const deck = await prisma.deck.findUnique({
        where: { id },
        include: { cards: true },
    })

    // Não existe ou não pertence ao usuário
    if (!deck || deck.userId !== session.user.id) notFound()

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-start gap-4">
                    <Link
                        href="/dashboard"
                        className="w-8 h-8 border border-amber-600/20 rounded-lg flex items-center justify-center text-amber-100/40 hover:text-amber-100/70 transition-colors mt-1 shrink-0"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                    </Link>
                    <div>
                        <span className="inline-flex px-2 py-0.5 bg-amber-600/10 border border-amber-600/20 rounded text-[10px] tracking-wider uppercase text-amber-500 mb-2">
                            {sourceLabels[deck.sourceType]}
                        </span>
                        <h1 className="font-serif text-2xl text-amber-50 leading-snug">{deck.title}</h1>
                        <p className="text-xs text-amber-100/30 mt-1">
                            {deck.cards.length} cards · criado em {new Date(deck.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                    </div>
                </div>

                <Link
                    href={`/decks/${id}/study`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-[#0d0c0a] text-sm font-medium transition-colors shrink-0"
                >
                    <svg className="w-3.5 h-3.5" fill="#0d0c0a" viewBox="0 0 24 24">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Iniciar quiz
                </Link>
            </div>

            {/* Grid de cards */}
            <div className="grid grid-cols-2 gap-3">
                {deck.cards.map((card, index) => (
                    <div key={card.id} className="bg-white/[0.03] border border-amber-600/15 rounded-xl p-5">
                        <p className="text-[10px] tracking-widest uppercase text-amber-100/25 mb-3">
                            Card {String(index + 1).padStart(2, "0")}
                        </p>
                        <p className="text-sm font-medium text-amber-50 mb-4 leading-relaxed">
                            {card.question}
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {[card.optionA, card.optionB, card.optionC, card.optionD].map((option, i) => {
                                const letter = optionLabels[i]
                                const isCorrect = card.correctOption === letter
                                return (
                                    <div
                                        key={letter}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${isCorrect
                                                ? "bg-emerald-500/8 text-amber-100/80"
                                                : "text-amber-100/35"
                                            }`}
                                    >
                                        <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-medium shrink-0 ${isCorrect
                                                ? "bg-emerald-500/20 text-emerald-400"
                                                : "bg-white/[0.04] text-amber-100/30"
                                            }`}>
                                            {letter}
                                        </span>
                                        {option}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}