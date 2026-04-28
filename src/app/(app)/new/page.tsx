"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type SourceType = "TEXT" | "PDF" | "URL" | "TOPIC"

const tabs: { type: SourceType; label: string }[] = [
    { type: "TEXT", label: "Texto" },
    { type: "PDF", label: "PDF" },
    { type: "URL", label: "URL" },
    { type: "TOPIC", label: "Tópico" },
]

const placeholders: Record<SourceType, string> = {
    TEXT: "Cole o conteúdo que a IA vai usar pra gerar os flashcards...",
    PDF: "",
    URL: "https://",
    TOPIC: "Ex: Algoritmos de ordenação em Python",
}

export default function NewDeckPage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [sourceType, setSourceType] = useState<SourceType>("TEXT")
    const [content, setContent] = useState("")
    const [cardCount, setCardCount] = useState(15)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const fileRef = useRef<HTMLInputElement>(null)

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.type === "application/pdf") {
            const formData = new FormData()
            formData.append("file", file)
            const res = await fetch("/api/parse-pdf", { method: "POST", body: formData })
            const data = await res.json()
            if (!res.ok) { setError(data.error ?? "Erro ao ler PDF"); return }
            setContent(data.text)
        } else {
            setContent(await file.text())
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!content.trim()) { setError("Adicione o conteúdo antes de gerar"); return }
        setLoading(true)
        setError("")

        const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, sourceType, content, cardCount }),
        })

        const data = await res.json()
        if (!res.ok) { setError(data.error ?? "Erro ao gerar flashcards"); setLoading(false); return }
        router.push(`/decks/${data.deckId}`)
    }

    return (
        <div style={{ maxWidth: "42rem", margin: "0 auto" }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <Link
                    href="/dashboard"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ border: "1px solid var(--rule)", color: "var(--ink-faint)" }}
                    onMouseOver={(e) => e.currentTarget.style.color = "var(--ink-muted)"}
                    onMouseOut={(e) => e.currentTarget.style.color = "var(--ink-faint)"}
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                </Link>
                <div>
                    <p className="text-[10px] tracking-[0.14em] uppercase font-semibold" style={{ color: "var(--ink-faint)" }}>Criar</p>
                    <h1 className="font-display text-2xl" style={{ color: "var(--ink)" }}>Novo baralho</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div
                    className="rounded-2xl p-8 space-y-7"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--rule)" }}
                >
                    {/* Título + quantidade */}
                    <div className="grid grid-cols-[1fr_160px] gap-4">
                        <Field label="Título do baralho">
                            <input
                                type="text"
                                required
                                placeholder="Ex: Fundamentos de TypeScript"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input-style"
                            />
                        </Field>
                        <Field label="Quantidade">
                            <select
                                value={cardCount}
                                onChange={(e) => setCardCount(Number(e.target.value))}
                                className="input-style"
                            >
                                {[5, 10, 15, 20, 25].map((n) => (
                                    <option key={n} value={n}>{n} cards</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Divider */}
                    <div className="h-px" style={{ background: "var(--rule)" }} />

                    {/* Fonte */}
                    <Field label="Fonte do conteúdo">
                        {/* Tabs */}
                        <div
                            className="flex rounded-lg p-0.5 mb-5"
                            style={{ background: "var(--bg)", border: "1px solid var(--rule)" }}
                        >
                            {tabs.map((tab) => (
                                <button
                                    key={tab.type}
                                    type="button"
                                    onClick={() => { setSourceType(tab.type); setContent("") }}
                                    className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all"
                                    style={sourceType === tab.type
                                        ? { background: "var(--accent)", color: "#0e0d0b" }
                                        : { color: "var(--ink-faint)" }
                                    }
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {sourceType === "TEXT" && (
                            <textarea
                                required
                                placeholder={placeholders.TEXT}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={7}
                                className="input-style resize-y"
                                style={{ fontFamily: "var(--font-sans), sans-serif" }}
                            />
                        )}

                        {sourceType === "PDF" && (
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="rounded-xl p-12 text-center cursor-pointer transition-all"
                                style={{ border: "1px dashed var(--accent-border)" }}
                                onMouseOver={(e) => e.currentTarget.style.background = "var(--ink-ghost)"}
                                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                            >
                                <svg className="w-7 h-7 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" style={{ color: "var(--accent-border)" }}>
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                </svg>
                                {content
                                    ? <p className="text-sm font-medium" style={{ color: "var(--accent-bright)" }}>PDF carregado ✓</p>
                                    : <p className="text-sm" style={{ color: "var(--ink-faint)" }}>Clique para selecionar um PDF</p>
                                }
                                <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileChange} />
                            </div>
                        )}

                        {(sourceType === "URL" || sourceType === "TOPIC") && (
                            <input
                                type={sourceType === "URL" ? "url" : "text"}
                                required
                                placeholder={placeholders[sourceType]}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="input-style"
                            />
                        )}
                    </Field>

                    {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50 hover:opacity-90"
                        style={{ background: "var(--accent)", color: "#0e0d0b" }}
                    >
                        {loading ? "Gerando flashcards..." : "Gerar flashcards"}
                    </button>

                    {loading && (
                        <div
                            className="flex items-center gap-3 px-4 py-3.5 rounded-lg"
                            style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}
                        >
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                                        style={{ background: "var(--accent)", animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs" style={{ color: "var(--ink-muted)" }}>A IA está gerando seus flashcards...</span>
                        </div>
                    )}
                </div>
            </form>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ink-faint)" }}>
                {label}
            </label>
            {children}
        </div>
    )
}
