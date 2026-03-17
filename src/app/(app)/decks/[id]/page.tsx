// src/app/(app)/decks/[id]/page.tsx
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
    sourceType: string
    createdAt: string
    cards: Card[]
}

const sourceLabels: Record<string, string> = {
    TEXT: "Texto", PDF: "PDF", URL: "URL", TOPIC: "Tópico",
}

const optionLabels = ["A", "B", "C", "D"]
const optionKeys = ["optionA", "optionB", "optionC", "optionD"] as const

export default function DeckPage() {
    const { id } = useParams<{ id: string }>()

    const [deck, setDeck] = useState<Deck | null>(null)
    const [cards, setCards] = useState<Card[]>([])
    const [editingCard, setEditingCard] = useState<Card | null>(null)
    const [editForm, setEditForm] = useState<Omit<Card, "id" | "correctOption">>({
        question: "", optionA: "", optionB: "", optionC: "", optionD: "",
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch(`/api/decks/${id}`)
            .then((r) => r.json())
            .then((data) => { setDeck(data); setCards(data.cards) })
    }, [id])

    function openEdit(card: Card) {
        setEditingCard(card)
        setEditForm({
            question: card.question,
            optionA: card.optionA,
            optionB: card.optionB,
            optionC: card.optionC,
            optionD: card.optionD,
        })
    }

    async function handleSaveEdit() {
        if (!editingCard) return
        setSaving(true)

        const res = await fetch(`/api/cards/${editingCard.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editForm),
        })

        const updated = await res.json()
        setCards((prev) => prev.map((c) => c.id === updated.id ? updated : c))
        setEditingCard(null)
        setSaving(false)
    }

    async function handleDeleteCard(cardId: string) {
        await fetch(`/api/cards/${cardId}`, { method: "DELETE" })
        setCards((prev) => prev.filter((c) => c.id !== cardId))
    }

    if (!deck) {
        return (
            <div className="flex items-center justify-center h-64 text-amber-100/30 text-sm">
                Carregando...
            </div>
        )
    }

    return (
        <div>
            {/* Modal de edição */}
            {editingCard && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-[#1a1814] border border-amber-600/20 rounded-2xl p-8 w-full max-w-md">
                        <h2 className="font-serif text-lg text-amber-50 mb-6">Editar card</h2>

                        <div className="space-y-4">
                            {/* Pergunta */}
                            <div>
                                <label className="block text-[10px] tracking-widest uppercase text-amber-100/35 mb-2">
                                    Pergunta
                                </label>
                                <textarea
                                    rows={2}
                                    value={editForm.question}
                                    onChange={(e) => setEditForm((p) => ({ ...p, question: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-amber-600/20 focus:border-amber-600/50 rounded-lg text-amber-50 text-sm placeholder-amber-100/20 outline-none transition-colors resize-none"
                                />
                            </div>

                            {/* Opções */}
                            {optionKeys.map((key, i) => (
                                <div key={key}>
                                    <label className="block text-[10px] tracking-widest uppercase text-amber-100/35 mb-2">
                                        Opção {optionLabels[i]}
                                        {editingCard.correctOption === optionLabels[i] && (
                                            <span className="ml-2 text-emerald-400 normal-case tracking-normal">✓ correta</span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm[key]}
                                        onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-amber-600/20 focus:border-amber-600/50 rounded-lg text-amber-50 text-sm outline-none transition-colors"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setEditingCard(null)}
                                className="flex-1 py-2.5 border border-amber-600/20 rounded-lg text-amber-100/50 text-sm hover:border-amber-600/40 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={saving}
                                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg text-[#0d0c0a] text-sm font-medium transition-colors"
                            >
                                {saving ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            {cards.length} cards · criado em {new Date(deck.createdAt).toLocaleDateString("pt-BR")}
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
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        className="group relative bg-white/[0.03] border border-amber-600/15 hover:border-amber-600/30 rounded-xl p-5 cursor-pointer transition-all"
                        onClick={() => openEdit(card)}
                    >
                        {/* Botão X */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id) }}
                            className="absolute top-3 right-3 w-5 h-5 rounded flex items-center justify-center text-amber-100/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

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
    )
}