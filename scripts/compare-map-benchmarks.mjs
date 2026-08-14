import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const noiseBandPercent = 10;
const bootstrapIterations = 10_000;
const minimumIndependentSamples = 5;

function parseArgs(argv) {
    const options = {};
    for (let index = 0; index < argv.length; index += 2) {
        options[argv[index].replace(/^--/, "")] = argv[index + 1];
    }
    if (!options.input || !options.output) {
        throw new Error("Usage: compare-map-benchmarks.mjs --input RESULTS.json --output OUTPUT.md");
    }
    return options;
}

function percentile(values, percentileValue) {
    const sorted = [...values].sort((left, right) => left - right);
    return sorted[Math.ceil((percentileValue / 100) * sorted.length) - 1];
}

function median(values) {
    return percentile(values, 50);
}

function pairedDeltas(base, head) {
    if (base.length !== head.length) {
        throw new Error(`Paired sample counts differ: ${base.length} base, ${head.length} head`);
    }
    return base.map((baseValue, index) => ((head[index] - baseValue) / baseValue) * 100);
}

function createRandom(seed) {
    return () => {
        seed = (1664525 * seed + 1013904223) >>> 0;
        return seed / 2 ** 32;
    };
}

function bootstrapMedianConfidenceInterval(values) {
    const random = createRandom(0x5eed1234);
    const medians = [];
    for (let iteration = 0; iteration < bootstrapIterations; iteration += 1) {
        const sample = [];
        for (let index = 0; index < values.length; index += 1) {
            sample.push(values[Math.floor(random() * values.length)]);
        }
        medians.push(median(sample));
    }
    return [percentile(medians, 2.5), percentile(medians, 97.5)];
}

function pairedChange(base, head, blockSize = 1) {
    const deltas = pairedDeltas(base, head);
    const independentDeltas = [];
    for (let index = 0; index < deltas.length; index += blockSize) {
        independentDeltas.push(median(deltas.slice(index, index + blockSize)));
    }
    const medianDelta = median(independentDeltas);
    const [low, high] = bootstrapMedianConfidenceInterval(independentDeltas);
    let status = "within noise";
    if (
        independentDeltas.length >= minimumIndependentSamples &&
        Math.abs(medianDelta) >= noiseBandPercent &&
        high < 0
    ) {
        status = "faster";
    } else if (
        independentDeltas.length >= minimumIndependentSamples &&
        Math.abs(medianDelta) >= noiseBandPercent &&
        low > 0
    ) {
        status = "slower";
    }
    const sign = (value) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
    return `${status}: ${sign(medianDelta)} (95% CI ${sign(low)} to ${sign(high)})`;
}

function formatMilliseconds(value) {
    return `${value.toFixed(1)} ms`;
}

function formatCount(value) {
    return Math.round(value).toLocaleString("en-US");
}

function metricRow(name, base, head, formatter = formatMilliseconds, blockSize = 1) {
    return `| ${name} | ${formatter(median(base))} | ${formatter(median(head))} | ${pairedChange(base, head, blockSize)} |`;
}

const options = parseArgs(process.argv.slice(2));
const result = JSON.parse(await readFile(options.input, "utf8"));
const loadValues = (version, key) => result.warmLoads[version].map((sample) => sample[key]);
const toggleValues = (group, version, action) =>
    result.layerToggles[group][version][action].map((sample) => sample.durationMs);

const rows = [
    metricRow("Warm map ready", loadValues("base", "mapReadyMs"), loadValues("head", "mapReadyMs")),
    metricRow("Marker render span", loadValues("base", "markerRenderMs"), loadValues("head", "markerRenderMs")),
    metricRow("Long-task time", loadValues("base", "longTaskTotalMs"), loadValues("head", "longTaskTotalMs")),
    metricRow("Rendered markers", loadValues("base", "markerCount"), loadValues("head", "markerCount"), formatCount),
];

for (const group of Object.keys(result.layerToggles)) {
    rows.push(
        metricRow(
            `${group}: hide`,
            toggleValues(group, "base", "hide"),
            toggleValues(group, "head", "hide"),
            formatMilliseconds,
            result.options.layerBlockSize,
        ),
        metricRow(
            `${group}: show`,
            toggleValues(group, "base", "show"),
            toggleValues(group, "head", "show"),
            formatMilliseconds,
            result.options.layerBlockSize,
        ),
    );
}

const markdown = `<!-- map-performance-benchmark -->
## Streets of Tarkov map benchmark

| Metric | Base median | PR median | Paired change |
| --- | ---: | ---: | --- |
${rows.join("\n")}

Changes are classified only when the paired median is at least ${noiseBandPercent}%, its 95% bootstrap confidence interval excludes zero, and at least ${minimumIndependentSamples} independent samples or blocks exist.

<details>
<summary>Methodology</summary>

- Base and PR production builds run simultaneously in one Chromium process
- External API and map responses are recorded during warmup, then replayed identically with unexpected network requests blocked
- One foreground page is shared by both revisions to avoid background-tab throttling
- Load samples alternate base/PR order; layer samples alternate in blocks of ${result.options.layerBlockSize} to distribute runner drift
- Chromium uses ${result.options.cpuThrottle}x CPU throttling at a 1440x1000 viewport
- ${result.options.iterations} paired warm-load samples after ${result.options.warmups} warmups
- ${result.options.layerIterations} paired hide/show samples per layer group
- Layer confidence intervals resample block medians so correlated toggles are not treated as independent observations
- Map readiness requires marker mutations to settle for ${result.options.settleMs} ms, followed by two animation frames
- First-load timings remain in the downloadable artifact for diagnostics but are not compared
- Results are diagnostic and do not fail the PR

</details>
`;

await writeFile(options.output, markdown);
console.log(markdown);
