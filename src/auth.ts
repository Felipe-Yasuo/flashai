// src/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Google,
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Senha", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!user) return null

                const passwordMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (!passwordMatch) return null

                return { id: user.id, email: user.email, name: user.name }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user && account?.provider === "credentials") token.id = user.id

            if (account?.provider === "google" && token.email) {
                let dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                })

                if (!dbUser) {
                    dbUser = await prisma.user.create({
                        data: {
                            email: token.email,
                            name: token.name ?? "Usuário",
                            password: "",
                        },
                    })
                }

                token.id = dbUser.id
            }

            return token
        },
        session({ session, token }) {
            if (token) session.user.id = token.id as string
            return session
        },
    },
})