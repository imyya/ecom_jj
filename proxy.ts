import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifyAccessToken } from './lib/session'
 
// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
    const accessToken = request.cookies.get(SESSION_COOKIE)?.value
    const verifiedAccessToken = await verifyAccessToken(accessToken)
    if(!verifiedAccessToken){
      return NextResponse.redirect(new URL("/login", request.nextUrl))
    }
  return NextResponse.next()
}
 
// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }
 
export const config = {
  matcher: ['/admin/:path*'],
}