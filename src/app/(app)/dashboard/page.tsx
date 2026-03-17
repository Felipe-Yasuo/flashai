// src/app/(app)/dashboard/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"

const sourceLabels: Record<string, string> = {
    TEXT: "Texto",
    PDF: "PDF",
    URL: "URL",
    TOPIC: "Tópico",
}

export default async function DashboardPage() {
    const session = await auth()
    if (!session) redirect("/login")

    const userId = session.user.id

    const [decks, cardCount, sessionCount] = await Promise.all([
        prisma.deck.findMany({
            where: { userId },
            include: { _count: { select: { cards: true } } },
            orderBy: { createdAt: "desc" },
        }),
        prisma.card.count({
            where: { deck: { userId } },
        }),
        prisma.studySession.count({
            where: { userId },
        }),
    ])

    return (
        <div>
            {/* Header */}
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
                    { label: "Baralhos", value: decks.length },
                    { label: "Flashcards", value: cardCount },
                    { label: "Sessões", value: sessionCount },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white/[0.03] border border-amber-600/15 rounded-xl p-4">
                        <p className="text-[10px] tracking-widest uppercase text-amber-100/35 mb-1.5">{stat.label}</p>
                        <p className="text-2xl font-medium text-amber-400">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Decks */}
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
                        <Link
                            key={deck.id}
                            href={`/decks/${deck.id}`}
                            className="group bg-white/[0.03] border border-amber-600/15 hover:border-amber-600/35 hover:bg-white/[0.05] rounded-xl p-5 transition-all"
                        >
                            <span className="inline-flex px-2 py-0.5 bg-amber-600/10 border border-amber-600/20 rounded text-[10px] tracking-wider uppercase text-amber-500 mb-3">
                                {sourceLabels[deck.sourceType]}
                            </span>
                            <p className="text-sm font-medium text-amber-50 mb-2 leading-snug">{deck.title}</p>
                            <p className="text-xs text-amber-100/30">
                                {deck._count.cards} cards · {new Date(deck.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
