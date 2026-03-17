// src/app/(app)/history/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function HistoryPage() {
    const session = await auth()
    if (!session) redirect("/login")

    const sessions = await prisma.studySession.findMany({
        where: { userId: session.user.id },
        include: { deck: true },
        orderBy: { createdAt: "desc" },
    })

    return (
        <div>
            <h1 className="font-serif text-2xl text-amber-50 mb-8">Histórico</h1>

            {sessions.length === 0 ? (
                <div className="text-center py-20 text-amber-100/25 text-sm">
                    Nenhuma sessão ainda.{" "}
                    <Link href="/new" className="text-amber-500 hover:text-amber-400 underline underline-offset-2">
                        Estude um baralho!
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {sessions.map((s) => {
                        const pct = Math.round((s.score / s.total) * 100)
                        const color = pct === 100 ? "text-emerald-400" : pct >= 70 ? "text-amber-400" : pct >= 40 ? "text-orange-400" : "text-red-400"

                        return (
                            <Link
                                key={s.id}
                                href={`/decks/${s.deckId}`}
                                className="flex items-center justify-between px-5 py-4 bg-white/[0.03] border border-amber-600/15 hover:border-amber-600/30 rounded-xl transition-all"
                            >
                                <div>
                                    <p className="text-sm font-medium text-amber-50 mb-0.5">{s.deck.title}</p>
                                    <p className="text-xs text-amber-100/30">
                                        {new Date(s.createdAt).toLocaleDateString("pt-BR", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-medium ${color}`}>{pct}%</p>
                                    <p className="text-xs text-amber-100/30">{s.score}/{s.total} corretos</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}