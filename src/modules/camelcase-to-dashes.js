// This has to be a CommonJS module
// See note in do-fetch-items

// Helper function to convert a string in camelcase format to a lowercase string with dashes
// Example: wowCow -> wow-cow

module.exports = (input) => {
    return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};
