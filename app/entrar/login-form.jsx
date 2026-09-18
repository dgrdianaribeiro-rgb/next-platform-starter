'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';
import { Alert } from 'components/alert';
import { SubmitButton } from 'components/submit-button';

export function LoginForm() {
    const [state, formAction] = useActionState(loginAction, null);

    return (
        <form action={formAction} className="flex flex-col gap-4 max-w-md">
            {state?.error && <Alert type="error">{state.error}</Alert>}
            <label className="flex flex-col gap-1">
                <span className="text-sm">E-mail</span>
                <input name="email" type="email" required className="input" autoComplete="email" />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm">Senha</span>
                <input name="password" type="password" required className="input" autoComplete="current-password" />
            </label>
            <SubmitButton text="Entrar" />
        </form>
    );
}
