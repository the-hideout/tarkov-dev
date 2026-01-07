import { useMemo } from "react";
import { useSelector } from "react-redux";
import useItemsData from "../../features/items/index.js";
import { selectAllSkills, selectAllStations } from "../../features/settings/settingsSlice.mjs";

// https://escapefromtarkov.fandom.com/wiki/Hideout
const calculateMSToProduceBTC = (numCards, duration = 300000) => {
    return (duration / (1 + (numCards - 1) * 0.041225)) * 1000;
};

export const BitcoinItemId = "59faff1d86f7746c51718c9c";
export const GraphicCardItemId = "57347ca924597744596b4e71";

export const MetalFuelTankItemId = "5d1b36a186f7742523398433";
export const ExpeditionaryFuelTankItemId = "5d1b371186f774253763a656";

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

const createProduceBitcoinData = (duration) => {
    ProduceBitcoinData[duration] = {};
    for (let count = MinNumGraphicsCards; count <= MaxNumGraphicsCards; count = count + 1) {
        const msToProduceBTC = calculateMSToProduceBTC(count, duration);
        const hoursToProduceBTC = msToProduceBTC / 60 / 60 / 1000;
        const btcPerHour = 1 / hoursToProduceBTC;
        const btcPerDay = btcPerHour * 24;

        ProduceBitcoinData[duration][count] = {
            count,
            msToProduceBTC,
            hoursToProduceBTC,
            btcPerHour,
            btcPerDay,
        };
    }
};

export const getAllProduceBitcoinData = (duration) => {
    if (!ProduceBitcoinData[duration]) {
        createProduceBitcoinData(duration);
    }
    return ProduceBitcoinData[duration];
};

export const getMaxSellFor = (item) => {
    let max = undefined;
    for (const sf of item.sellFor) {
        if (max === undefined || max.priceRUB < sf.priceRUB) {
            max = sf;
        }
    }

    return { ...max };
};

export const getMinBuyFor = (item) => {
    let min = undefined;
    for (const sf of item.buyFor) {
        if (min === undefined || min.priceRUB > sf.priceRUB) {
            min = sf;
        }
    }

    return { ...min };
};

const getBestFuelItem = (items) => {
    return items.reduce((best, current) => {
        if (!best) {
            return current;
        }
        const currBuy = getMinBuyFor(current);
        const bestBuy = getMinBuyFor(best);
        if (currBuy.priceRUB / current.properties.units < bestBuy.priceRUB / best.properties.units) {
            return current;
        }
        return best;
    }, false);
};

export const useFuelPricePerDay = () => {
    const skills = useSelector(selectAllSkills);
    const stations = useSelector(selectAllStations);
    const { data: items } = useItemsData();

    const metalFuelTankItem = useMemo(() => {
        return items.find((item) => item.id === MetalFuelTankItemId);
    }, [items]);

    const expeditionaryFuelTankItem = useMemo(() => {
        return items.find((item) => item.id === ExpeditionaryFuelTankItemId);
    }, [items]);

    if (!metalFuelTankItem?.buyFor.length || !expeditionaryFuelTankItem?.buyFor.length) {
        return {
            price: undefined,
            item: undefined,
        };
    }

    const fuelItem = getBestFuelItem([metalFuelTankItem, expeditionaryFuelTankItem]);

    const fuelBuyFor = getMinBuyFor(fuelItem);
    const durationObj = FuelDurations[fuelItem.id];

    let durationMs = durationObj.basePowerDurationMs;

    // https://escapefromtarkov.fandom.com/wiki/Hideout_management
    // 0.5% per level, but 25% max
    const skillFuelDecreasedConsumptionRate = Math.min(0.005 * skills["hideout-management"], 0.25);
    durationMs = durationMs / (1 - skillFuelDecreasedConsumptionRate);

    if (stations["solar-power"] === 1) {
        durationMs = durationMs * 2;
    }

    return {
        price: (fuelBuyFor?.priceRUB / durationMs) * 1000 * 60 * 60 * 24,
        item: fuelItem,
    };
};
