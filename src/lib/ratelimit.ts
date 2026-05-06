import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 10 gerações de deck por usuário por dia
export const generateRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 d"),
    prefix: "rl:generate",
    analytics: true,
})

// 20 uploads de PDF por usuário por dia
export const pdfRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 d"),
    prefix: "rl:pdf",
    analytics: true,
})
