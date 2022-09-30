import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

import './index.css';
import { useItemByIdQuery } from '../../features/items/queries';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

import { Filter, InputFilter, ToggleFilter } from '../../components/filter';
import formatPrice from '../../modules/format-price';
import Loading from '../../components/loading';
import RewardCell from '../../components/reward-cell';

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
import StationSkillTraderSetting from '../../components/station-skill-trader-setting';

const BitcoinFarmCalculator = () => {
    const { t } = useTranslation();

    const [graphicCardsCount, setGraphicCardsCount] = useStateWithLocalStorage(
        'num-graphic-cards',
        MaxNumGraphicsCards,
    );
    const [calculateWithFuelCost, setCalculateWithFuelCost] =
        useStateWithLocalStorage('btc-farm-calculate-with-fuel-cost', false);
    
    const [calculateWithBuildCost, setCalculateWithBuildCost] =
        useStateWithLocalStorage('btc-farm-calculate-with-build-cost', false);

    const { data: bitcoinItem } = useItemByIdQuery(BitcoinItemId);
    const { data: graphicCardItem } = useItemByIdQuery(GraphicCardItemId);
    const fuelPricePerDay = useFuelPricePerDay();

    if (bitcoinItem.cached || graphicCardItem.cached) {
        return <Loading />;
    }

    const btcSell = getMaxSellFor(bitcoinItem);
    const graphicsCardBuy = getMaxSellFor(graphicCardItem);

    const graphicsCardsList = [1, 10, 25, 50];

    if (!graphicsCardsList.includes(graphicCardsCount)) {
        graphicsCardsList.unshift(graphicCardsCount);
    }

    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Bitcoin Farm Price Calculator')}</title>
            <meta
                name="description"
                content="Escape from Tarkov Bitcoin farm price and profit calculator"
            />
        </Helmet>,
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
                        stateKey={'solar-power'}
                        type="station"
                    />
                    <ToggleFilter
                        label={t('Use fuel cost: {{price}}/day', {
                            price: formatPrice(fuelPricePerDay),
                        })}
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
                key="btc-profit-table"
            />
            <div className="included-items-wrapper" key="btc-item-prices">
                {Boolean(graphicCardItem) && (
                    <RewardCell
                        count={1}
                        iconLink={graphicCardItem.iconLink}
                        itemLink={`/item/${graphicCardItem.normalizedName}`}
                        name={graphicCardItem.name}
                        sellValue={graphicsCardBuy.priceRUB}
                        sellTo={graphicsCardBuy.vendor.name}
                        valueTooltip={t('Purchase cost')}
                        key="gpu-price-display"
                    />
                )}
                {Boolean(bitcoinItem) && (
                    <RewardCell
                        count={1}
                        iconLink={bitcoinItem.iconLink}
                        itemLink={`/item/${bitcoinItem.normalizedName}`}
                        name={bitcoinItem.name}
                        sellValue={btcSell.priceRUB}
                        sellTo={btcSell.vendor.name}
                        key="btc-price-display"
                    />
                )}
            </div>
            {/* <BtcGraph /> */}
        </div>,
    ];
};

export default BitcoinFarmCalculator;
