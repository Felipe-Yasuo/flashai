// src/auth.config.ts
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const authConfig: NextAuthConfig = {
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    providers: [
        Google,
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Senha", type: "password" },
            },
            // authorize fica vazio aqui — a lógica real fica no auth.ts
            authorize: () => null,
        }),
    ],
    callbacks: {
        jwt({ token, user, account }) {
            if (user && account?.provider === "credentials") token.id = user.id
            return token
        },
        session({ session, token }) {
            if (token) session.user.id = token.id as string
            return session
        },
    },
}