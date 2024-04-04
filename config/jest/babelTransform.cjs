const babelJest = require('babel-jest').default;

const hasJsxRuntime = (() => {
    if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
        return false;
    }

    try {
        require.resolve('react/jsx-runtime');
        return true;
    } catch (e) {
        return false;
    }
})();

module.exports = babelJest.createTransformer({
    presets: [
        // Add @babel/preset-env to ensure modern JS syntax is handled
        require.resolve('@babel/preset-env'),
        [
            require.resolve('@babel/preset-react'),
            {
                runtime: hasJsxRuntime ? 'automatic' : 'classic',
            },
        ],
    ],
    babelrc: false,
    configFile: false,
});
