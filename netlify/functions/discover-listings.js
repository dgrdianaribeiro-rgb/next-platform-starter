// Scheduled Netlify Function (runs hourly, see `config` below). Reads public sitemap.xml
// files from the sources configured in IMPORT_SOURCES, and queues any listing URLs it hasn't
// seen yet for human review at /imoveis/revisar — nothing is published to search
// automatically. See data/import-sources.js and lib/sitemap.js for the reasoning: this reads
// each site's own crawler index, it does not scrape search-result pages or bypass anti-bot
// protection.
import { fetchSitemapListingUrls } from '../../lib/sitemap.js';
import { isAllowedByRobots } from '../../lib/robots.js';
import { fetchListingPreview } from '../../lib/scraper.js';
import { guessNeighborhood, guessType } from '../../lib/guess.js';
import { getImportSources } from '../../data/import-sources.js';
import { db } from '../../lib/db.js';

const MAX_NEW_CANDIDATES_PER_SOURCE = 10;
const DELAY_BETWEEN_FETCHES_MS = 500;

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async () => {
    const sources = getImportSources();
    if (!sources.length) {
        return new Response('Nenhuma fonte configurada em IMPORT_SOURCES; nada a fazer.', { status: 200 });
    }

    const summary = [];

    for (const source of sources) {
        try {
            const urls = await fetchSitemapListingUrls(source.sitemapUrl, { urlPattern: source.urlPattern });
            let added = 0;

            for (const url of urls) {
                if (added >= MAX_NEW_CANDIDATES_PER_SOURCE) break;

                const [alreadyListed, alreadyQueued] = await Promise.all([
                    db.listings.hasSourceUrl(url),
                    db.importQueue.hasUrl(url)
                ]);
                if (alreadyListed || alreadyQueued) continue;

                const allowed = await isAllowedByRobots(url);
                if (!allowed) continue;

                try {
                    const preview = await fetchListingPreview(url);
                    const text = `${preview.title} ${preview.description}`;
                    await db.importQueue.add({
                        id: crypto.randomUUID(),
                        sourceUrl: url,
                        sourceName: preview.sourceName,
                        sourceLabel: source.name,
                        title: preview.title,
                        description: preview.description,
                        imageUrl: preview.imageUrl,
                        priceGuess: preview.priceGuess,
                        neighborhoodGuess: guessNeighborhood(text),
                        typeGuess: guessType(text),
                        discoveredAt: new Date().toISOString()
                    });
                    added++;
                } catch (err) {
                    console.warn(`[discover-listings] falha ao ler ${url}:`, err.message);
                }

                await wait(DELAY_BETWEEN_FETCHES_MS);
            }

            summary.push(`${source.name}: ${added} novo(s) candidato(s)`);
        } catch (err) {
            summary.push(`${source.name}: erro (${err.message})`);
        }
    }

    return new Response(summary.join('\n'), { status: 200 });
};

export const config = {
    schedule: '@hourly'
};
