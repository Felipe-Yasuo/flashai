"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Menu, X, LayoutGrid, Clock, PenLine } from "lucide-react"

interface Props {
    user: { name: string; email: string }
}

const navItems = [
    { label: "Baralhos",  href: "/dashboard", icon: <LayoutGrid size={16} className="shrink-0" /> },
    { label: "Revisão",   href: "/review",    icon: <Clock       size={16} className="shrink-0" /> },
    { label: "Histórico", href: "/history",   icon: <PenLine     size={16} className="shrink-0" /> },
]

function Logo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--accent)" }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#0e0d0b" strokeWidth={2.5} strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </div>
            <span className="font-display text-base tracking-wide" style={{ color: "var(--ink)" }}>FlashAI</span>
        </div>
    )
}

function NavLinks({ pathname }: { pathname: string }) {
    return (
        <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
                const active = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
                        style={active
                            ? { background: "var(--accent-dim)", color: "var(--accent-bright)", borderLeft: "2px solid var(--accent)" }
                            : { color: "var(--ink-faint)", borderLeft: "2px solid transparent" }
                        }
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}

function UserRow({ initials, name }: { initials: string; name: string }) {
    return (
        <div className="pt-4 mt-2 px-3" style={{ borderTop: "1px solid var(--rule)" }}>
            <div className="flex items-center gap-2.5 mb-3">
                <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                    style={{ background: "var(--accent-dim)", color: "var(--accent-bright)", border: "1px solid var(--accent-border)" }}
                >
                    {initials}
                </div>
                <span className="text-xs truncate" style={{ color: "var(--ink-faint)" }}>{name}</span>
            </div>
            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-xs transition-colors"
                style={{ color: "var(--ink-ghost)" }}
                onMouseOver={(e) => e.currentTarget.style.color = "var(--ink-muted)"}
                onMouseOut={(e) => e.currentTarget.style.color = "var(--ink-ghost)"}
            >
                Sair
            </button>
        </div>
    )
}

export default function Sidebar({ user }: Props) {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

    useEffect(() => { setOpen(false) }, [pathname])

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    return (
        <>
            {/* Topbar mobile */}
            <header
                className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
                style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--rule)" }}
            >
                <Link href="/dashboard"><Logo /></Link>
                <button
                    onClick={() => setOpen(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg"
                    style={{ color: "var(--ink-muted)" }}
                    aria-label="Abrir menu"
                >
                    <Menu size={20} />
                </button>
            </header>

            {/* Overlay */}
            {open && (
                <div
                    className="lg:hidden fixed inset-0 z-40"
                    style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Drawer mobile */}
            <div
                className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col py-6 px-3 transition-transform duration-300"
                style={{
                    background: "var(--bg-card)",
                    borderRight: "1px solid var(--rule)",
                    transform: open ? "translateX(0)" : "translateX(-100%)",
                }}
            >
                <div className="flex items-center justify-between px-3 mb-8">
                    <Logo />
                    <button
                        onClick={() => setOpen(false)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg"
                        style={{ color: "var(--ink-faint)" }}
                        aria-label="Fechar menu"
                    >
                        <X size={16} />
                    </button>
                </div>
                <NavLinks pathname={pathname} />
                <div className="flex-1" />
                <UserRow initials={initials} name={user.name} />
            </div>

            {/* Sidebar desktop */}
            <aside
                className="hidden lg:flex w-52 shrink-0 flex-col py-6 px-3"
                style={{ background: "var(--bg-card)", borderRight: "1px solid var(--rule)" }}
            >
                <div className="px-3 mb-8"><Logo /></div>
                <NavLinks pathname={pathname} />
                <div className="flex-1" />
                <UserRow initials={initials} name={user.name} />
            </aside>
        </>
    )
}
