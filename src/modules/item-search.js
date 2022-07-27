import Fuse from 'fuse.js';

const formatName = (name) => {
    return name
        .trim()
        .replace(/\s{2,}/g, ' ');
};

const itemSearch = (items, searchString) => {
    let formattedSearchString = formatName(searchString);

    if (formattedSearchString.length === 0) {
        return items;
    }

    const fuseFullOptions = {
        isCaseSensitive: false,
        includeScore: true,
        minMatchCharLength: 2,
        shouldSort: true,
        keys: [
            {
              name: 'shortName',
              weight: 0.1
            },
            {
              name: 'name',
              weight: 0.3
            },
            {
              name: 'normalizedName',
              weight: 0.9
            }
        ],
        threshold: 0.3,
        ignoreLocation: true,
        fieldNormWeight: 0.5,
    };

    const fuseFull = new Fuse(items, fuseFullOptions);
    const fuseFullResult = fuseFull.search(formattedSearchString);

    let fuzzyFullMatches = fuseFullResult.map((searchResult) => searchResult.item);

    return fuzzyFullMatches;
};

export default itemSearch;
