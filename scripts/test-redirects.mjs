import fs from "fs";
import path from "path";
import url from "url";

import redirects from "../workers-site/redirects.json";

(async () => {
    let liveNames = [];
    try {
        const response = await fetch("https://json.tarkov.dev/regular/items", {
            method: "POST",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                query: `{
                    itemsByType(type: any){
                        normalizedName
                    }
                }`,
            }),
        }).then((response) => response.json());

        liveNames = Object.values(response.data.items).map((item) => item.normalizedName);
    } catch (loadError) {
        console.error(loadError);

        return false;
    }

    const keys = Object.keys(redirects);

    for (const key of keys) {
        const itemName = key.replace("/item/", "");
        if (!liveNames.includes(itemName)) {
            continue;
        }

        console.log(`${key} `);

        Reflect.deleteProperty(redirects, key);
    }

    const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
    fs.writeFileSync(path.join(__dirname, "..", "workers-site", "redirects.json"), JSON.stringify(redirects, null, 4));
})();
