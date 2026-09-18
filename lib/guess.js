import { bairrosFortaleza } from '../data/bairros-fortaleza.js';

function normalize(str) {
    return (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function guessNeighborhood(text) {
    const normalizedText = normalize(text);
    return bairrosFortaleza.find((bairro) => bairro !== 'Outro' && normalizedText.includes(normalize(bairro))) || null;
}

export function guessType(text) {
    const normalizedText = normalize(text);
    if (normalizedText.includes('casa')) return 'casa';
    if (normalizedText.includes('apartamento') || normalizedText.includes('apto')) return 'apartamento';
    return null;
}
