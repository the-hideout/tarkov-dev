module.exports = (price, currency = 'RUB') => {
    price = Math.floor(price);

    if(currency === 'USD'){
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumSignificantDigits: 6,
        }).format(Math.floor(price));
    }

    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumSignificantDigits: 6,
    }).format(price);
};
