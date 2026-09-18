'use client';

import { useActionState } from 'react';
import { registerAction } from './actions';
import { Alert } from 'components/alert';
import { SubmitButton } from 'components/submit-button';

export function RegisterForm() {
    const [state, formAction] = useActionState(registerAction, null);

    return (
        <form action={formAction} className="flex flex-col gap-4 max-w-md">
            {state?.error && <Alert type="error">{state.error}</Alert>}
            <label className="flex flex-col gap-1">
                <span className="text-sm">Nome</span>
                <input name="name" type="text" required className="input" autoComplete="name" />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm">E-mail</span>
                <input name="email" type="email" required className="input" autoComplete="email" />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm">Senha (mín. 8 caracteres)</span>
                <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    className="input"
                    autoComplete="new-password"
                />
            </label>
            <SubmitButton text="Criar conta" />
        </form>
    );
}
