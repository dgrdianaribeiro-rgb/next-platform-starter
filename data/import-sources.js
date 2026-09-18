// Sources for automatic listing discovery via public sitemap.xml files (see lib/sitemap.js
// and netlify/functions/discover-listings.js). Empty by default — no source is scraped
// unless you configure one here.
//
// Configure via the IMPORT_SOURCES environment variable, a JSON array like:
//   [{"name":"Exemplo","sitemapUrl":"https://www.exemplo.com.br/sitemap.xml","urlPattern":"/imovel/"}]
//
// - name: label shown in the review queue.
// - sitemapUrl: the site's public sitemap (often linked from /robots.txt).
// - urlPattern (optional): regex string to keep only listing detail page URLs from the
//   sitemap, discarding categories, blog posts, etc.
//
// Before adding a source, confirm in that site's own Terms of Use that automated reading of
// its sitemap and listing pages is allowed — this app checks robots.txt for you, but
// robots.txt and a site's Terms of Use are not the same thing.
export function getImportSources() {
    const raw = process.env.IMPORT_SOURCES;
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        console.warn('IMPORT_SOURCES não é um JSON válido; nenhuma fonte de descoberta automática configurada.');
        return [];
    }
}
