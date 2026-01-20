/** @type {import("stylelint").Config} */
const config = {
    extends: ["stylelint-config-standard"],
    rules: {
        "length-zero-no-unit": null,
        "alpha-value-notation": "number",
        "shorthand-property-no-redundant-values": null,
        "font-family-name-quotes": "always-unless-keyword",
        "selector-class-pattern": ".+",
    },
};

export default config;
