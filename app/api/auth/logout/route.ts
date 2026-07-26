import { NextResponse } from 'next/server';

import { revokeSession, sessionCookie } from '@/src/features/auth/session';

const sessionToken = (request: Request) => request.headers.get('cookie')?.split(';').map((part) => part.trim())
  .find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

interface LogoutDependencies {
  revoke?: (token: string) => Promise<void>;
}

export const handleLogout = async (request: Request, dependencies: LogoutDependencies = {}) => {
  const token = sessionToken(request);
  if (token) {
    try { await (dependencies.revoke ?? revokeSession)(token); } catch { /* Clearing an invalid or expired cookie is still useful. */ }
  }
  const response = new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(sessionCookie.name, '', { ...sessionCookie, maxAge: 0, expires: new Date(0) });
  return response;
};

export const POST = (request: Request) => handleLogout(request);
