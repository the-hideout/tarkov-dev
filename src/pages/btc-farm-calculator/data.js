// https://escapefromtarkov.fandom.com/wiki/Hideout
const calculateMSToProduceBTC = (numCards) => {
    return (145000 / (1 + (numCards - 1) * 0.041225)) * 1000;
};

export const MaxNumGraphicsCards = 50;
export const MinNumGraphicsCards = 1;

export const ProduceBitcoinData = {};
for (
    let count = MinNumGraphicsCards;
    count <= MaxNumGraphicsCards;
    count = count + 1
) {
    const msToProduceBTC = calculateMSToProduceBTC(count);
    const hoursToProduceBTC = msToProduceBTC / 60 / 60 / 1000;
    const btcPerHour = 1 / hoursToProduceBTC;

    ProduceBitcoinData[count] = {
        count,
        msToProduceBTC,
        hoursToProduceBTC,
        btcPerHour,
    };
}
