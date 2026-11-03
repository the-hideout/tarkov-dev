import { writeFile } from "node:fs/promises";
import { critical } from "critical";

// Stylesheets linked from index.html are picked up automatically.
// The static engine matches against the delivered HTML, so no browser is needed.
try {
    const { html, css } = await critical({
        src: "build/index.html",
        engine: "static",
        inline: true,
    });
    await writeFile("build/index.html", html);
    if (css) {
        console.log("Generated critical CSS");
    }
} catch (err) {
    console.error(err);
}
