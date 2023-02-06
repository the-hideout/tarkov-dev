import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useItemByIdQuery } from '../../features/items/queries';

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
            <div className="included-items-wrapper">
                <Link to="/wipe-length">
                    <div>{t('Estimated remaining days in wipe: {{remainingWipeDays}}', {remainingWipeDays: averageWipeLength() - currentWipeLength()})}</div>
                </Link>
            </div>
            {/* <BtcGraph /> */}
        </div>,
    ];
};

export default BitcoinFarmCalculator;
