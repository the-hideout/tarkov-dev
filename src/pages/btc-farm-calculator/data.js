import { useSelector } from 'react-redux';
import { useItemByIdQuery } from '../../features/items/queries';
import { selectAllSkills } from '../../features/settings/settingsSlice';

// https://escapefromtarkov.fandom.com/wiki/Hideout
const calculateMSToProduceBTC = (numCards) => {
    return (145000 / (1 + (numCards - 1) * 0.041225)) * 1000;
};

export const BitcoinItemId = '59faff1d86f7746c51718c9c';
export const GraphicCardItemId = '57347ca924597744596b4e71';

export const MetalFuelTankItemId = '5d1b36a186f7742523398433';
export const ExpeditionaryFuelTankItemId = '5d1b371186f774253763a656';

const FuelDurations = {
    [ExpeditionaryFuelTankItemId]: {
        basePowerDurationMs: 45_473_000,
    },
    [MetalFuelTankItemId]: {
        basePowerDurationMs: 75_789_000,
    },
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
    const btcPerDay = btcPerHour * 24;

    ProduceBitcoinData[count] = {
        count,
        msToProduceBTC,
        hoursToProduceBTC,
        btcPerHour,
        btcPerDay,
    };
}

export const getMaxSellFor = (item) => {
    let max = undefined;
    for (const sf of item.sellFor) {
        if (max === undefined || max.price < sf.price) {
            max = sf;
        }
    }

    return max;
};

export const getMinBuyFor = (item) => {
    let min = undefined;
    for (const sf of item.buyFor) {
        if (min === undefined || min.price > sf.price) {
            min = sf;
        }
    }

    return min;
};

export const useFuelPricePerDay = ({ solarPower = false } = {}) => {
    const skills = useSelector(selectAllSkills);

    const { data: metalFuelTankItem } = useItemByIdQuery(MetalFuelTankItemId);
    const { data: expeditionaryFuelTankItem } = useItemByIdQuery(
        ExpeditionaryFuelTankItemId,
    );

    if (!metalFuelTankItem || !expeditionaryFuelTankItem) {
        return undefined;
    }

    const fuelItem = metalFuelTankItem;

    const fuelBuyFor = getMinBuyFor(fuelItem);
    const durationObj = FuelDurations[fuelItem.id];

    let durationMs = durationObj.basePowerDurationMs;

    // https://escapefromtarkov.fandom.com/wiki/Hideout_management
    // 0.5% per level, but 25% max
    const skillFuelDecreasedConsumptionRate = Math.min(
        0.005 * skills['hideout-managment'],
        0.25,
    );
    durationMs = durationMs / (1 - skillFuelDecreasedConsumptionRate);

    if (solarPower) {
        durationMs = durationMs * 2;
    }

    return (fuelBuyFor.price / durationMs) * 1000 * 60 * 60 * 24;
};
