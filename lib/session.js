import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionToken, verifySessionToken } from 'lib/auth';
import { db } from 'lib/db';

const COOKIE_NAME = 'session';

export async function createSession(userId) {
    const token = createSessionToken(userId);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30
    });
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const payload = verifySessionToken(token);
    if (!payload) return null;

    const user = await db.users.findById(payload.uid);
    if (!user) return null;

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
}

export async function requireUser(redirectTo = '/entrar') {
    const user = await getCurrentUser();
    if (!user) redirect(redirectTo);
    return user;
}
