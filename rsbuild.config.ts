import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

export default defineConfig({
    plugins: [pluginReact(), pluginSvgr({ mixedImport: true })],
    server: {
        base: process.env.PUBLIC_URL,
    },
    html: {
        template: './public/index.html',
    },
    output: {
        distPath: {
            root: 'build',
        },
    },
});
