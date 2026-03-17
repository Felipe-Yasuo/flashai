// src/app/(auth)/login/page.tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Mode = "login" | "register"

export default function LoginPage() {
    const router = useRouter()
    const [mode, setMode] = useState<Mode>("login")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    })

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

            if (!res.ok) {
                setError(data.error)
                setLoading(false)
                return
            }
        }

        const result = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
        })

        if (result?.error) {
            setError("Email ou senha inválidos")
            setLoading(false)
            return
        }

        router.push("/dashboard")
        router.refresh()
    }

    async function handleGoogle() {
        await signIn("google", { callbackUrl: "/dashboard" })
    }

    return (
        <main className="min-h-screen bg-[#0d0c0a] flex items-center justify-center px-4">
            {/* Orbs de fundo */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-amber-600 opacity-10 blur-[80px]" />
                <div className="absolute -bottom-16 -left-16 w-[300px] h-[300px] rounded-full bg-amber-900 opacity-10 blur-[80px]" />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-800 flex items-center justify-center">
                        <svg className="w-4 h-4 stroke-amber-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="font-serif text-xl text-amber-50 tracking-wide">FlashAI</span>
                </div>

                {/* Card */}
                <div className="bg-white/[0.03] border border-amber-600/20 rounded-2xl p-10 backdrop-blur-xl">
                    {/* Tabs */}
                    <div className="flex bg-white/[0.04] rounded-lg p-[3px] mb-8">
                        {(["login", "register"] as Mode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError("") }}
                                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${mode === m
                                        ? "bg-amber-600/20 text-amber-400 border border-amber-600/30"
                                        : "text-amber-100/40 hover:text-amber-100/60"
                                    }`}
                            >
                                {m === "login" ? "Entrar" : "Criar conta"}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "register" && (
                            <Field label="Nome" name="name" type="text" placeholder="Seu nome" value={form.name} onChange={handleChange} />
                        )}
                        <Field label="Email" name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} />
                        <Field label="Senha" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />

                        {error && (
                            <p className="text-red-400 text-xs">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-[#0d0c0a] text-sm font-medium rounded-lg transition-colors"
                        >
                            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-amber-600/15" />
                        <span className="text-xs text-amber-100/20">ou continue com</span>
                        <div className="flex-1 h-px bg-amber-600/15" />
                    </div>

                    <button
                        onClick={handleGoogle}
                        className="w-full py-3 bg-white/[0.04] border border-amber-600/20 hover:border-amber-600/40 hover:bg-white/[0.07] rounded-lg text-amber-100/70 text-sm flex items-center justify-center gap-2 transition-all"
                    >
                        <GoogleIcon />
                        Google
                    </button>
                </div>
            </div>
        </main>
    )
}

function Field({ label, name, type, placeholder, value, onChange }: {
    label: string
    name: string
    type: string
    placeholder: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
    return (
        <div>
            <label className="block text-[10px] font-medium tracking-widest uppercase text-amber-100/40 mb-2">
                {label}
            </label>
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
                className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-amber-600/20 focus:border-amber-600/50 rounded-lg text-amber-50 text-sm placeholder-amber-100/20 outline-none transition-colors"
            />
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