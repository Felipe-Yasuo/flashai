// src/app/(app)/decks/[id]/study/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
    const router = useRouter()

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
            <div className="flex items-center justify-center h-64 text-amber-100/30 text-sm">
                Carregando...
            </div>
        )
    }

    const cards = deck.cards
    const card = cards[current]
    const progress = ((current + 1) / cards.length) * 100
    const options = [card.optionA, card.optionB, card.optionC, card.optionD]

    function handleAnswer(letter: string) {
        if (chosen) return
        setChosen(letter)
        if (letter === card.correctOption) setScore((s) => s + 1)
    }

    async function handleNext() {
        const isCorrect = chosen === card.correctOption
        const newScore = isCorrect ? score + 1 : score

        if (current + 1 >= cards.length) {
            setSaving(true)
            await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deckId: id,
                    score: newScore,
                    total: cards.length,
                }),
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
            <div className="max-w-lg mx-auto">
                <div className="bg-white/[0.03] border border-amber-600/15 rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-5">{emoji}</div>
                    <h1 className="font-serif text-2xl text-amber-50 mb-2">Quiz concluído!</h1>
                    <p className="text-sm text-amber-100/40 mb-8">Veja como você foi</p>
                    <p className="text-6xl font-medium text-amber-400 leading-none">{score}</p>
                    <p className="text-sm text-amber-100/30 mt-2 mb-10">de {cards.length} corretos</p>
                    <div className="flex gap-2">
                        <Link
                            href={`/decks/${id}`}
                            className="flex-1 py-3 border border-amber-600/25 rounded-lg text-amber-100/60 text-sm hover:border-amber-600/40 transition-colors text-center"
                        >
                            Ver baralho
                        </Link>
                        <button
                            onClick={handleRestart}
                            className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg text-[#0d0c0a] text-sm font-medium transition-colors"
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
            {/* Progress */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-amber-100/35">Card {current + 1} de {cards.length}</span>
                <span className="text-xs text-amber-100/35">{score} correto{score !== 1 ? "s" : ""}</span>
            </div>
            <div className="h-[3px] bg-white/[0.06] rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Pergunta */}
            <div className="bg-white/[0.03] border border-amber-600/15 rounded-2xl p-8 mb-4">
                <p className="text-[10px] tracking-widest uppercase text-amber-100/25 mb-4">
                    Pergunta {current + 1}
                </p>
                <p className="font-serif text-lg text-amber-50 leading-relaxed">{card.question}</p>
            </div>

            {/* Alternativas */}
            <div className="flex flex-col gap-2 mb-4">
                {options.map((option, i) => {
                    const letter = optionLabels[i]
                    const isChosen = chosen === letter
                    const isCorrect = card.correctOption === letter
                    const revealed = !!chosen

                    let style = "border-amber-600/15 bg-white/[0.02] text-amber-100/60 hover:border-amber-600/35 hover:bg-white/[0.04] hover:text-amber-100/90"

                    if (revealed) {
                        if (isChosen && isCorrect) style = "border-emerald-500/40 bg-emerald-500/8 text-amber-100/90"
                        else if (isChosen && !isCorrect) style = "border-red-500/40 bg-red-500/8 text-amber-100/50"
                        else if (!isChosen && isCorrect) style = "border-emerald-500/30 bg-emerald-500/5 text-amber-100/70"
                        else style = "border-amber-600/10 bg-transparent text-amber-100/30"
                    }

                    return (
                        <button
                            key={letter}
                            onClick={() => handleAnswer(letter)}
                            disabled={!!chosen}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${style}`}
                        >
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-medium shrink-0 ${revealed && isCorrect
                                ? "bg-emerald-500/25 text-emerald-400"
                                : revealed && isChosen && !isCorrect
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-white/[0.05] text-amber-100/40"
                                }`}>
                                {letter}
                            </span>
                            {option}
                        </button>
                    )
                })}
            </div>

            {/* Botão próximo */}
            {chosen && (
                <button
                    onClick={handleNext}
                    disabled={saving}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl text-[#0d0c0a] text-sm font-medium transition-colors"
                >
                    {saving ? "Salvando..." : current + 1 >= cards.length ? "Ver resultado" : "Próximo card →"}
                </button>
            )}
        </div>
    )
}