import { useTranslation } from 'react-i18next';
import Select from 'react-select';
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
import BtcGraph from './graph';
import ProfitInfo from './profit-info';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectAllSkills,
    setStationOrTraderLevel,
} from '../../features/settings/settingsSlice';
import { getNumericSelect } from '../settings';
import Tippy from '@tippyjs/react';

const SkillSetting = (props) => {
    const { skillKey } = props;
    const dispatch = useDispatch();
    const skills = useSelector(selectAllSkills);

    const options = getNumericSelect(0, 51);

    return (
        <Tippy placement="top" content={'Hideout Managment'}>
            <div className="trader-level-wrapper">
                <img
                    alt={`${skillKey}-icon`}
                    loading="lazy"
                    src={`${process.env.PUBLIC_URL}/images/${skillKey}-icon.png`}
                />
                <Select
                    defaultValue={options[skills[skillKey]]}
                    options={options}
                    className="basic-multi-select"
                    onChange={(event) => {
                        dispatch(
                            setStationOrTraderLevel({
                                target: skillKey,
                                value: event.value,
                            }),
                        );
                    }}
                    classNamePrefix="select"
                />
            </div>
        </Tippy>
    );
};

const BtcFarmCalculator = () => {
    const { t } = useTranslation();

    const [graphicCardsCount, setGraphicCardsCount] = useStateWithLocalStorage(
        'num-graphic-cards',
        MaxNumGraphicsCards,
    );
    const [calculateWithFuelCost, setCalculateWithFuelCost] =
        useStateWithLocalStorage('btc-farm-calculate-with-fuel-cost', false);
    // move to settings
    const [hasBuiltSolarPower, setHasBuiltSolarPower] =
        useStateWithLocalStorage('btc-farm-calculate-solar-power', false);

    const { data: bitcoinItem } = useItemByIdQuery(BitcoinItemId);
    const { data: graphicCardItem } = useItemByIdQuery(GraphicCardItemId);
    const fuelPricePerDay = useFuelPricePerDay({
        solarPower: hasBuiltSolarPower,
    });

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
            <ToggleFilter
                label={t('Solar Power built')}
                checked={hasBuiltSolarPower}
                onChange={() => setHasBuiltSolarPower((prev) => !prev)}
            />
            <SkillSetting skillKey={'hideout-managment'} />
            <ToggleFilter
                label={t('Use fuel cost, {{price}}/day', {
                    price: formatPrice(fuelPricePerDay),
                })}
                checked={calculateWithFuelCost}
                onChange={() => setCalculateWithFuelCost((prev) => !prev)}
            />

            <ProfitInfo
                fuelPricePerDay={calculateWithFuelCost ? fuelPricePerDay : 0}
                profitForNumCards={[graphicCardsCount, 1, 10, 25, 50]}
            />
            <BtcGraph />
        </div>
    );
};

export default BtcFarmCalculator;
