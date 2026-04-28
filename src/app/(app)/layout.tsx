// src/app/(app)/layout.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/sidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()

    if (!session) redirect("/login")

    return (
        <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
            <Sidebar user={{ name: session.user?.name ?? "", email: session.user?.email ?? "" }} />
            <main className="flex-1 overflow-auto p-6 pt-20 lg:p-10">{children}</main>
        </div>
    )
}