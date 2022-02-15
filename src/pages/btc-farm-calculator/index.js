import { useTranslation } from 'react-i18next';
import './index.css';
import { useItemByIdQuery } from '../../features/items/queries';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

import { InputFilter, ToggleFilter } from '../../components/filter';
import formatPrice from '../../modules/format-price';
import Loading from '../../components/loading';

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

const BtcFarmCalculator = () => {
    const { t } = useTranslation();

    const [graphicCardsCount, setGraphicCardsCount] = useStateWithLocalStorage(
        'num-graphic-cards',
        MaxNumGraphicsCards,
    );
    const [calculateWithFuelCost, setCalculateWithFuelCost] =
        useStateWithLocalStorage('btc-farm-calculate-with-fuel-cost', false);

    const { data: bitcoinItem } = useItemByIdQuery(BitcoinItemId);
    const { data: graphicCardItem } = useItemByIdQuery(GraphicCardItemId);
    const fuelPricePerDay = useFuelPricePerDay();

    if (!bitcoinItem || !graphicCardItem) {
        return <Loading />;
    }

    const btcSell = getMaxSellFor(bitcoinItem);
    const graphicsCardBuy = getMaxSellFor(graphicCardItem);

    return (
        <div className={'page-wrapper'}>
            <h1>{t('Bitcoin Farm Calculator')}</h1>

            {Boolean(graphicCardItem) && (
                <div>
                    <img
                        alt={graphicCardItem.name}
                        className={'item-image'}
                        loading="lazy"
                        src={graphicCardItem.iconLink}
                    />
                    {formatPrice(graphicsCardBuy.price)}
                </div>
            )}

            {Boolean(bitcoinItem) && (
                <div>
                    <img
                        alt={bitcoinItem.name}
                        className={'item-image'}
                        loading="lazy"
                        src={bitcoinItem.iconLink}
                    />
                    {formatPrice(btcSell.price)}
                </div>
            )}
            <div className="settings-group-wrapper">
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
                    stateKey={'hideout-managment'}
                    type="skill"
                />
                <StationSkillTraderSetting
                    stateKey={'solar-power'}
                    type="station"
                />
                <ToggleFilter
                    label={t('Use fuel cost, {{price}}/day', {
                        price: formatPrice(fuelPricePerDay),
                    })}
                    checked={calculateWithFuelCost}
                    onChange={() => setCalculateWithFuelCost((prev) => !prev)}
                />
            </div>

            <ProfitInfo
                fuelPricePerDay={calculateWithFuelCost ? fuelPricePerDay : 0}
                profitForNumCards={[graphicCardsCount, 1, 10, 25, 50]}
            />
            {/* <BtcGraph /> */}
        </div>
    );
};

export default BtcFarmCalculator;
