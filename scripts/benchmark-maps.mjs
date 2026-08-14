import { createServer } from "node:http";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const defaults = {
    buildDir: "build",
    cpuThrottle: 4,
    executablePath: undefined,
    iterations: 7,
    layerIterations: 10,
    map: "streets-of-tarkov",
    output: "map-benchmark.json",
    settleMs: 750,
    timeoutMs: 120_000,
    warmups: 2,
};

const layerGroups = ["Loose Loot", "Lootable Items", "Tasks"];

function parseArgs(argv) {
    if (argv[0] === "--") {
        argv = argv.slice(1);
    }
    const options = { ...defaults };
    const optionNames = {
        "--build-dir": "buildDir",
        "--cpu-throttle": "cpuThrottle",
        "--executable-path": "executablePath",
        "--iterations": "iterations",
        "--layer-iterations": "layerIterations",
        "--map": "map",
        "--output": "output",
        "--settle-ms": "settleMs",
        "--timeout-ms": "timeoutMs",
        "--warmups": "warmups",
    };
    const numericOptions = new Set([
        "cpuThrottle",
        "iterations",
        "layerIterations",
        "settleMs",
        "timeoutMs",
        "warmups",
    ]);

    for (let index = 0; index < argv.length; index += 2) {
        const argument = argv[index];
        const optionName = optionNames[argument];
        const value = argv[index + 1];
        if (!optionName || value === undefined) {
            throw new Error(`Unknown or incomplete argument: ${argument}`);
        }
        options[optionName] = numericOptions.has(optionName) ? Number(value) : value;
    }

    for (const optionName of numericOptions) {
        if (!Number.isFinite(options[optionName]) || options[optionName] < 0) {
            throw new Error(`Invalid numeric option: ${optionName}`);
        }
    }
    return options;
}

function mimeType(filePath) {
    const extension = path.extname(filePath);
    return (
        {
            ".css": "text/css",
            ".gif": "image/gif",
            ".html": "text/html",
            ".ico": "image/x-icon",
            ".jpg": "image/jpeg",
            ".js": "text/javascript",
            ".json": "application/json",
            ".map": "application/json",
            ".png": "image/png",
            ".svg": "image/svg+xml",
            ".webp": "image/webp",
        }[extension] ?? "application/octet-stream"
    );
}

async function startStaticServer(buildDir) {
    const root = path.resolve(buildDir);
    const indexPath = path.join(root, "index.html");
    await stat(indexPath);

    const server = createServer(async (request, response) => {
        try {
            const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
            const relativePath = requestPath.replace(/^\/+/, "");
            let filePath = path.resolve(root, relativePath);
            if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
                response.writeHead(403).end();
                return;
            }

            try {
                if ((await stat(filePath)).isDirectory()) {
                    filePath = path.join(filePath, "index.html");
                }
            } catch {
                filePath = indexPath;
            }

            const content = await readFile(filePath);
            response.writeHead(200, {
                "cache-control": "public, max-age=3600",
                "content-type": mimeType(filePath),
            });
            response.end(content);
        } catch (error) {
            response.writeHead(500, { "content-type": "text/plain" });
            response.end(error.message);
        }
    });

    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    return {
        close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
        url: `http://127.0.0.1:${address.port}`,
    };
}

async function installBrowserObservers(page) {
    await page.addInitScript(() => {
        const state = {
            firstMarkerMutation: null,
            lastMarkerMutation: null,
            longTasks: [],
        };
        window.__mapBenchmark = state;

        const containsMarker = (node) =>
            node instanceof Element &&
            (node.matches(".leaflet-marker-icon, .leaflet-marker-shadow") ||
                node.querySelector(".leaflet-marker-icon, .leaflet-marker-shadow"));

        const observeMarkers = () => {
            const observer = new MutationObserver((records) => {
                const changed = records.some((record) =>
                    [...record.addedNodes, ...record.removedNodes].some(containsMarker),
                );
                if (!changed) {
                    return;
                }
                const now = performance.now();
                state.firstMarkerMutation ??= now;
                state.lastMarkerMutation = now;
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        };

        if (document.documentElement) {
            observeMarkers();
        } else {
            document.addEventListener("DOMContentLoaded", observeMarkers, { once: true });
        }

        try {
            const longTaskObserver = new PerformanceObserver((list) => {
                state.longTasks.push(...list.getEntries().map(({ startTime, duration }) => ({ startTime, duration })));
            });
            longTaskObserver.observe({ type: "longtask", buffered: true });
        } catch {
            // Long-task entries are unavailable in some Chromium configurations.
        }
    });
}

async function waitForMapReady(page, options) {
    await page.waitForSelector("#leaflet-map.leaflet-container", { timeout: options.timeoutMs });
    await page.waitForFunction(
        ({ groups, settleMs }) => {
            const benchmark = window.__mapBenchmark;
            const availableGroups = new Set(
                [...document.querySelectorAll(".leaflet-control-layers-group-selector")].map(
                    (element) => element.dataset.key,
                ),
            );
            return (
                benchmark?.lastMarkerMutation !== null &&
                performance.now() - benchmark.lastMarkerMutation >= settleMs &&
                groups.every((group) => availableGroups.has(group))
            );
        },
        { groups: layerGroups, settleMs: options.settleMs },
        { timeout: options.timeoutMs, polling: 100 },
    );

    return page.evaluate(async () => {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const readyAt = performance.now();
        const navigation = performance.getEntriesByType("navigation")[0];
        const benchmark = window.__mapBenchmark;
        const longTasks = benchmark.longTasks.filter((entry) => entry.startTime <= readyAt);
        return {
            domContentLoadedMs: navigation.domContentLoadedEventEnd,
            domNodes: document.getElementsByTagName("*").length,
            longTaskCount: longTasks.length,
            longTaskTotalMs: longTasks.reduce((total, entry) => total + entry.duration, 0),
            mapReadyMs: readyAt,
            markerCount: document.querySelectorAll(".leaflet-marker-icon").length,
            markerRenderMs: benchmark.lastMarkerMutation - benchmark.firstMarkerMutation,
            responseEndMs: navigation.responseEnd,
        };
    });
}

async function measureLoad(page, url, options) {
    await page.goto(url, { timeout: options.timeoutMs, waitUntil: "domcontentloaded" });
    try {
        await page.waitForLoadState("networkidle", { timeout: 30_000 });
    } catch {
        // Marker stability below is the authoritative readiness signal.
    }
    return waitForMapReady(page, options);
}

async function measureLayerToggle(page, group) {
    return page.evaluate(async (groupKey) => {
        const input = [...document.querySelectorAll(".leaflet-control-layers-group-selector")].find(
            (element) => element.dataset.key === groupKey,
        );
        if (!input) {
            throw new Error(`Layer group not found: ${groupKey}`);
        }

        const markerCountBefore = document.querySelectorAll(".leaflet-marker-icon").length;
        const startedAt = performance.now();
        input.click();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return {
            durationMs: performance.now() - startedAt,
            markerDelta: document.querySelectorAll(".leaflet-marker-icon").length - markerCountBefore,
            visible: input.checked,
        };
    }, group);
}

function percentile(values, percentileValue) {
    if (values.length === 0) {
        return 0;
    }
    const sorted = [...values].sort((left, right) => left - right);
    return sorted[Math.ceil((percentileValue / 100) * sorted.length) - 1];
}

function summarize(values) {
    return {
        median: percentile(values, 50),
        p95: percentile(values, 95),
    };
}

function summarizeLoads(loads) {
    const keys = ["mapReadyMs", "markerRenderMs", "longTaskTotalMs", "domNodes", "markerCount"];
    return Object.fromEntries(keys.map((key) => [key, summarize(loads.map((load) => load[key]))]));
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const server = await startStaticServer(options.buildDir);
    const browser = await chromium.launch({
        executablePath: options.executablePath,
        headless: true,
    });

    try {
        const context = await browser.newContext({ viewport: { height: 1000, width: 1440 } });
        const page = await context.newPage();
        await installBrowserObservers(page);

        if (options.cpuThrottle > 1) {
            const session = await context.newCDPSession(page);
            await session.send("Emulation.setCPUThrottlingRate", { rate: options.cpuThrottle });
        }

        const url = `${server.url}/map/${options.map}`;
        const coldLoad = await measureLoad(page, url, options);
        for (let index = 0; index < options.warmups; index += 1) {
            await measureLoad(page, url, options);
        }

        const warmLoads = [];
        for (let index = 0; index < options.iterations; index += 1) {
            warmLoads.push(await measureLoad(page, url, options));
        }

        const layerToggles = {};
        for (const group of layerGroups) {
            const hide = [];
            const show = [];
            for (let index = 0; index < options.layerIterations; index += 1) {
                const hidden = await measureLayerToggle(page, group);
                const shown = await measureLayerToggle(page, group);
                if (hidden.visible || !shown.visible) {
                    throw new Error(`Unexpected toggle state for layer group: ${group}`);
                }
                hide.push(hidden);
                show.push(shown);
            }
            layerToggles[group] = {
                hide,
                hideSummary: summarize(hide.map((sample) => sample.durationMs)),
                show,
                showSummary: summarize(show.map((sample) => sample.durationMs)),
            };
        }

        const result = {
            coldLoad,
            generatedAt: new Date().toISOString(),
            layerToggles,
            map: options.map,
            options: {
                cpuThrottle: options.cpuThrottle,
                iterations: options.iterations,
                layerIterations: options.layerIterations,
                settleMs: options.settleMs,
                warmups: options.warmups,
            },
            warmLoadSummary: summarizeLoads(warmLoads),
            warmLoads,
        };
        await writeFile(options.output, `${JSON.stringify(result, null, 2)}\n`);
        console.log(JSON.stringify(result, null, 2));
    } finally {
        await browser.close();
        await server.close();
    }
}

await main();
