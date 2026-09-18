// Reads a site's public sitemap.xml — the index of URLs a site itself publishes for search
// engines to crawl (referenced from robots.txt, meant to be read by robots). This is a very
// different thing from scraping rendered search-result pages: no anti-bot bypass involved,
// just reading a file the site put there for exactly this purpose.
//
// This does NOT fetch every URL it finds — see netlify/functions/discover-listings.js, which
// caps how many new URLs it acts on per run and checks robots.txt before fetching any of them.
const USER_AGENT = 'Mozilla/5.0 (compatible; BuscaAluguelFortalezaBot/1.0; +sitemap-reader)';

export async function fetchSitemapListingUrls(sitemapUrl, { urlPattern, maxUrls = 200, depth = 0 } = {}) {
    if (depth > 2) return [];

    const res = await fetch(sitemapUrl, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/xml,text/xml' },
        signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) {
        throw new Error(`Não foi possível acessar o sitemap (HTTP ${res.status}).`);
    }
    const xml = await res.text();

    // Sitemap index: a sitemap of sitemaps. Recurse into a bounded number of children.
    const childSitemaps = [...xml.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/gi)].map((m) => m[1]);
    if (childSitemaps.length) {
        const results = [];
        for (const child of childSitemaps.slice(0, 5)) {
            const childUrls = await fetchSitemapListingUrls(child, { urlPattern, maxUrls, depth: depth + 1 });
            results.push(...childUrls);
            if (results.length >= maxUrls) break;
        }
        return results.slice(0, maxUrls);
    }

    const pattern = urlPattern ? new RegExp(urlPattern) : null;
    const urls = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/gi)].map((m) => m[1]);
    const filtered = pattern ? urls.filter((url) => pattern.test(url)) : urls;
    return filtered.slice(0, maxUrls);
}
