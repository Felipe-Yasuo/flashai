// src/app/(app)/new/page.tsx
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
    TEXT: "Cole aqui o conteúdo que a IA vai usar pra gerar os flashcards...",
    PDF: "",
    URL: "https://...",
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
            // Envia o PDF para o servidor que faz o parsing
            const formData = new FormData()
            formData.append("file", file)
            const res = await fetch("/api/parse-pdf", { method: "POST", body: formData })
            const data = await res.json()
            if (!res.ok) { setError(data.error ?? "Erro ao ler PDF"); return }
            setContent(data.text)
        } else {
            // .txt continua funcionando normalmente
            const text = await file.text()
            setContent(text)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!content.trim()) {
            setError("Adicione o conteúdo antes de gerar")
            return
        }

        setLoading(true)
        setError("")

        const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, sourceType, content, cardCount }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error ?? "Erro ao gerar flashcards")
            setLoading(false)
            return
        }

        router.push(`/decks/${data.deckId}`)
    }

    return (
        <div className="max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-9">
                <Link
                    href="/dashboard"
                    className="w-8 h-8 border border-amber-600/20 rounded-lg flex items-center justify-center text-amber-100/40 hover:text-amber-100/70 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                </Link>
                <h1 className="font-serif text-2xl text-amber-50">Novo baralho</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-white/[0.03] border border-amber-600/15 rounded-2xl p-8 space-y-6">
                    {/* Título + quantidade */}
                    <div className="grid grid-cols-[1fr_160px] gap-3">
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
                        <Field label="Quantidade de cards">
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

                    {/* Fonte */}
                    <Field label="Fonte do conteúdo">
                        {/* Tabs */}
                        <div className="flex bg-white/[0.04] rounded-lg p-[3px] mb-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.type}
                                    type="button"
                                    onClick={() => { setSourceType(tab.type); setContent("") }}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${sourceType === tab.type
                                        ? "bg-amber-600/20 text-amber-400 border border-amber-600/30"
                                        : "text-amber-100/40 hover:text-amber-100/60"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Conteúdo da aba */}
                        {sourceType === "TEXT" && (
                            <textarea
                                required
                                placeholder={placeholders.TEXT}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                className="input-style w-full resize-y"
                            />
                        )}

                        {sourceType === "PDF" && (
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="border border-dashed border-amber-600/30 rounded-lg p-10 text-center cursor-pointer hover:border-amber-600/50 hover:bg-white/[0.02] transition-all"
                            >
                                <svg className="w-6 h-6 mx-auto mb-3 stroke-amber-600/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                </svg>
                                {content
                                    ? <p className="text-sm text-amber-400">PDF carregado ✓</p>
                                    : <p className="text-sm text-amber-100/25">Clique pra selecionar um PDF</p>
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
                                className="input-style w-full"
                            />
                        )}
                    </Field>

                    {error && <p className="text-red-400 text-xs">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg text-[#0d0c0a] text-sm font-medium transition-colors"
                    >
                        {loading ? "Gerando flashcards..." : "Gerar flashcards"}
                    </button>

                    {/* Loading animation */}
                    {loading && (
                        <div className="flex items-center gap-3 px-4 py-3.5 bg-amber-600/08 border border-amber-600/20 rounded-lg">
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-amber-100/50">A IA está gerando seus flashcards...</span>
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
            <label className="block text-[10px] font-medium tracking-widest uppercase text-amber-100/35 mb-2">
                {label}
            </label>
            {children}
        </div>
    )
}