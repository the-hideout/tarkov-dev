const CURRENCY_MULTIPLIER = {
    RUB: 1,
    USD: 124,
    EUR: 147,
};

const getRublePrice = (itemPrice, currency) => {
    if(!CURRENCY_MULTIPLIER[currency]){
        return itemPrice;
    }

    return itemPrice * CURRENCY_MULTIPLIER[currency];
};

export default getRublePrice;