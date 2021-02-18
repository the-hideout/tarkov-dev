module.exports = (name) => {
    return name.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-\-/g, '-');
};