function capitalizeTheFirstLetterOfEachWord(words) {
    if (!words) {
        return words;
    }
    const separateWord = words.toLowerCase().split(" ");

    for (let i = 0; i < separateWord.length; i = i + 1) {
        separateWord[i] = separateWord[i].charAt(0).toUpperCase() + separateWord[i].substring(1);
    }

    return separateWord.join(" ");
}

export default capitalizeTheFirstLetterOfEachWord;
