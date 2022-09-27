// Helper function to convert a string in camelcase format to a lowercase string with dashes
// Example: wowCow -> wow-cow

export default function camelCaseToDashes(input) {
    return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};
