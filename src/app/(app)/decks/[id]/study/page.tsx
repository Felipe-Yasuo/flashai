"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface Card {
    id: string
    question: string
    optionA: string
    optionB: string
    optionC: string
    optionD: string
    correctOption: string
}

interface Deck {
    id: string
    title: string
    cards: Card[]
}

const optionLabels = ["A", "B", "C", "D"] as const

export default function StudyPage() {
    const { id } = useParams<{ id: string }>()

    const [deck, setDeck] = useState<Deck | null>(null)
    const [current, setCurrent] = useState(0)
    const [chosen, setChosen] = useState<string | null>(null)
    const [score, setScore] = useState(0)
    const [finished, setFinished] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch(`/api/decks/${id}`)
            .then((r) => r.json())
            .then(setDeck)
    }, [id])

    if (!deck) {
        return (
            <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--ink-faint)" }}>
                Carregando...
            </div>
        )
    }

    const cards = deck.cards
    const card = cards[current]
    const progress = ((current) / cards.length) * 100
    const options = [card.optionA, card.optionB, card.optionC, card.optionD]

    function handleAnswer(letter: string) {
        if (chosen) return
        setChosen(letter)
    }

    async function handleNext() {
        const isCorrect = chosen === card.correctOption
        const newScore = isCorrect ? score + 1 : score

        if (current + 1 >= cards.length) {
            setSaving(true)
            await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deckId: id, score: newScore, total: cards.length }),
            })
            setSaving(false)
            setScore(newScore)
            setFinished(true)
        } else {
            setScore(newScore)
            setCurrent((c) => c + 1)
            setChosen(null)
        }
    }

    function handleRestart() {
        setCurrent(0)
        setChosen(null)
        setScore(0)
        setFinished(false)
    }

    if (finished) {
        const pct = Math.round((score / cards.length) * 100)
        const emoji = pct === 100 ? "🏆" : pct >= 70 ? "🎉" : pct >= 40 ? "📚" : "💪"

        return (
            <div className="max-w-md mx-auto">
                <div
                    className="rounded-2xl p-12 text-center"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--rule)" }}
                >
                    <div className="text-5xl mb-6">{emoji}</div>
                    <h1 className="font-display text-3xl mb-1" style={{ color: "var(--ink)" }}>Quiz concluído!</h1>
                    <p className="text-sm mb-8" style={{ color: "var(--ink-muted)" }}>Veja como você foi</p>

                    <div className="mb-2">
                        <span className="font-display text-6xl" style={{ color: "var(--accent-bright)" }}>{score}</span>
                        <span className="font-display text-2xl ml-1" style={{ color: "var(--ink-faint)" }}>/{cards.length}</span>
                    </div>
                    <p className="text-sm mb-10" style={{ color: "var(--ink-faint)" }}>
                        {pct}% de acerto
                    </p>

                    <div className="flex gap-2">
                        <Link
                            href={`/decks/${id}`}
                            className="flex-1 py-3 rounded-lg text-sm text-center transition-colors"
                            style={{ border: "1px solid var(--rule)", color: "var(--ink-muted)" }}
                        >
                            Ver baralho
                        </Link>
                        <button
                            onClick={handleRestart}
                            className="flex-1 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                            style={{ background: "var(--accent)", color: "#0e0d0b" }}
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-xs font-medium" style={{ color: "var(--ink-muted)" }}>{deck.title}</p>
                    <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: "var(--ink-faint)" }}>
                        Card {current + 1} de {cards.length}
                    </p>
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--accent-bright)" }}>
                    {score} correto{score !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Progress bar */}
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
                <p className="text-[10px] tracking-[0.12em] uppercase font-semibold mb-4" style={{ color: "var(--ink-ghost)" }}>
                    Pergunta {current + 1}
                </p>
                <p className="font-display text-xl leading-relaxed" style={{ color: "var(--ink)" }}>{card.question}</p>
            </div>

            {/* Alternativas */}
            <div className="flex flex-col gap-2 mb-4">
                {options.map((option, i) => {
                    const letter = optionLabels[i]
                    const isChosen = chosen === letter
                    const isCorrect = card.correctOption === letter
                    const revealed = !!chosen

                    let borderColor = "var(--rule)"
                    let bgColor = "var(--bg-card)"
                    let textColor = "var(--ink-muted)"
                    let badgeBg = "var(--ink-ghost)"
                    let badgeColor = "var(--ink-faint)"

                    if (revealed) {
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
                            onClick={() => handleAnswer(letter)}
                            disabled={!!chosen}
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

            {/* Próximo */}
            {chosen && (
                <button
                    onClick={handleNext}
                    disabled={saving}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50 hover:opacity-90"
                    style={{ background: "var(--accent)", color: "#0e0d0b" }}
                >
                    {saving ? "Salvando..." : current + 1 >= cards.length ? "Ver resultado" : "Próximo →"}
                </button>
            )}
        </div>
    )
}
