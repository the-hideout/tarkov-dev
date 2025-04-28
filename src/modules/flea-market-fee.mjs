// https://escapefromtarkov.gamepedia.com/Trading#Flea_Market

const localStorageReadJson = (key, defaultValue) => {
    try {
        const value = localStorage.getItem(key);

        if (typeof value === 'string') {
            return JSON.parse(value);
        }
    } catch (error) {
        /* noop */
    }

    return defaultValue;
};

export default function fleaMarketFee(basePrice, sellPrice, count = 1, Ti = 0.05, Tr = 0.10) {
    let V0 = basePrice;
    let VR = sellPrice;
    //let Ti = 0.05;
    //let Tr = 0.1;
    let P0 = Math.log10(V0 / VR);
    let PR = Math.log10(VR / V0);
    let Q = count;
    let IC = 1;
    const intelligenceCenter = localStorageReadJson('intelligence-center', 3);
    const hideoutManagement = localStorageReadJson('hideout-management', 0);


    if (VR < V0) {
        P0 = Math.pow(P0, 1.08);
    }

    if (VR >= V0) {
        PR = Math.pow(PR, 1.08);
    }

    if (intelligenceCenter >= 3) {
        IC = 1 - (((.01 * hideoutManagement) + 1) * 0.3);
    }

    return Math.ceil(
        V0 * Ti * Math.pow(4, P0) * Q + VR * Tr * Math.pow(4, PR) * Q,
    ) * IC;
};
