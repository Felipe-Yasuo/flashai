// src/components/sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

interface Props {
    user: { name: string; email: string }
}

const navItems = [
    {
        label: "Baralhos",
        href: "/dashboard",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        label: "Revisão",
        href: "/review",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <path d="M12 8v4l3 3M12 2a10 10 0 100 20A10 10 0 0012 2z" />
            </svg>
        ),
    },
    {
        label: "Histórico",
        href: "/history",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
        ),
    },
]

export default function Sidebar({ user }: Props) {
    const pathname = usePathname()
    const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

    return (
        <aside className="w-56 border-r border-amber-600/15 flex flex-col gap-1 px-3 py-6 shrink-0">

            <div className="flex items-center gap-2 px-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-800 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 stroke-amber-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>
                <span className="font-serif text-base text-amber-50 tracking-wide">FlashAI</span>
            </div>

            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all ${pathname === item.href
                        ? "bg-amber-600/15 text-amber-400"
                        : "text-amber-100/40 hover:text-amber-100/70 hover:bg-white/[0.03]"
                        }`}
                >
                    {item.icon}
                    {item.label}
                </Link>
            ))}

            <div className="flex-1" />

            <div className="border-t border-amber-600/15 pt-4 mt-2 px-2.5">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-full bg-amber-600/20 flex items-center justify-center text-[11px] font-medium text-amber-400 shrink-0">
                        {initials}
                    </div>
                    <span className="text-xs text-amber-100/40 truncate">{user.name}</span>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-xs text-amber-100/30 hover:text-amber-100/60 transition-colors"
                >
                    Sair
                </button>
            </div>
        </aside>
    )
}