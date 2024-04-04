module.exports = {
    process(src, filename) {
        // If you're simply mocking CSS modules or ignoring CSS content,
        // return a placeholder or an empty object.
        return {
            code: 'module.exports = {};',
        };
    },
};
