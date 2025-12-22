/** @type {import("stylelint").Config} */
const config = {
    extends: ['stylelint-config-standard'],
    rules: {
        'length-zero-no-unit': false,
        'alpha-value-notation': 'number',
        'shorthand-property-no-redundant-values': 'ignore',
        'font-family-name-quotes': 'always-unless-keyword',
    },
};

export default config;
