'use client';

import { useActionState } from 'react';
import { previewListingAction, saveListingAction } from './actions';
import { Alert } from 'components/alert';
import { SubmitButton } from 'components/submit-button';
import { bairrosFortaleza } from 'data/bairros-fortaleza';

export function ImportForm() {
    const [previewState, previewAction] = useActionState(previewListingAction, null);
    const preview = previewState?.preview;

    return (
        <div className="flex flex-col gap-8">
            <form action={previewAction} className="flex flex-col gap-4 max-w-xl">
                <label className="flex flex-col gap-1">
                    <span className="text-sm">Link do anúncio (qualquer site)</span>
                    <input name="url" type="url" required placeholder="https://..." className="input" />
                </label>
                {previewState?.error && <Alert type="error">{previewState.error}</Alert>}
                <SubmitButton text="Buscar informações do link" />
                <p className="text-sm text-neutral-400">
                    Lemos apenas as informações públicas de pré-visualização do link (título, descrição e imagem) — o
                    mesmo que aparece quando você cola o link no WhatsApp. Revise e complete os dados antes de salvar.
                </p>
            </form>

            {preview && (
                <form action={saveListingAction} className="flex flex-col gap-4 max-w-xl">
                    <h3>Confirme os dados do imóvel</h3>
                    <input type="hidden" name="sourceUrl" value={preview.sourceUrl} />
                    <input type="hidden" name="sourceName" value={preview.sourceName} />
                    <label className="flex flex-col gap-1">
                        <span className="text-sm">Título</span>
                        <input name="title" type="text" required defaultValue={preview.title} className="input" />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm">Tipo</span>
                        <select name="type" defaultValue="apartamento" className="input">
                            <option value="apartamento">Apartamento</option>
                            <option value="casa">Casa</option>
                        </select>
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm">Bairro</span>
                        <select name="neighborhood" required defaultValue="" className="input">
                            <option value="" disabled>
                                Selecione...
                            </option>
                            {bairrosFortaleza.map((bairro) => (
                                <option key={bairro} value={bairro}>
                                    {bairro}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm">Preço do aluguel (R$/mês)</span>
                        <input
                            name="price"
                            type="number"
                            min="1"
                            required
                            defaultValue={preview.priceGuess || ''}
                            className="input"
                        />
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1">
                            <span className="text-sm">Quartos</span>
                            <input name="bedrooms" type="number" min="0" className="input" />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-sm">Área (m²)</span>
                            <input name="area" type="number" min="0" className="input" />
                        </label>
                    </div>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm">Descrição</span>
                        <textarea
                            name="description"
                            rows={4}
                            defaultValue={preview.description}
                            className="input"
                        />
                    </label>
                    <input type="hidden" name="imageUrl" value={preview.imageUrl || ''} />
                    {preview.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview.imageUrl} alt="" className="object-cover w-full rounded-sm max-h-64" />
                    )}
                    <SubmitButton text="Salvar imóvel" />
                </form>
            )}
        </div>
    );
}
