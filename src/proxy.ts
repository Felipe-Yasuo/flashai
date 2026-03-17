// src/proxy.ts
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthPage =
        req.nextUrl.pathname.startsWith("/login") ||
        req.nextUrl.pathname.startsWith("/register")

    if (!isLoggedIn && !isAuthPage) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }
})

export const config = {
    matcher: ["/((?!api/auth|api|_next/static|_next/image|favicon.ico).*)"],
}