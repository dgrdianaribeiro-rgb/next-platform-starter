'use server';

import { redirect } from 'next/navigation';
import { hashPassword } from 'lib/auth';
import { db } from 'lib/db';
import { createSession } from 'lib/session';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(_prevState, formData) {
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString() || '';

    if (!name) return { error: 'Informe seu nome.' };
    if (!email || !EMAIL_RE.test(email)) return { error: 'Informe um e-mail válido.' };
    if (password.length < 8) return { error: 'A senha precisa ter pelo menos 8 caracteres.' };

    const existing = await db.users.findByEmail(email);
    if (existing) return { error: 'Já existe uma conta com este e-mail.' };

    const user = {
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString()
    };
    await db.users.create(user);
    await createSession(user.id);

    redirect('/buscar');
}
