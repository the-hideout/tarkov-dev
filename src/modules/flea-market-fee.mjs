import { localStorageReadJson, localStorageReadJsonGameMode } from '../features/settings/settingsSlice.mjs';

// https://escapefromtarkov.gamepedia.com/Trading#Flea_Market

export default function fleaMarketFee(basePrice, sellPrice, options = {}) {
    const count = options.count ?? 1;
    const intelligenceCenter = options.intelligenceCenter ?? localStorageReadJsonGameMode('intelligence-center', 3);
    const hideoutManagement = options.hideoutManagement ?? localStorageReadJsonGameMode('hideout-management', 0);
    const Ti = options.Ti ?? localStorageReadJson('Ti', 0.03);
    const Tr = options.Tr ?? localStorageReadJson('Tr', 0.03);
    let V0 = basePrice;
    let VR = sellPrice;
    //let Ti = 0.05;
    //let Tr = 0.1;
    let P0 = Math.log10(V0 / VR);
    let PR = Math.log10(VR / V0);
    let Q = count;
    let IC = 1;


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
