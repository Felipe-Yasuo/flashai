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
            <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--ink-faint)" }}>
                Carregando...
            </div>
        )
    }

    if (cards.length === 0) {
        return (
            <div className="max-w-md mx-auto text-center py-24">
                <div className="text-5xl mb-6">🎉</div>
                <h1 className="font-display text-3xl mb-2" style={{ color: "var(--ink)" }}>Tudo em dia!</h1>
                <p className="text-sm mb-8" style={{ color: "var(--ink-muted)" }}>
                    Nenhum card pra revisar hoje. Volte amanhã!
                </p>
                <Link
                    href="/dashboard"
                    className="inline-flex px-5 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ background: "var(--accent)", color: "#0e0d0b" }}
                >
                    Voltar pro dashboard
                </Link>
            </div>
        )
    }

    if (done) {
        return (
            <div className="max-w-md mx-auto">
                <div
                    className="rounded-2xl p-12 text-center"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--rule)" }}
                >
                    <div className="text-5xl mb-6">✅</div>
                    <h1 className="font-display text-3xl mb-1" style={{ color: "var(--ink)" }}>Revisão concluída!</h1>
                    <p className="text-sm mb-2" style={{ color: "var(--ink-muted)" }}>Excelente trabalho hoje</p>
                    <p className="font-display text-5xl mb-8" style={{ color: "var(--accent-bright)" }}>{reviewed}</p>
                    <p className="text-xs mb-8" style={{ color: "var(--ink-faint)" }}>cards revisados</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex px-6 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ background: "var(--accent)", color: "#0e0d0b" }}
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
    const progress = (current / cards.length) * 100

    return (
        <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-xs font-medium" style={{ color: "var(--ink-muted)" }}>{card.deck.title}</p>
                    <p className="text-[10px] tracking-widest uppercase font-semibold mt-0.5" style={{ color: "var(--ink-faint)" }}>
                        {current + 1} de {cards.length} pra hoje
                    </p>
                </div>
                <Link href="/dashboard" className="text-xs transition-colors" style={{ color: "var(--ink-faint)" }}>
                    Sair
                </Link>
            </div>

            {/* Progress */}
            <div className="h-0.5 rounded-full mb-8 overflow-hidden" style={{ background: "var(--ink-ghost)" }}>
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: "var(--accent)" }}
                />
            </div>

            {/* Pergunta */}
            <div
                className="rounded-2xl p-8 mb-4"
                style={{ background: "var(--bg-card)", border: "1px solid var(--rule)" }}
            >
                <p className="font-display text-xl leading-relaxed" style={{ color: "var(--ink)" }}>
                    {card.question}
                </p>
            </div>

            {/* Alternativas */}
            <div className="flex flex-col gap-2 mb-6">
                {options.map((option, i) => {
                    const letter = optionLabels[i]
                    const isChosen = chosen === letter
                    const isCorrect = card.correctOption === letter

                    let borderColor = "var(--rule)"
                    let bgColor = "var(--bg-card)"
                    let textColor = "var(--ink-muted)"
                    let badgeBg = "var(--ink-ghost)"
                    let badgeColor = "var(--ink-faint)"

                    if (answered) {
                        if (isChosen && isCorrect) {
                            borderColor = "rgba(16,185,129,0.4)"; bgColor = "rgba(16,185,129,0.06)"
                            textColor = "var(--ink)"; badgeBg = "rgba(16,185,129,0.2)"; badgeColor = "#34d399"
                        } else if (isChosen && !isCorrect) {
                            borderColor = "rgba(239,68,68,0.4)"; bgColor = "rgba(239,68,68,0.06)"
                            textColor = "var(--ink-muted)"; badgeBg = "rgba(239,68,68,0.2)"; badgeColor = "#f87171"
                        } else if (!isChosen && isCorrect) {
                            borderColor = "rgba(16,185,129,0.25)"; bgColor = "rgba(16,185,129,0.03)"
                            textColor = "var(--ink-muted)"; badgeBg = "rgba(16,185,129,0.12)"; badgeColor = "#34d399"
                        } else {
                            borderColor = "var(--rule)"; bgColor = "transparent"
                            textColor = "var(--ink-faint)"; badgeBg = "transparent"; badgeColor = "var(--ink-ghost)"
                        }
                    }

                    return (
                        <button
                            key={letter}
                            onClick={() => !answered && setChosen(letter)}
                            disabled={answered}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all"
                            style={{ borderColor, background: bgColor, color: textColor }}
                        >
                            <span
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold shrink-0"
                                style={{ background: badgeBg, color: badgeColor }}
                            >
                                {letter}
                            </span>
                            {option}
                        </button>
                    )
                })}
            </div>

            {/* Dificuldade */}
            {answered && (
                <div>
                    <p className="text-[10px] tracking-widest uppercase font-semibold text-center mb-3" style={{ color: "var(--ink-faint)" }}>
                        Como foi?
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { key: "again" as const, label: "Errei", sub: "amanhã", emoji: "😵", color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)" },
                            { key: "hard" as const, label: "Difícil", sub: "3 dias", emoji: "😅", color: "var(--accent-bright)", bg: "var(--accent-dim)", border: "var(--accent-border)" },
                            { key: "easy" as const, label: "Fácil", sub: "7 dias", emoji: "😎", color: "#34d399", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)" },
                        ].map(({ key, label, sub, emoji, color, bg, border }) => (
                            <button
                                key={key}
                                onClick={() => handleDifficulty(key)}
                                className="py-3 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
                                style={{ background: bg, border: `1px solid ${border}`, color }}
                            >
                                <span className="block text-lg mb-0.5">{emoji}</span>
                                {label}
                                <span className="block text-[10px] mt-0.5 opacity-60">{sub}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
