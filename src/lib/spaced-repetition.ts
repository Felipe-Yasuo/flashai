// src/lib/spaced-repetition.ts

export type Difficulty = "easy" | "hard" | "again"

const INTERVALS: Record<Difficulty, number> = {
    easy: 7,
    hard: 3,
    again: 1,
}

export function getNextReviewDate(difficulty: Difficulty): Date {
    const days = INTERVALS[difficulty]
    const next = new Date()
    next.setDate(next.getDate() + days)
    next.setHours(0, 0, 0, 0) // meia-noite do dia
    return next
}

export function isDueToday(nextReview: Date | null): boolean {
    if (!nextReview) return true // nunca estudado = devido agora
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(nextReview) <= today
}