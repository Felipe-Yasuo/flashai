"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Deck {
    id: string
    title: string
    sourceType: string
    createdAt: string
    _count: { cards: number }
}

interface Stats {
    decks: number
    cards: number
    sessions: number
}

const sourceLabels: Record<string, string> = {
    TEXT: "Texto", PDF: "PDF", URL: "URL", TOPIC: "Tópico",
}

export default function DashboardPage() {
    const [decks, setDecks] = useState<Deck[]>([])
    const [stats, setStats] = useState<Stats>({ decks: 0, cards: 0, sessions: 0 })
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeck, setConfirmDeck] = useState<Deck | null>(null)

    useEffect(() => {
        fetch("/api/dashboard").then((r) => r.json()).then((data) => {
            setDecks(data.decks)
            setStats(data.stats)
        })
    }, [])

    async function handleDeleteDeck(id: string) {
        setDeletingId(id)
        await fetch(`/api/decks/${id}`, { method: "DELETE" })
        setDecks((prev) => prev.filter((d) => d.id !== id))
        setStats((prev) => ({ ...prev, decks: prev.decks - 1 }))
        setDeletingId(null)
        setConfirmDeck(null)
    }

    return (
        <div>
            {/* Modal */}
            {confirmDeck && (
                <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
                    <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: "var(--bg-overlay)", border: "1px solid var(--rule)" }}>
                        <h2 className="font-display text-xl mb-2" style={{ color: "var(--ink)" }}>Deletar baralho?</h2>
                        <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
                            "{confirmDeck.title}" e todos os seus cards serão removidos permanentemente.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfirmDeck(null)}
                                className="flex-1 py-2.5 rounded-lg text-sm transition-colors"
                                style={{ border: "1px solid var(--rule)", color: "var(--ink-muted)" }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteDeck(confirmDeck.id)}
                                disabled={!!deletingId}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                                style={{ background: "#ef4444", color: "#fff" }}
                            >
                                {deletingId ? "Deletando..." : "Confirmar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-10">
                <div>
                    <p className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-1" style={{ color: "var(--ink-faint)" }}>
                        Seu espaço de estudo
                    </p>
                    <h1 className="font-display text-3xl" style={{ color: "var(--ink)" }}>Baralhos</h1>
                </div>
                <Link
                    href="/new"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: "var(--accent)", color: "#0e0d0b" }}
                >
                    + Novo baralho
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-10">
                {[
                    { label: "Baralhos", value: stats.decks, suffix: "" },
                    { label: "Flashcards", value: stats.cards, suffix: "" },
                    { label: "Sessões", value: stats.sessions, suffix: "" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-xl p-5"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--rule)" }}
                    >
                        <p className="text-[10px] tracking-[0.12em] uppercase font-semibold mb-3" style={{ color: "var(--ink-faint)" }}>
                            {stat.label}
                        </p>
                        <p className="font-display text-3xl" style={{ color: "var(--accent-bright)" }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
                <p className="text-[10px] tracking-[0.14em] uppercase font-semibold shrink-0" style={{ color: "var(--ink-faint)" }}>
                    Recentes
                </p>
                <div className="flex-1 h-px" style={{ background: "var(--rule)" }} />
            </div>

            {decks.length === 0 ? (
                <div
                    className="rounded-2xl p-16 text-center"
                    style={{ border: "1px dashed var(--rule)" }}
                >
                    <p className="font-display text-2xl mb-2" style={{ color: "var(--ink-faint)" }}>Nenhum baralho ainda</p>
                    <p className="text-sm mb-6" style={{ color: "var(--ink-ghost)" }}>Crie seu primeiro baralho e comece a aprender.</p>
                    <Link
                        href="/new"
                        className="inline-flex px-5 py-2.5 rounded-lg text-sm font-semibold"
                        style={{ background: "var(--accent)", color: "#0e0d0b" }}
                    >
                        Criar primeiro baralho
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {decks.map((deck) => (
                        <div key={deck.id} className="group relative">
                            <Link
                                href={`/decks/${deck.id}`}
                                className="block rounded-xl p-5 transition-all"
                                style={{
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--rule)",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--accent-border)")}
                                onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--rule)")}
                            >
                                <span
                                    className="inline-flex px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-semibold mb-3"
                                    style={{
                                        background: "var(--accent-dim)",
                                        color: "var(--accent-bright)",
                                        border: "1px solid var(--accent-border)",
                                    }}
                                >
                                    {sourceLabels[deck.sourceType]}
                                </span>
                                <p className="text-sm font-medium leading-snug mb-2" style={{ color: "var(--ink)" }}>
                                    {deck.title}
                                </p>
                                <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                                    {deck._count.cards} cards · {new Date(deck.createdAt).toLocaleDateString("pt-BR")}
                                </p>
                            </Link>

                            <button
                                onClick={(e) => { e.preventDefault(); setConfirmDeck(deck) }}
                                className="absolute top-3 right-3 w-6 h-6 rounded flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                style={{ color: "var(--ink-faint)" }}
                                onMouseOver={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)" }}
                                onMouseOut={(e) => { e.currentTarget.style.color = "var(--ink-faint)"; e.currentTarget.style.background = "transparent" }}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
