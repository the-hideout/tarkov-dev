import fs from "fs";
import path from "path";
import url from "url";

import fetch from "cross-fetch";

import redirects from "../workers-site/redirects.json";

(async () => {
    let liveNames = [];
    try {
        const response = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                query: `{
                    itemsByType(type: any){
                        normalizedName
                    }
                }`
            }),
        }).then(response => response.json());

        liveNames = response.data.itemsByType.map(item => item.normalizedName);
    }
    catch (loadError) {
        console.error(loadError);

        return false;
    }

    const keys = Object.keys(redirects);

    for (const key of keys) {
        const itemName = key.replace('/item/', '');
        if (!liveNames.includes(itemName)) {
            continue;
        }

        console.log(`${key} `);

        Reflect.deleteProperty(redirects, key);
    }

    const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
    fs.writeFileSync(path.join(__dirname, '..', 'workers-site', 'redirects.json'), JSON.stringify(redirects, null, 4));
})();
