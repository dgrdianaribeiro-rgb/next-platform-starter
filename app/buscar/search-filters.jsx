import { bairrosFortaleza } from 'data/bairros-fortaleza';

export function SearchFilters({ filters }) {
    return (
        <form className="grid grid-cols-1 gap-4 p-6 rounded-sm sm:grid-cols-2 lg:grid-cols-5 bg-white/5" method="GET">
            <label className="flex flex-col gap-1">
                <span className="text-sm">Tipo</span>
                <select name="tipo" defaultValue={filters.type} className="input">
                    <option value="qualquer">Casa ou apartamento</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa</option>
                </select>
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm">Bairro</span>
                <select name="bairro" defaultValue={filters.neighborhood} className="input">
                    <option value="">Qualquer bairro</option>
                    {bairrosFortaleza.map((bairro) => (
                        <option key={bairro} value={bairro}>
                            {bairro}
                        </option>
                    ))}
                </select>
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm">Preço mín. (R$)</span>
                <input name="precoMin" type="number" min="0" defaultValue={filters.minPrice || ''} className="input" />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm">Preço máx. (R$)</span>
                <input name="precoMax" type="number" min="0" defaultValue={filters.maxPrice || ''} className="input" />
            </label>
            <label className="flex flex-col gap-1">
                <span className="text-sm">Quartos (mín.)</span>
                <input
                    name="quartosMin"
                    type="number"
                    min="0"
                    defaultValue={filters.minBedrooms || ''}
                    className="input"
                />
            </label>
            <button className="btn lg:col-span-5 sm:w-fit" type="submit">
                Buscar
            </button>
        </form>
    );
}
