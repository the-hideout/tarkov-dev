import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { fetchItems, selectAllItems } from '../../features/items/itemsSlice';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

import SEO from '../../components/SEO';
import { Filter, InputFilter, ToggleFilter } from '../../components/filter';
import Loading from '../../components/loading';
import RewardCell from '../../components/reward-cell';
import StationSkillTraderSetting from '../../components/station-skill-trader-setting';

import formatPrice from '../../modules/format-price';
import { averageWipeLength, currentWipeLength } from '../../modules/wipe-length';

import {
    BitcoinItemId,
    getMaxSellFor,
    GraphicCardItemId,
    MaxNumGraphicsCards,
    MinNumGraphicsCards,
    useFuelPricePerDay,
} from './data';
// import BtcGraph from './graph';
import ProfitInfo from './profit-info';

import './index.css';

const BitcoinFarmCalculator = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [graphicCardsCount, setGraphicCardsCount] = useStateWithLocalStorage(
        'num-graphic-cards',
        MaxNumGraphicsCards,
    );
    const [calculateWithFuelCost, setCalculateWithFuelCost] = useStateWithLocalStorage(
        'btc-farm-calculate-with-fuel-cost',
        false,
    );

    const [calculateWithBuildCost, setCalculateWithBuildCost] = useStateWithLocalStorage(
        'btc-farm-calculate-with-build-cost',
        false,
    );

    const [wipeDaysRemaining, setWipeDaysRemaining] = useState(
        Math.max(averageWipeLength() - currentWipeLength(), 0),
    );

    const itemsSelector = useSelector(selectAllItems);
    const itemsStatus = useSelector((state) => {
        return state.items.status;
    });

    useEffect(() => {
        let timer = false;
        if (itemsStatus === 'idle') {
            dispatch(fetchItems());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchItems());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [itemsStatus, dispatch]);

    const bitcoinItem = useMemo(() => {
        return itemsSelector.find((i) => i?.id === BitcoinItemId);
    }, [itemsSelector]);

    const graphicCardItem = useMemo(() => {
        return itemsSelector.find((i) => i.id === GraphicCardItemId);
    }, [itemsSelector]);

    //const { data: bitcoinItem } = useItemByIdQuery(BitcoinItemId);
    //const { data: graphicCardItem } = useItemByIdQuery(GraphicCardItemId);

    const fuelPricePerDay = useFuelPricePerDay();

    if (!bitcoinItem || bitcoinItem.cached || !graphicCardItem || graphicCardItem.cached) {
        return <Loading />;
    }

    const btcSell = getMaxSellFor(bitcoinItem);
    if (bitcoinItem.priceCustom) {
        btcSell.priceRUB = bitcoinItem.priceCustom;
        btcSell.sellType = 'custom';
    }
    const graphicsCardBuy = getMaxSellFor(graphicCardItem);
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
            title={`${t('Bitcoin Farm Calculator')} - ${t('Escape from Tarkov')} - ${t(
                'Tarkov.dev',
            )}`}
            description={t(
                'bitcoin-farm-calculator-page-description',
                'This page includes a calculator tool that helps you determine the price of building and maintaining a Bitcoin Farm, based on the number of GPUs, electricity costs, and bitcoin cost.',
            )}
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
                    <StationSkillTraderSetting stateKey={'hideout-management'} type="skill" />
                    <StationSkillTraderSetting stateKey={'solar-power'} type="station" />
                    <ToggleFilter
                        label={t('Use fuel cost: {{price}}/day', {
                            price: formatPrice(fuelPricePerDay),
                        })}
                        checked={calculateWithFuelCost}
                        onChange={() => setCalculateWithFuelCost((prev) => !prev)}
                    />
                    <ToggleFilter
                        label={t('Use station build costs')}
                        checked={calculateWithBuildCost}
                        onChange={() => setCalculateWithBuildCost((prev) => !prev)}
                    />
                </Filter>
            </div>
            <ProfitInfo
                fuelPricePerDay={calculateWithFuelCost ? fuelPricePerDay : 0}
                useBuildCosts={calculateWithBuildCost}
                profitForNumCards={graphicsCardsList}
                wipeDaysRemaining={wipeDaysRemaining}
                key="btc-profit-table"
            />
            <div className="included-items-wrapper" key="btc-item-prices">
                {Boolean(graphicCardItem) && (
                    <RewardCell
                        item={graphicCardItem}
                        sellValue={graphicsCardBuy.priceRUB}
                        sellTo={graphicsCardBuy.vendor.name}
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
            <div className="included-items-wrapper">
                <label className={'single-filter-wrapper'}>
                    <Link to="/wipe-length">
                        <span className={'single-filter-label'}>
                            {t('Remaining days in wipe:', {
                                remainingWipeDays: averageWipeLength() - currentWipeLength(),
                            })}
                        </span>
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
            </div>
            {/* <BtcGraph /> */}
        </div>,
    ];
};

export default BitcoinFarmCalculator;
