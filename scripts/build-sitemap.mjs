import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { createGzip } from "zlib";
import { pipeline } from "stream";
import { createReadStream, createWriteStream, unlink } from "fs";

import maps from "../src/data/maps.json" with { type: "json" };
import categoryPages from "../src/data/category-pages.json" with { type: "json" };

import { caliberArrayWithSplit } from "../src/modules/format-ammo.mjs";
//import apiRequest from "../src/modules/api-request.mjs";

const standardPaths = [
    "",
    "/ammo",
    "/barters",
    "/hideout-profit",
    "/loot-tier",
    "/trader/prapor",
    "/trader/therapist",
    "/trader/skier",
    "/trader/fence",
    "/trader/peacekeeper",
    "/trader/mechanic",
    "/trader/ragman",
    "/trader/jaeger",
    "/trader/lightkeeper",
    "/wipe-length",
    "/bitcoin-farm-calculator",
];

const standardPathsWeekly = [
    "/about",
    "/api",
    "/api-users",
    "/control",
    "/items",
    "/maps",
    "/moobot",
    "/nightbot",
    "/settings",
    "/streamelements",
    "/traders",
    "/bosses",
    "/tasks",
    "/hideout",
];

const languages = ["de", "en", "fr", "it", "ja", "pl", "pt", "ru"];

const addPath = (sitemap, url, change = "hourly") => {
    for (const lang in languages) {
        sitemap = `${sitemap}
    <url>`;

        if (Object.hasOwnProperty.call(languages, lang)) {
            const loclang = languages[lang];

            if (loclang === "en") {
                sitemap = `${sitemap}
        <loc>https://tarkov.dev${url}</loc>`;
            } else {
                sitemap = `${sitemap}
        <loc>https://tarkov.dev${url}?lng=${loclang}</loc>`;
            }

            for (const lang in languages) {
                if (Object.hasOwnProperty.call(languages, lang)) {
                    const hreflang = languages[lang];

                    if (hreflang === "en") {
                        sitemap = `${sitemap}
            <xhtml:link rel="alternate" hreflang="${hreflang}" href="https://tarkov.dev${url}"/>`;
                    } else {
                        sitemap = `${sitemap}
            <xhtml:link rel="alternate" hreflang="${hreflang}" href="https://tarkov.dev${url}?lng=${hreflang}"/>`;
                    }
                }
            }
        }

        sitemap = `${sitemap}
        <changefreq>${change}</changefreq>
    </url>`;
    }

    return sitemap;
};

const apiRequest = (path) => {
    return fetch(`https://json.tarkov.dev/${path}`, {
        cache: "no-cache",
        headers: {
            Accept: "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            return Promise.reject(new Error(`${response.status} ${response.statusText}`));
        }
        return response.json().then((json) => json.data);
    });
};

async function build_sitemap() {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    for (const path of standardPaths) {
        sitemap = addPath(sitemap, path);
    }

    for (const path of standardPathsWeekly) {
        sitemap = addPath(sitemap, path, "weekly");
    }

    for (const mapsGroup of maps) {
        for (const map of mapsGroup.maps) {
            sitemap = addPath(sitemap, `/map/${map.key}`, "weekly");
        }
    }

    const itemResponse = await apiRequest("regular/items");

    const itemCategories = Object.values(itemResponse.itemCategories);
    for (const itemCategory of itemCategories) {
        sitemap = addPath(sitemap, `/items/${itemCategory.normalizedName}`);
    }

    const itemHandbookCategories = Object.values(itemResponse.handbookCategories);
    for (const itemCategory of itemHandbookCategories) {
        sitemap = addPath(sitemap, `/items/handbook/${itemCategory.normalizedName}`);
    }

    for (const categoryPage of categoryPages) {
        sitemap = addPath(sitemap, `/items/${categoryPage.key}`);
    }

    const mapsResponse = await apiRequest("regular/maps");

    const allBosses = Object.values(mapsResponse.mobs);
    for (const boss of allBosses) {
        sitemap = addPath(sitemap, `/boss/${boss.normalizedName}`);
    }

    const tasksResponse = await apiRequest("regular/tasks");

    const allTasks = Object.values(tasksResponse.tasks);
    for (const task of allTasks) {
        sitemap = addPath(sitemap, `/task/${task.normalizedName}`, "weekly");
    }

    const ammoTypes = caliberArrayWithSplit();
    for (const ammoType of ammoTypes) {
        sitemap = addPath(sitemap, `/ammo/${ammoType.replace(/ /g, "%20")}`);
    }

    sitemap = `${sitemap}
</urlset>`;

    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    writeFileSync(path.join(__dirname, "..", "public", "sitemap.xml"), sitemap);
}

async function build_sitemap_items() {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    const itemsResponse = await apiRequest("regular/items");
    const allItems = Object.values(itemsResponse.items);
    for (const item of allItems) {
        sitemap = addPath(sitemap, `/item/${item.normalizedName}`);
    }

    sitemap = `${sitemap}
</urlset>`;

    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    writeFileSync(path.join(__dirname, "..", "public", "sitemap_items.xml"), sitemap);

    const gzip = createGzip();
    const source = createReadStream(path.join(__dirname, "..", "public", "sitemap_items.xml"));
    const destination = createWriteStream(path.join(__dirname, "..", "public", "sitemap_items.xml.gz"));

    pipeline(source, gzip, destination, (err) => {
        if (err) {
            console.error("An error occurred:", err);
            process.exitCode = 1;
        }

        unlink(path.join(__dirname, "..", "public", "sitemap_items.xml"), (err) => {
            if (err) {
                throw err;
            }
            console.log("successfully deleted sitemap_items.xml");
        });
    });
}

async function build_sitemap_index() {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>https://tarkov.dev/sitemap.xml</loc>
    </sitemap>
    <sitemap>
        <loc>https://tarkov.dev/sitemap_items.xml.gz</loc>
    </sitemap>
</sitemapindex>`;

    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    writeFileSync(path.join(__dirname, "..", "public", "sitemap_index.xml"), sitemap);
}

(async () => {
    try {
        console.time("build-sitemap");

        await build_sitemap();

        await build_sitemap_items();

        await build_sitemap_index();

        console.timeEnd("build-sitemap");
    } catch (error) {
        console.error(error);
        console.log("trying to use pre-built sitemap (offline mode?)");
    }
})();
