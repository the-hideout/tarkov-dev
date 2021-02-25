// https://escapefromtarkov.gamepedia.com/Trading#Flea_Market
module.exports = (basePrice, sellPrice, count = 1) => {
    let V0 = basePrice;
    let VR = sellPrice;
    let Ti = 0.05;
    let Tr = 0.05;
    let P0 = Math.log10(V0 / VR);
    let PR = Math.log10(VR / V0);
    let Q = count;

    if(VR < V0){
        P0 = Math.pow(P0, 1.08);
    }

    if(VR >= V0){
        PR = Math.pow(PR, 1.08);
    }

    return Math.ceil(V0 * Ti * Math.pow(4, P0) * Q + VR * Tr * Math.pow(4, PR) * Q);
};
