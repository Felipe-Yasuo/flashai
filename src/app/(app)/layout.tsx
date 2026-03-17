// src/app/(app)/layout.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/sidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()

    if (!session) redirect("/login")

    return (
        <div className="flex min-h-screen bg-[#0d0c0a]">
            <Sidebar user={{ name: session.user?.name ?? "", email: session.user?.email ?? "" }} />
            <main className="flex-1 p-10 overflow-auto">{children}</main>
        </div>
    )
}