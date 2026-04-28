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
            <div className="mb-10">
                <p className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-1" style={{ color: "var(--ink-faint)" }}>
                    Seu progresso
                </p>
                <h1 className="font-display text-3xl" style={{ color: "var(--ink)" }}>Histórico</h1>
            </div>

            {sessions.length === 0 ? (
                <div
                    className="rounded-2xl p-16 text-center"
                    style={{ border: "1px dashed var(--rule)" }}
                >
                    <p className="font-display text-2xl mb-2" style={{ color: "var(--ink-faint)" }}>Nenhuma sessão ainda</p>
                    <p className="text-sm mb-6" style={{ color: "var(--ink-ghost)" }}>Estude um baralho pra começar seu histórico.</p>
                    <Link
                        href="/new"
                        className="inline-flex px-5 py-2.5 rounded-lg text-sm font-semibold"
                        style={{ background: "var(--accent)", color: "#0e0d0b" }}
                    >
                        Criar baralho
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {sessions.map((s) => {
                        const pct = Math.round((s.score / s.total) * 100)
                        const scoreColor = pct === 100
                            ? "#34d399"
                            : pct >= 70
                                ? "var(--accent-bright)"
                                : pct >= 40
                                    ? "#fb923c"
                                    : "#f87171"

                        return (
                            <Link
                                key={s.id}
                                href={`/decks/${s.deckId}`}
                                className="hover-border flex items-center justify-between px-5 py-4 rounded-xl transition-all"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--rule)" }}
                            >
                                <div>
                                    <p className="text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>{s.deck.title}</p>
                                    <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                                        {new Date(s.createdAt).toLocaleDateString("pt-BR", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <p className="font-display text-xl font-bold" style={{ color: scoreColor }}>{pct}%</p>
                                    <p className="text-xs" style={{ color: "var(--ink-faint)" }}>{s.score}/{s.total} corretos</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
