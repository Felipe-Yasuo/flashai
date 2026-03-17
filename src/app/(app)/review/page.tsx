// src/app/(app)/review/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Card {
    id: string
    question: string
    optionA: string
    optionB: string
    optionC: string
    optionD: string
    correctOption: string
    nextReview: string | null
    deck: { title: string }
}

const optionLabels = ["A", "B", "C", "D"] as const

export default function ReviewPage() {
    const [cards, setCards] = useState<Card[]>([])
    const [current, setCurrent] = useState(0)
    const [chosen, setChosen] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [done, setDone] = useState(false)
    const [reviewed, setReviewed] = useState(0)

    useEffect(() => {
        fetch("/api/review")
            .then((r) => r.json())
            .then((data) => { setCards(data); setLoading(false) })
    }, [])

    async function handleDifficulty(difficulty: "easy" | "hard" | "again") {
        const card = cards[current]

        await fetch(`/api/cards/${card.id}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ difficulty }),
        })

        setReviewed((r) => r + 1)

        if (current + 1 >= cards.length) {
            setDone(true)
        } else {
            setCurrent((c) => c + 1)
            setChosen(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-amber-100/30 text-sm">
                Carregando...
            </div>
        )
    }

    if (cards.length === 0) {
        return (
            <div className="max-w-lg mx-auto text-center py-20">
                <p className="text-4xl mb-4">🎉</p>
                <h1 className="font-serif text-2xl text-amber-50 mb-2">Tudo em dia!</h1>
                <p className="text-sm text-amber-100/40 mb-8">Nenhum card pra revisar hoje. Volte amanhã!</p>
                <Link href="/dashboard" className="text-amber-500 hover:text-amber-400 text-sm underline underline-offset-2">
                    Voltar pro dashboard
                </Link>
            </div>
        )
    }

    if (done) {
        return (
            <div className="max-w-lg mx-auto text-center">
                <div className="bg-white/[0.03] border border-amber-600/15 rounded-2xl p-12">
                    <p className="text-5xl mb-5">✅</p>
                    <h1 className="font-serif text-2xl text-amber-50 mb-2">Revisão concluída!</h1>
                    <p className="text-sm text-amber-100/40 mb-8">{reviewed} cards revisados hoje</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg text-[#0d0c0a] text-sm font-medium transition-colors"
                    >
                        Voltar pro dashboard
                    </Link>
                </div>
            </div>
        )
    }

    const card = cards[current]
    const options = [card.optionA, card.optionB, card.optionC, card.optionD]
    const answered = !!chosen

    return (
        <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-xs text-amber-100/30">{card.deck.title}</p>
                    <p className="text-[10px] tracking-widest uppercase text-amber-100/20 mt-0.5">
                        {current + 1} de {cards.length} pra hoje
                    </p>
                </div>
                <Link href="/dashboard" className="text-xs text-amber-100/30 hover:text-amber-100/60 transition-colors">
                    Sair
                </Link>
            </div>

            {/* Pergunta */}
            <div className="bg-white/[0.03] border border-amber-600/15 rounded-2xl p-8 mb-4">
                <p className="font-serif text-lg text-amber-50 leading-relaxed">{card.question}</p>
            </div>

            {/* Alternativas */}
            <div className="flex flex-col gap-2 mb-6">
                {options.map((option, i) => {
                    const letter = optionLabels[i]
                    const isChosen = chosen === letter
                    const isCorrect = card.correctOption === letter

                    let style = "border-amber-600/15 bg-white/[0.02] text-amber-100/60 hover:border-amber-600/35 hover:bg-white/[0.04] hover:text-amber-100/90"

                    if (answered) {
                        if (isChosen && isCorrect) style = "border-emerald-500/40 bg-emerald-500/8 text-amber-100/90"
                        else if (isChosen && !isCorrect) style = "border-red-500/40 bg-red-500/8 text-amber-100/50"
                        else if (!isChosen && isCorrect) style = "border-emerald-500/30 bg-emerald-500/5 text-amber-100/70"
                        else style = "border-amber-600/10 bg-transparent text-amber-100/30"
                    }

                    return (
                        <button
                            key={letter}
                            onClick={() => !answered && setChosen(letter)}
                            disabled={answered}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${style}`}
                        >
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-medium shrink-0 ${answered && isCorrect ? "bg-emerald-500/25 text-emerald-400"
                                    : answered && isChosen && !isCorrect ? "bg-red-500/20 text-red-400"
                                        : "bg-white/[0.05] text-amber-100/40"
                                }`}>
                                {letter}
                            </span>
                            {option}
                        </button>
                    )
                })}
            </div>

            {/* Botões de dificuldade — aparecem após responder */}
            {answered && (
                <div>
                    <p className="text-[10px] tracking-widest uppercase text-amber-100/30 text-center mb-3">
                        Como foi?
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => handleDifficulty("again")}
                            className="py-3 rounded-xl border border-red-500/25 bg-red-500/5 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors"
                        >
                            <span className="block text-lg mb-0.5">😵</span>
                            Errei
                            <span className="block text-[10px] text-red-400/60 mt-0.5">amanhã</span>
                        </button>
                        <button
                            onClick={() => handleDifficulty("hard")}
                            className="py-3 rounded-xl border border-amber-500/25 bg-amber-500/5 text-amber-400 text-xs font-medium hover:bg-amber-500/10 transition-colors"
                        >
                            <span className="block text-lg mb-0.5">😅</span>
                            Difícil
                            <span className="block text-[10px] text-amber-400/60 mt-0.5">3 dias</span>
                        </button>
                        <button
                            onClick={() => handleDifficulty("easy")}
                            className="py-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-xs font-medium hover:bg-emerald-500/10 transition-colors"
                        >
                            <span className="block text-lg mb-0.5">😎</span>
                            Fácil
                            <span className="block text-[10px] text-emerald-400/60 mt-0.5">7 dias</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}