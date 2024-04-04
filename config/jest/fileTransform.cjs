const path = require('path');

// A simple camelCase function for demonstration purposes
function camelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return ''; // or if (/\s+/.test(match)) for white space
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

module.exports = {
    process(src, filename) {
        const assetFilename = JSON.stringify(path.basename(filename));

        if (filename.match(/\.svg$/)) {
            // Convert file name to PascalCase as a simple replacement for camelcase functionality
            const pascalCaseFilename = camelCase(path.parse(filename).name).replace(
                /(?:^\w|[A-Z]|\b\w)/g,
                (letter, index) => (index === 0 ? letter.toUpperCase() : letter.toLowerCase()),
            );
            const componentName = `Svg${pascalCaseFilename}`;
            const code = `const React = require('react');
            module.exports = {
                __esModule: true,
                default: ${assetFilename},
                ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
                return {
                    $$typeof: Symbol.for('react.element'),
                    type: 'svg',
                    ref: ref,
                    key: null,
                    props: Object.assign({}, props, {
                    children: ${assetFilename}
                    })
                };
                }),
            };`;
            return { code }; // Return an object with a `code` property
        }

        // For non-SVG assets, simply return the asset filename as a module export
        const code = `module.exports = ${assetFilename};`;
        return { code }; // Return an object with a `code` property
    },
};
