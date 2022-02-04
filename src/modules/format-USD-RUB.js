const formatPrice = require('./format-price');

module.exports = (price) => {
    let USD = formatPrice(price / 128, 'USD');
    let RUB = formatPrice(price);
    return USD + ' | ' + RUB;
};
