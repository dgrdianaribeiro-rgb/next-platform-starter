'use server';

import { redirect } from 'next/navigation';
import { verifyPassword } from 'lib/auth';
import { db } from 'lib/db';
import { createSession } from 'lib/session';

export async function loginAction(_prevState, formData) {
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString() || '';

    if (!email || !password) return { error: 'Informe e-mail e senha.' };

    const user = await db.users.findByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return { error: 'E-mail ou senha incorretos.' };
    }

    await createSession(user.id);
    redirect('/buscar');
}
