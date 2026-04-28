"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

type Mode = "login" | "register"

export default function LoginPage() {
    const router = useRouter()
    const [mode, setMode] = useState<Mode>("login")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [form, setForm] = useState({ name: "", email: "", password: "" })

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
        setError("")
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (mode === "register") {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); setLoading(false); return }
        }

        const result = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
        })

        if (result?.error) { setError("Email ou senha inválidos"); setLoading(false); return }
        router.push("/dashboard")
        router.refresh()
    }

    async function handleGoogle() {
        await signIn("google", { callbackUrl: "/dashboard" })
    }

    return (
        <main
            className="min-h-screen flex"
            style={{ background: "var(--bg)" }}
        >
            {/* Painel esquerdo — decorativo */}
            <div
                className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12 border-r"
                style={{ borderColor: "var(--rule)", background: "var(--bg-card)" }}
            >
                <Logo />

                <div>
                    <p
                        className="font-display text-4xl leading-tight mb-6"
                        style={{ color: "var(--ink)" }}
                    >
                        Aprenda mais.<br />
                        <span style={{ color: "var(--accent)" }}>Esqueça menos.</span>
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                        Gere flashcards com IA a partir de qualquer conteúdo e revise com repetição espaçada.
                    </p>
                </div>

                <div className="flex gap-6">
                    {[
                        { n: "10k+", label: "Flashcards gerados" },
                        { n: "98%", label: "Taxa de retenção" },
                        { n: "∞", label: "Fontes suportadas" },
                    ].map(({ n, label }) => (
                        <div key={label}>
                            <p className="font-display text-2xl" style={{ color: "var(--accent)" }}>{n}</p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Painel direito — formulário */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

                {/* Logo mobile */}
                <div className="lg:hidden mb-10">
                    <Logo />
                </div>

                <div className="w-full max-w-sm">
                    {/* Heading */}
                    <h1
                        className="font-display text-3xl mb-1"
                        style={{ color: "var(--ink)" }}
                    >
                        {mode === "login" ? "Bem-vindo de volta" : "Criar sua conta"}
                    </h1>
                    <p className="text-sm mb-8" style={{ color: "var(--ink-muted)" }}>
                        {mode === "login" ? "Entre pra continuar estudando." : "Comece a estudar de forma inteligente."}
                    </p>

                    {/* Tab pills */}
                    <div
                        className="flex rounded-lg p-0.5 mb-8"
                        style={{ background: "var(--ink-ghost)", border: "1px solid var(--rule)" }}
                    >
                        {(["login", "register"] as Mode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError("") }}
                                className="flex-1 py-2 text-xs font-medium rounded-md transition-all"
                                style={mode === m
                                    ? { background: "var(--accent)", color: "#0e0d0b" }
                                    : { color: "var(--ink-muted)" }
                                }
                            >
                                {m === "login" ? "Entrar" : "Criar conta"}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "register" && (
                            <Field label="Nome">
                                <input
                                    name="name" type="text" placeholder="Seu nome"
                                    value={form.name} onChange={handleChange} required
                                    className="input-style"
                                />
                            </Field>
                        )}
                        <Field label="Email">
                            <input
                                name="email" type="email" placeholder="seu@email.com"
                                value={form.email} onChange={handleChange} required
                                className="input-style"
                            />
                        </Field>
                        <Field label="Senha">
                            <input
                                name="password" type="password" placeholder="••••••••"
                                value={form.password} onChange={handleChange} required
                                className="input-style"
                            />
                        </Field>

                        {error && (
                            <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-1 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
                            style={{ background: "var(--accent)", color: "#0e0d0b" }}
                        >
                            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px" style={{ background: "var(--rule)" }} />
                        <span className="text-xs" style={{ color: "var(--ink-faint)" }}>ou continue com</span>
                        <div className="flex-1 h-px" style={{ background: "var(--rule)" }} />
                    </div>

                    <button
                        onClick={handleGoogle}
                        className="w-full py-3 rounded-lg text-sm flex items-center justify-center gap-2.5 transition-all"
                        style={{
                            background: "var(--ink-ghost)",
                            border: "1px solid var(--rule)",
                            color: "var(--ink-muted)",
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--accent-border)"}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--rule)"}
                    >
                        <GoogleIcon />
                        Google
                    </button>
                </div>
            </div>
        </main>
    )
}

function Logo() {
    return (
        <div className="flex items-center gap-2.5">
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "var(--accent)" }}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#0e0d0b" strokeWidth={2.5} strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </div>
            <span className="font-display text-lg tracking-wide" style={{ color: "var(--ink)" }}>FlashAI</span>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label
                className="block text-[10px] font-semibold tracking-[0.12em] uppercase mb-2"
                style={{ color: "var(--ink-faint)" }}
            >
                {label}
            </label>
            {children}
        </div>
    )
}

function GoogleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    )
}
