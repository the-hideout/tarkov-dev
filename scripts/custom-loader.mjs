import { URL } from "url";
import { readFile } from "fs/promises";

/**
 * This function forces .mjs files to be loades as ES modules
 * so the default export is a string containing the CSS stylesheet.
 */
export async function load(url, context, defaultLoad) {
    if (context.format !== 'commonjs') {
        return defaultLoad(url, context, defaultLoad);
    }

    const forceConvert = [
        'do-fetch-items.mjs',
        'do-fetch-barters.mjs',
        'do-fetch-crafts.mjs',
        'do-fetch-hideout.mjs',
        'do-fetch-maps.mjs',
        'do-fetch-meta.mjs',
        'do-fetch-traders.mjs',
        'do-fetch-quests.mjs',
        'do-fetch-bosses.mjs',
        'flea-market-fee.mjs',
        'camelcase-to-dashes.mjs',
        'graphql-request.mjs',
        'api-query.mjs',
    ];

    for (const fileName of forceConvert) {
        if (url.endsWith(fileName)) {
            const content = await readFile(new URL(url));
            return {
                format: "module",
                source: content,
                shortCircuit: true
            };
        }
    }
    return defaultLoad(url, context, defaultLoad);
}
