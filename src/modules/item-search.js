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

    let shortMatches = items.filter(
        (item) => formatName(item.shortName).includes(formattedSearchString),
    ).map((item) => item.id);

    let fullMatches = items.filter(
        (item) => formatName(item.name).includes(formattedSearchString),
    ).map((item) => item.id);

    const fuseFullOptions = {
        includeScore: true,
        keys: ['name'],
        distance: 100,
    };

    const fuseFull = new Fuse(items, fuseFullOptions);
    const fuseFullResult = fuseFull.search(formattedSearchString);

    let fuzzyFullMatches = fuseFullResult.map((searchResult) => searchResult.item).map((item) => item.id);

    let allMatches = [...shortMatches, ...fullMatches, ...fuzzyFullMatches];
    //Remove duplicates from allMatches while maintaining order
    allMatches = allMatches.filter((item, index) => allMatches.indexOf(item) === index);

    // Order items by their id according to the order in allMatches
    return items.filter((item) => allMatches.includes(item.id)).sort((a, b) => allMatches.indexOf(a.id) - allMatches.indexOf(b.id));
};

export default itemSearch;
