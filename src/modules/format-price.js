export default function formatPrice(price, currency = 'RUB') {
    if (typeof price === 'undefined' || isNaN(price)) 
        price = 0;
    
    price = Math.floor(price);

    if (currency === 'USD' || currency === 'dollars') {
        let dollarsString = '';
        
        if (price > 0) {
            dollarsString = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumSignificantDigits: 6,
            }).format(price);
        }
        else {
            dollarsString = '< $1';
        }

        return dollarsString
    }

    if (currency === 'EUR' || currency === 'euros') {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumSignificantDigits: 6,
        }).format(price);
    }

    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumSignificantDigits: 6,
    }).format(price);
};
