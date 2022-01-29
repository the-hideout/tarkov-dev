import Fuse from 'fuse.js';

const formatName = (name) => {
    return name
        .toLowerCase()
        .replace(/(\w)\s{1}/g, "$1")
        .trim();
};

const itemSearch = (items, searchString) => {
    let formattedSearchString = formatName(searchString)

    if(!formattedSearchString){
        return items;
    }

    let matches = items.filter(item => formatName(item.shortName) === formattedSearchString);

    // console.log(`Length after shortname ${matches.length}`);

    if(!matches || matches.length === 0){
        // console.log('Checking for name match');
        matches = items.filter(item => formatName(item.name).includes(formattedSearchString));
    }

    if(!matches || matches.length === 0){
        // console.log('Checking for shortName match');
        matches = items.filter(item => formatName(item.shortName).includes(formattedSearchString));
    }

    if(!matches || matches.length === 0){
        // console.log('Doing fuse search');
        const options = {
            includeScore: true,
            keys: ['name'],
            distance: 1000,
        };

        const fuse = new Fuse(items, options);
        const result = fuse.search(formattedSearchString);

        // console.log(result);

        matches = result.map(resultObject => resultObject.item);
    }

    return matches;
};

export default itemSearch;