import capitalizeTheFirstLetterOfEachWord from './capitalize-first';

const formatCategoryName = (currentCategoryData) => {
    return (
        currentCategoryData.displayName ||
        capitalizeTheFirstLetterOfEachWord(currentCategoryData.urlName).replace(
            /-/g,
            ' ',
        )
    );
};

export default formatCategoryName;
