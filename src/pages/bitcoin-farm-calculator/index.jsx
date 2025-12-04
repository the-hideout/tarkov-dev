import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import useItemsData from '../../features/items/index.js';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';

import SEO from '../../components/SEO.jsx';
import { Filter, InputFilter, ToggleFilter } from '../../components/filter/index.jsx';
import Loading from '../../components/loading/index.jsx';
import RewardCell from '../../components/reward-cell/index.jsx';
import StationSkillTraderSetting from '../../components/station-skill-trader-setting/index.jsx';

import formatPrice from '../../modules/format-price.js';
import { averageWipeLength, currentWipeLength } from '../../modules/wipe-length.js';
import useHideoutData from '../../features/hideout/index.js';

import {
    BitcoinItemId,
    getMaxSellFor,
    getMinBuyFor,
    GraphicCardItemId,
    MaxNumGraphicsCards,
    MinNumGraphicsCards,
    useFuelPricePerDay,
} from './data.js';
// import BtcGraph from './graph';
import ProfitInfo from './profit-info.jsx';

import './index.css';

const BitcoinFarmCalculator = () => {
    const { t } = useTranslation();
    const gameMode = useSelector((state) => state.settings.gameMode);

    const { data: hideout } = useHideoutData();
    const solar = hideout.find(station => station.normalizedName === 'solar-power');

    const [graphicCardsCount, setGraphicCardsCount] = useStateWithLocalStorage(
        'num-graphic-cards',
        MaxNumGraphicsCards,
    );
    const [calculateWithFuelCost, setCalculateWithFuelCost] =
        useStateWithLocalStorage('btc-farm-calculate-with-fuel-cost', false);
    
    const [calculateWithBuildCost, setCalculateWithBuildCost] =
        useStateWithLocalStorage('btc-farm-calculate-with-build-cost', false);

    const [wipeDaysRemaining, setWipeDaysRemaining] = useState(
        Math.max(averageWipeLength() - currentWipeLength(), 0),
    );

    const { data: items } = useItemsData();

    const bitcoinItem = useMemo(() => {
        return items.find(i => i?.id === BitcoinItemId);
    }, [items]);

    const graphicCardItem = useMemo(() => {
        return items.find(i => i.id === GraphicCardItemId);
    }, [items]);

    //const { data: bitcoinItem } = useItemByIdQuery(BitcoinItemId);
    //const { data: graphicCardItem } = useItemByIdQuery(GraphicCardItemId);

    const { price: fuelPricePerDay, item: fuelItem } = useFuelPricePerDay();

    if (!bitcoinItem || bitcoinItem.cached || !graphicCardItem || graphicCardItem.cached) {
        return <Loading />;
    }

    const btcSell = getMaxSellFor(bitcoinItem);
    if (bitcoinItem.priceCustom) {
        btcSell.priceRUB = bitcoinItem.priceCustom;
        btcSell.sellType = 'custom';
    }
    const graphicsCardBuy = getMinBuyFor(graphicCardItem);
    if (graphicCardItem.priceCustom) {
        graphicsCardBuy.priceRUB = graphicCardItem.priceCustom;
        graphicsCardBuy.sellType = 'custom';
    }

    const graphicsCardsList = [1, 10, 25, 50];

    if (!graphicsCardsList.includes(graphicCardsCount)) {
        graphicsCardsList.unshift(graphicCardsCount);
    }

    return [
        <SEO 
            title={`${t('Bitcoin Farm Calculator')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('bitcoin-farm-calculator-page-description', 'This page includes a calculator tool that helps you determine the price of building and maintaining a Bitcoin Farm, based on the number of GPUs, electricity costs, and bitcoin cost.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'} key={'display-wrapper'}>
            <div className="page-headline-wrapper" key="btc-profit-settings">
                <h1>{t('Bitcoin Farm Calculator')}</h1>
                <Filter>
                    <InputFilter
                        label={t('Graphic cards count')}
                        defaultValue={graphicCardsCount?.toString() ?? ''}
                        type="number"
                        onChange={(event) => {
                            const parsed = parseInt(event.target.value, 10);
                            if (Number.isFinite(parsed)) {
                                setGraphicCardsCount(parsed);
                            }
                        }}
                        min={MinNumGraphicsCards}
                        max={MaxNumGraphicsCards}
                    />
                    <StationSkillTraderSetting
                        stateKey={'hideout-management'}
                        type="skill"
                    />
                    <StationSkillTraderSetting
                        stateKey={solar.normalizedName}
                        type="station"
                        image={solar.imageLink}
                    />
                    <ToggleFilter
                        label={t('Use fuel cost: {{price}}/day', {
                            price: formatPrice(fuelPricePerDay),
                        })}
                        tooltipContent={fuelItem?.name}
                        checked={calculateWithFuelCost}
                        onChange={() =>
                            setCalculateWithFuelCost((prev) => !prev)
                        }
                    />
                    <ToggleFilter
                        label={t('Use station build costs')}
                        checked={calculateWithBuildCost}
                        onChange={() =>
                            setCalculateWithBuildCost((prev) => !prev)
                        }
                    />
                </Filter>
            </div>
            <ProfitInfo
                fuelPricePerDay={calculateWithFuelCost ? fuelPricePerDay : 0}
                useBuildCosts={calculateWithBuildCost}
                profitForNumCards={graphicsCardsList}
                wipeDaysRemaining={wipeDaysRemaining}
                gameMode={gameMode}
                key="btc-profit-table"
            />
            <div className="included-items-wrapper" key="btc-item-prices">
                {Boolean(graphicCardItem) && (
                    <RewardCell
                        item={graphicCardItem}
                        sellValue={graphicsCardBuy.priceRUB}
                        sellTo={graphicsCardBuy.vendor?.name}
                        sellType={graphicsCardBuy.sellType}
                        valueTooltip={t('Purchase cost')}
                        key="gpu-price-display"
                    />
                )}
                {Boolean(bitcoinItem) && (
                    <RewardCell
                        item={bitcoinItem}
                        sellValue={btcSell.priceRUB}
                        sellTo={btcSell.vendor.name}
                        sellType={btcSell.sellType}
                        key="btc-price-display"
                    />
                )}
            </div>
            {gameMode !== 'pve' && <div className="included-items-wrapper">
                <label className={'single-filter-wrapper'}>
                    <Link to="/wipe-length">
                        <span className={'single-filter-label'}>{t('Remaining days in wipe:', {remainingWipeDays: averageWipeLength() - currentWipeLength()})}</span>
                    </Link>
                    <input
                        className={'filter-input wipe-days'}
                        defaultValue={wipeDaysRemaining?.toString() ?? ''}
                        type={'number'}
                        onChange={(event) => {
                            const parsed = parseInt(event.target.value, 10);
                            if (Number.isFinite(parsed)) {
                                setWipeDaysRemaining(parsed);
                            }
                        }}
                        min={0}
                    />
                </label>
            </div>}
            {/* <BtcGraph /> */}
        </div>,
    ];
};

export default BitcoinFarmCalculator;
