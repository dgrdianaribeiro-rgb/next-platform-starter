// Politeness check: before fetching a discovered URL, confirm robots.txt doesn't disallow it
// for general crawlers. This is a floor, not a ceiling — robots.txt allowing a fetch doesn't
// by itself mean a site's Terms of Service permit importing its listings elsewhere. Whoever
// configures IMPORT_SOURCES (see data/import-sources.js) is responsible for checking that.
const robotsCache = new Map();

function parseRobotsTxt(text) {
    const lines = text.split('\n').map((line) => line.trim());
    let inWildcardGroup = false;
    const disallow = [];

    for (const line of lines) {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex === -1) continue;

        const key = line.slice(0, separatorIndex).trim().toLowerCase();
        const value = line.slice(separatorIndex + 1).trim();

        if (key === 'user-agent') {
            inWildcardGroup = value === '*';
        } else if (inWildcardGroup && key === 'disallow' && value) {
            disallow.push(value);
        }
    }

    return { disallow };
}

async function getRobotsRules(origin) {
    if (robotsCache.has(origin)) return robotsCache.get(origin);

    let rules;
    try {
        const res = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(8000) });
        rules = res.ok ? parseRobotsTxt(await res.text()) : { disallow: [] };
    } catch {
        // Can't confirm the site allows it — default to the conservative choice.
        rules = { disallow: ['/'] };
    }

    robotsCache.set(origin, rules);
    return rules;
}

export async function isAllowedByRobots(url) {
    const parsed = new URL(url);
    const { disallow } = await getRobotsRules(parsed.origin);
    return !disallow.some((rule) => parsed.pathname.startsWith(rule));
}
