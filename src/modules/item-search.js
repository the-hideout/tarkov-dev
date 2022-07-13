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

    let shortMatches = items.filter(
        (item) => formatName(item.shortName).includes(formattedSearchString),
    ).map((item) => item.id);

    let fullMatches = items.filter(
        (item) => formatName(item.name).includes(formattedSearchString),
    ).map((item) => item.id);

    const fuseOptions = {
        includeScore: true,
        keys: ['name'],
        distance: 1000,
    };

    const fuse = new Fuse(items, fuseOptions);
    const fuseResult = fuse.search(formattedSearchString);

    let fuzzyMatches = fuseResult.map((searchResult) => searchResult.item);

    let allMatches = [...shortMatches, ...fullMatches, ...fuzzyMatches];
    //Remove duplicates from allMatches
    allMatches = allMatches.filter((item, index) => allMatches.indexOf(item) === index);

    //Return items matching ids found in allMatches
    return items.filter((item) => allMatches.includes(item.id));
};

export default itemSearch;
