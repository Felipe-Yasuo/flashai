// src/app/shared/[token]/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

const optionLabels = ["A", "B", "C", "D"]

const sourceLabels: Record<string, string> = {
    TEXT: "Texto", PDF: "PDF", URL: "URL", TOPIC: "Tópico",
}

export default async function SharedDeckPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params

    const deck = await prisma.deck.findUnique({
        where: { shareToken: token, isPublic: true },
        include: { cards: true },
    })

    if (!deck) notFound()

    return (
        <main className="min-h-screen bg-[#0d0c0a] px-6 py-12">
            {/* Fundo */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-amber-600 opacity-10 blur-[80px]" />
            </div>

            <div className="relative max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-amber-800 flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 stroke-amber-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="font-serif text-sm text-amber-50/60">FlashAI</span>
                    </div>

                    <span className="inline-flex px-2 py-0.5 bg-amber-600/10 border border-amber-600/20 rounded text-[10px] tracking-wider uppercase text-amber-500 mb-3">
                        {sourceLabels[deck.sourceType]}
                    </span>
                    <h1 className="font-serif text-3xl text-amber-50 mb-2">{deck.title}</h1>
                    <p className="text-sm text-amber-100/30">{deck.cards.length} cards</p>
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
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${isCorrect ? "bg-emerald-500/8 text-amber-100/80" : "text-amber-100/35"
                                                }`}
                                        >
                                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-medium shrink-0 ${isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.04] text-amber-100/30"
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
        </main>
    )
}