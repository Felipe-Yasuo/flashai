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
    const [isPublic, setIsPublic] = useState(false)
    const [shareToken, setShareToken] = useState<string | null>(null)
    const [sharing, setSharing] = useState(false)
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
            .then((data) => {
                setDeck(data)
                setCards(data.cards)
                setIsPublic(data.isPublic)
                setShareToken(data.shareToken)
            })
    }, [id])

    async function handleShare() {
        setSharing(true)
        const res = await fetch(`/api/decks/${id}/share`, { method: "POST" })
        const data = await res.json()
        setIsPublic(data.isPublic)
        setShareToken(data.shareToken)
        setSharing(false)
        if (data.isPublic && data.shareToken) {
            const url = `${window.location.origin}/shared/${data.shareToken}`
            await navigator.clipboard.writeText(url)
            alert("Link copiado pra área de transferência!")
        }
    }

    function openEdit(card: Card) {
        setEditingCard(card)
        setEditForm({ question: card.question, optionA: card.optionA, optionB: card.optionB, optionC: card.optionC, optionD: card.optionD })
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
            <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--ink-faint)" }}>
                Carregando...
            </div>
        )
    }

    return (
        <div>
            {/* Modal edição */}
            {editingCard && (
                <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
                    <div className="w-full max-w-md rounded-2xl p-8" style={{ background: "var(--bg-overlay)", border: "1px solid var(--rule)" }}>
                        <h2 className="font-display text-xl mb-6" style={{ color: "var(--ink)" }}>Editar card</h2>

                        <div className="space-y-4">
                            <EditField label="Pergunta">
                                <textarea
                                    rows={2}
                                    value={editForm.question}
                                    onChange={(e) => setEditForm((p) => ({ ...p, question: e.target.value }))}
                                    className="input-style resize-none"
                                />
                            </EditField>
                            {optionKeys.map((key, i) => (
                                <EditField
                                    key={key}
                                    label={`Opção ${optionLabels[i]}${editingCard.correctOption === optionLabels[i] ? " ✓" : ""}`}
                                    highlight={editingCard.correctOption === optionLabels[i]}
                                >
                                    <input
                                        type="text"
                                        value={editForm[key]}
                                        onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))}
                                        className="input-style"
                                    />
                                </EditField>
                            ))}
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setEditingCard(null)}
                                className="flex-1 py-2.5 rounded-lg text-sm transition-colors"
                                style={{ border: "1px solid var(--rule)", color: "var(--ink-muted)" }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
                                style={{ background: "var(--accent)", color: "#0e0d0b" }}
                            >
                                {saving ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-10">
                <div className="flex items-start gap-4">
                    <Link
                        href="/dashboard"
                        className="w-8 h-8 rounded-lg flex items-center justify-center mt-1 shrink-0 transition-colors"
                        style={{ border: "1px solid var(--rule)", color: "var(--ink-faint)" }}
                        onMouseOver={(e) => e.currentTarget.style.color = "var(--ink-muted)"}
                        onMouseOut={(e) => e.currentTarget.style.color = "var(--ink-faint)"}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                    </Link>
                    <div>
                        <span
                            className="inline-flex px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold mb-2"
                            style={{ background: "var(--accent-dim)", color: "var(--accent-bright)", border: "1px solid var(--accent-border)" }}
                        >
                            {sourceLabels[deck.sourceType]}
                        </span>
                        <h1 className="font-display text-2xl leading-snug" style={{ color: "var(--ink)" }}>{deck.title}</h1>
                        <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>
                            {cards.length} cards · criado em {new Date(deck.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleShare}
                        disabled={sharing}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={isPublic
                            ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }
                            : { border: "1px solid var(--rule)", color: "var(--ink-faint)" }
                        }
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                            {isPublic
                                ? <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.101 1.102" />
                                : <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            }
                        </svg>
                        {sharing ? "..." : isPublic ? "Público" : "Compartilhar"}
                    </button>

                    <Link
                        href={`/decks/${id}/study`}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ background: "var(--accent)", color: "#0e0d0b" }}
                    >
                        <svg className="w-3.5 h-3.5" fill="#0e0d0b" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Iniciar quiz
                    </Link>
                </div>
            </div>

            {/* Grid de cards */}
            <div className="grid grid-cols-2 gap-3">
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        className="group relative rounded-xl p-5 cursor-pointer transition-all"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--rule)" }}
                        onClick={() => openEdit(card)}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--accent-border)"}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--rule)"}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id) }}
                            className="absolute top-3 right-3 w-5 h-5 rounded flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            style={{ color: "var(--ink-faint)" }}
                            onMouseOver={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)" }}
                            onMouseOut={(e) => { e.currentTarget.style.color = "var(--ink-faint)"; e.currentTarget.style.background = "transparent" }}
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        <p className="text-[10px] tracking-[0.12em] uppercase font-semibold mb-3" style={{ color: "var(--ink-ghost)" }}>
                            Card {String(index + 1).padStart(2, "0")}
                        </p>
                        <p className="text-sm font-medium leading-relaxed mb-4" style={{ color: "var(--ink)" }}>
                            {card.question}
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {[card.optionA, card.optionB, card.optionC, card.optionD].map((option, i) => {
                                const letter = optionLabels[i]
                                const isCorrect = card.correctOption === letter
                                return (
                                    <div
                                        key={letter}
                                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs"
                                        style={isCorrect
                                            ? { background: "rgba(16,185,129,0.06)", color: "var(--ink-muted)" }
                                            : { color: "var(--ink-faint)" }
                                        }
                                    >
                                        <span
                                            className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-semibold shrink-0"
                                            style={isCorrect
                                                ? { background: "rgba(16,185,129,0.18)", color: "#34d399" }
                                                : { background: "var(--ink-ghost)", color: "var(--ink-faint)" }
                                            }
                                        >
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

function EditField({ label, children, highlight }: { label: string; children: React.ReactNode; highlight?: boolean }) {
    return (
        <div>
            <label
                className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-2"
                style={{ color: highlight ? "#34d399" : "var(--ink-faint)" }}
            >
                {label}
            </label>
            {children}
        </div>
    )
}
