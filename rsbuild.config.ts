import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { execSync } from "node:child_process";

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const branchName = execSync("git rev-parse --abbrev-ref HEAD")
  .toString()
  .trim();

export default defineConfig({
  plugins: [pluginReact(), pluginSvgr({ mixedImport: true })],
  server: {
    base: process.env.PUBLIC_URL,
  },
  source: {
    define: {
      "process.env.RSTEST": process.env.RSTEST,
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __BRANCH_NAME__: JSON.stringify(branchName),
    },
  },
  html: {
    template: "./public/index.html",
  },
  output: {
    distPath: {
      root: "build",
    },
  },
});
