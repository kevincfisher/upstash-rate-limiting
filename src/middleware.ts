import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  }),
  limiter: Ratelimit.fixedWindow(5, "10 s"),
})

export const runtime = "experimental-edge"

export default async function middleware(request: NextRequest): Promise<Response | undefined> {
console.log('inside middleware')
  // grab users ip address from request if available
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1'
  console.log('ip', ip)
  // if requesting the blocked route, we can skip the rate limit check
  if(request.nextUrl.pathname === '/api/blocked') {
    return NextResponse.next(request)
  }


  const {success, limit, reset, remaining } = await ratelimit.limit(`api:${ip}`)
  // wait until the rate limit check has completed

  // set the rate limit headers
  request.headers.set('X-RateLimit-Limit', limit.toString())
  request.headers.set('X-RateLimit-Remaining', remaining.toString())
  request.headers.set('X-RateLimit-Reset', reset.toString())

  return success ? NextResponse.next({headers: request.headers}) : NextResponse.rewrite(new URL('/api/blocked', request.url), { headers: request.headers })
}

export const config = {
  matcher: "/api/:path*",
}