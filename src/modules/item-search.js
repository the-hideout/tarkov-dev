import Fuse from 'fuse.js';

const formatName = (name) => {
    return name
        .toLowerCase()
        .replace(/(\w)\s{1}/g, '$1')
        .trim();
};

const itemSearch = (items, searchString) => {
    let formattedSearchString = formatName(searchString);

    if (!formattedSearchString) {
        return items;
    }

    let matches = items.filter(
        (item) => formatName(item.shortName) === formattedSearchString,
    );

    if (!matches || matches.length === 0) {
        matches = items.filter((item) =>
            formatName(item.name).includes(formattedSearchString),
        );
    }

    if (!matches || matches.length === 0) {
        matches = items.filter((item) =>
            formatName(item.shortName).includes(formattedSearchString),
        );
    }

    if (!matches || matches.length === 0) {
        const options = {
            includeScore: true,
            keys: ['name'],
            distance: 1000,
        };

        const fuse = new Fuse(items, options);
        const result = fuse.search(formattedSearchString);

        matches = result.map((resultObject) => resultObject.item);
    }

    return matches;
};

export default itemSearch;
