'use client';

import { useActionState } from 'react';
import { createAlertAction } from './actions';
import { Alert } from 'components/alert';
import { SubmitButton } from 'components/submit-button';
import { bairrosFortaleza } from 'data/bairros-fortaleza';

export function AlertForm() {
    const [state, formAction] = useActionState(createAlertAction, null);

    return (
        <form action={formAction} className="flex flex-col gap-4 max-w-xl" key={state?.success ? 'reset' : 'form'}>
            {state?.error && <Alert type="error">{state.error}</Alert>}
            {state?.success && <Alert type="success">Alerta criado! Você será notificado quando surgir um imóvel compatível.</Alert>}
            <label className="flex flex-col gap-1">
                <span className="text-sm">Nome do alerta</span>
                <input name="name" type="text" required placeholder="Ex: Apê 2 quartos na Aldeota" className="input" />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm">Tipo</span>
                <select name="type" defaultValue="qualquer" className="input">
                    <option value="qualquer">Casa ou apartamento</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa</option>
                </select>
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm">Bairros (deixe em branco para qualquer bairro; use Ctrl/Cmd para escolher vários)</span>
                <select name="neighborhoods" multiple size={6} className="input h-auto">
                    {bairrosFortaleza.map((bairro) => (
                        <option key={bairro} value={bairro}>
                            {bairro}
                        </option>
                    ))}
                </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                    <span className="text-sm">Preço mín. (R$)</span>
                    <input name="minPrice" type="number" min="0" className="input" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-sm">Preço máx. (R$)</span>
                    <input name="maxPrice" type="number" min="0" className="input" />
                </label>
            </div>
            <label className="flex flex-col gap-1">
                <span className="text-sm">Quartos (mín.)</span>
                <input name="minBedrooms" type="number" min="0" className="input" />
            </label>
            <SubmitButton text="Criar alerta" />
        </form>
    );
}
