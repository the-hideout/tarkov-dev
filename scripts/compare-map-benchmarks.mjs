import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

function parseArgs(argv) {
    const options = {};
    for (let index = 0; index < argv.length; index += 2) {
        options[argv[index].replace(/^--/, "")] = argv[index + 1];
    }
    if (!options.base || !options.head || !options.output) {
        throw new Error("Usage: compare-map-benchmarks.mjs --base BASE.json --head HEAD.json --output OUTPUT.md");
    }
    return options;
}

function formatMilliseconds(value) {
    return `${value.toFixed(1)} ms`;
}

function formatCount(value) {
    return Math.round(value).toLocaleString("en-US");
}

function change(base, head) {
    const difference = head - base;
    const percent = base === 0 ? 0 : (difference / base) * 100;
    const direction = difference < 0 ? "faster" : difference > 0 ? "slower" : "unchanged";
    return `${direction}: ${difference >= 0 ? "+" : ""}${difference.toFixed(1)} (${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%)`;
}

function metricRow(name, base, head, formatter = formatMilliseconds) {
    return `| ${name} | ${formatter(base)} | ${formatter(head)} | ${change(base, head)} |`;
}

const options = parseArgs(process.argv.slice(2));
const base = JSON.parse(await readFile(options.base, "utf8"));
const head = JSON.parse(await readFile(options.head, "utf8"));

const rows = [
    metricRow("Cold map ready", base.coldLoad.mapReadyMs, head.coldLoad.mapReadyMs),
    metricRow(
        "Warm map ready (median)",
        base.warmLoadSummary.mapReadyMs.median,
        head.warmLoadSummary.mapReadyMs.median,
    ),
    metricRow("Warm map ready (p95)", base.warmLoadSummary.mapReadyMs.p95, head.warmLoadSummary.mapReadyMs.p95),
    metricRow(
        "Marker render span (median)",
        base.warmLoadSummary.markerRenderMs.median,
        head.warmLoadSummary.markerRenderMs.median,
    ),
    metricRow(
        "Long-task time (median)",
        base.warmLoadSummary.longTaskTotalMs.median,
        head.warmLoadSummary.longTaskTotalMs.median,
    ),
    metricRow(
        "Rendered markers (median)",
        base.warmLoadSummary.markerCount.median,
        head.warmLoadSummary.markerCount.median,
        formatCount,
    ),
];

for (const group of Object.keys(head.layerToggles)) {
    rows.push(
        metricRow(
            `${group}: hide (median)`,
            base.layerToggles[group].hideSummary.median,
            head.layerToggles[group].hideSummary.median,
        ),
        metricRow(
            `${group}: show (median)`,
            base.layerToggles[group].showSummary.median,
            head.layerToggles[group].showSummary.median,
        ),
    );
}

const markdown = `<!-- map-performance-benchmark -->
## Streets of Tarkov map benchmark

| Metric | Base | PR | Change |
| --- | ---: | ---: | ---: |
${rows.join("\n")}

<details>
<summary>Methodology</summary>

- Chromium with ${head.options.cpuThrottle}x CPU throttling at a 1440x1000 viewport
- ${head.options.iterations} warm-load samples after ${head.options.warmups} warmups
- ${head.options.layerIterations} hide/show samples per layer group
- Map readiness requires marker mutations to settle for ${head.options.settleMs} ms, followed by two animation frames
- Negative timing changes are improvements; results are diagnostic and do not fail the PR

</details>
`;

await writeFile(options.output, markdown);
console.log(markdown);
