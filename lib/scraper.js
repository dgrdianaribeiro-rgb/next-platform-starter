// Best-effort "import by link" helper.
//
// This intentionally does NOT attempt to crawl or bypass anti-bot protection on listing
// portals (ZAP Imóveis, OLX, QuintoAndar, etc). Those sites are JS-heavy and actively guard
// against automated scraping, and mass-crawling them would likely violate their terms of
// service. Instead, this fetches the public HTML of a single link the user pastes in and
// reads the same Open Graph / meta tags that site itself publishes for link previews (the
// same data WhatsApp or Slack would show when you paste the link there). The result is a
// starting point the user reviews and completes by hand before publishing — not a fully
// automated import.
export async function fetchListingPreview(url) {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Link inválido.');
    }

    const res = await fetch(url, {
        redirect: 'follow',
        headers: {
            'User-Agent':
                'Mozilla/5.0 (compatible; BuscaAluguelFortaleza/1.0; link-preview; +https://github.com/netlify-templates/next-platform-starter)',
            Accept: 'text/html'
        },
        signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
        throw new Error(`Não foi possível acessar este link (HTTP ${res.status}).`);
    }

    const html = await res.text();
    const meta = extractMeta(html);
    const priceGuess = extractPriceGuess(`${meta.description || ''} ${html.slice(0, 30000)}`);

    return {
        title: meta.title || parsed.hostname,
        description: meta.description || '',
        imageUrl: absolutizeUrl(meta.image, parsed) || null,
        priceGuess,
        sourceUrl: url,
        sourceName: parsed.hostname.replace(/^www\./, '')
    };
}

function extractMeta(html) {
    const readMetaTag = (property) => {
        const re = new RegExp(
            `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
            'i'
        );
        const reverse = new RegExp(
            `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
            'i'
        );
        const match = html.match(re) || html.match(reverse);
        return match ? decodeHtmlEntities(match[1]) : null;
    };

    const titleTag = html.match(/<title>([^<]*)<\/title>/i)?.[1];

    return {
        title: readMetaTag('og:title') || (titleTag ? decodeHtmlEntities(titleTag) : null),
        description: readMetaTag('og:description') || readMetaTag('description'),
        image: readMetaTag('og:image')
    };
}

function absolutizeUrl(maybeUrl, base) {
    if (!maybeUrl) return null;
    try {
        return new URL(maybeUrl, base).toString();
    } catch {
        return null;
    }
}

function decodeHtmlEntities(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function extractPriceGuess(text) {
    const match = text.match(/R\$\s?([\d.,]{3,12})/);
    if (!match) return null;
    const normalized = match[1].replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
    const value = parseFloat(normalized);
    return Number.isFinite(value) ? value : null;
}
