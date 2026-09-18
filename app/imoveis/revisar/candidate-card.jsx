'use client';

import { publishCandidateAction, discardCandidateAction } from './actions';
import { SubmitButton } from 'components/submit-button';
import { Card } from 'components/card';
import { bairrosFortaleza } from 'data/bairros-fortaleza';

export function CandidateCard({ candidate }) {
    return (
        <Card>
            <form action={publishCandidateAction} className="flex flex-col gap-3">
                <input type="hidden" name="candidateId" value={candidate.id} />
                <input type="hidden" name="sourceUrl" value={candidate.sourceUrl} />
                <input type="hidden" name="sourceName" value={candidate.sourceName} />
                <input type="hidden" name="imageUrl" value={candidate.imageUrl || ''} />
                <p className="text-xs text-neutral-500">
                    Descoberto via {candidate.sourceLabel} ·{' '}
                    <a href={candidate.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                        ver anúncio original
                    </a>
                </p>
                {candidate.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={candidate.imageUrl} alt="" className="object-cover w-full rounded-sm max-h-40" />
                )}
                <label className="flex flex-col gap-1">
                    <span className="text-sm">Título</span>
                    <input name="title" type="text" required defaultValue={candidate.title} className="input" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-sm">Tipo</span>
                    <select name="type" defaultValue={candidate.typeGuess || 'apartamento'} className="input">
                        <option value="apartamento">Apartamento</option>
                        <option value="casa">Casa</option>
                    </select>
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-sm">Bairro</span>
                    <select name="neighborhood" required defaultValue={candidate.neighborhoodGuess || ''} className="input">
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
                    <span className="text-sm">Preço (R$/mês)</span>
                    <input
                        name="price"
                        type="number"
                        min="1"
                        required
                        defaultValue={candidate.priceGuess || ''}
                        className="input"
                    />
                </label>
                <div className="grid grid-cols-2 gap-3">
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
                    <textarea name="description" rows={3} defaultValue={candidate.description} className="input" />
                </label>
                <div className="flex items-center gap-4">
                    <SubmitButton text="Publicar" />
                    <button
                        type="submit"
                        formAction={discardCandidateAction.bind(null, candidate.id)}
                        formNoValidate
                        className="text-sm underline"
                    >
                        Descartar
                    </button>
                </div>
            </form>
        </Card>
    );
}
