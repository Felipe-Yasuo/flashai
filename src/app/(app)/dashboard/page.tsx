// src/app/(app)/dashboard/page.tsx
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
            {/* Modal de confirmação */}
            {confirmDeck && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-[#1a1814] border border-amber-600/20 rounded-2xl p-8 max-w-sm w-full">
                        <h2 className="font-serif text-lg text-amber-50 mb-2">Deletar baralho?</h2>
                        <p className="text-sm text-amber-100/40 mb-6">
                            "{confirmDeck.title}" e todos os seus cards serão deletados permanentemente.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfirmDeck(null)}
                                className="flex-1 py-2.5 border border-amber-600/20 rounded-lg text-amber-100/50 text-sm hover:border-amber-600/40 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteDeck(confirmDeck.id)}
                                disabled={!!deletingId}
                                className="flex-1 py-2.5 bg-red-500/80 hover:bg-red-500 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
                            >
                                {deletingId ? "Deletando..." : "Sim, deletar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-9">
                <h1 className="font-serif text-2xl text-amber-50">Seus baralhos</h1>
                <Link
                    href="/new"
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-[#0d0c0a] text-sm font-medium transition-colors"
                >
                    + Novo baralho
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-9">
                {[
                    { label: "Baralhos", value: stats.decks },
                    { label: "Flashcards", value: stats.cards },
                    { label: "Sessões", value: stats.sessions },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white/[0.03] border border-amber-600/15 rounded-xl p-4">
                        <p className="text-[10px] tracking-widest uppercase text-amber-100/35 mb-1.5">{stat.label}</p>
                        <p className="text-2xl font-medium text-amber-400">{stat.value}</p>
                    </div>
                ))}
            </div>

            <p className="text-[10px] tracking-widest uppercase text-amber-100/30 mb-4">Recentes</p>

            {decks.length === 0 ? (
                <div className="text-center py-20 text-amber-100/25 text-sm">
                    Nenhum baralho ainda.{" "}
                    <Link href="/new" className="text-amber-500 hover:text-amber-400 underline underline-offset-2">
                        Crie o primeiro!
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {decks.map((deck) => (
                        <div key={deck.id} className="group relative">
                            <Link
                                href={`/decks/${deck.id}`}
                                className="block bg-white/[0.03] border border-amber-600/15 hover:border-amber-600/35 hover:bg-white/[0.05] rounded-xl p-5 transition-all"
                            >
                                <span className="inline-flex px-2 py-0.5 bg-amber-600/10 border border-amber-600/20 rounded text-[10px] tracking-wider uppercase text-amber-500 mb-3">
                                    {sourceLabels[deck.sourceType]}
                                </span>
                                <p className="text-sm font-medium text-amber-50 mb-2 leading-snug">{deck.title}</p>
                                <p className="text-xs text-amber-100/30">
                                    {deck._count.cards} cards · {new Date(deck.createdAt).toLocaleDateString("pt-BR")}
                                </p>
                            </Link>

                            {/* Lixeira */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    setConfirmDeck(deck)
                                }}
                                className="absolute top-3 right-3 w-6 h-6 rounded flex items-center justify-center text-amber-100/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
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