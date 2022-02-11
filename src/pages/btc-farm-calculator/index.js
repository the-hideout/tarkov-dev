import { useTranslation } from 'react-i18next';
import './index.css';
import { useItemByIdQuery } from '../../features/items/queries';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

import { InputFilter } from '../../components/filter';
import formatPrice from '../../modules/format-price';

import {
    MaxNumGraphicsCards,
    MinNumGraphicsCards,
    ProduceBitcoinData,
} from './data';
import { getDurationDisplay } from '../../modules/format-duration';
import BtcGraph from './graph';
import { useMemo } from 'react';

const BitcoinItemId = '59faff1d86f7746c51718c9c';
const GraphicCardItemId = '57347ca924597744596b4e71';

const BtcFarmCalculator = () => {
    const { t } = useTranslation();

    const [graphicCardsCount, setGraphicCardsCount] = useStateWithLocalStorage(
        'num-graphic-cards',
        MaxNumGraphicsCards,
    );

    const { data: bitcoinItem } = useItemByIdQuery(BitcoinItemId);
    const { data: graphicCardItem } = useItemByIdQuery(GraphicCardItemId);

    const selectedData = ProduceBitcoinData[graphicCardsCount];

    const infoData = useMemo(() => {
        const innerData = [];

        if (selectedData) {
            innerData.push({
                label: t('Bitcoins/h'),
                text: selectedData.btcPerHour.toFixed(3),
            });
            innerData.push({
                label: t('Time to produce 1 bitcoin'),
                text: getDurationDisplay(selectedData.msToProduceBTC),
            });

            if (bitcoinItem) {
                innerData.push({
                    label: t('Estimated profit/h'),
                    text: formatPrice(
                        bitcoinItem.sellFor?.[0].price *
                            selectedData.btcPerHour,
                    ),
                });
                innerData.push({
                    label: t('Estimated profit/day'),
                    text: formatPrice(
                        bitcoinItem.sellFor?.[0].price *
                            selectedData.btcPerHour *
                            24,
                    ),
                });
            }
        }

        return innerData;
    }, [selectedData, t, bitcoinItem]);

    return (
        <div className={'page-wrapper'}>
            <h1>{t('Bitcoin Farm Calculator')}</h1>

            {Boolean(graphicCardItem) && (
                <img
                    alt={graphicCardItem.name}
                    className={'item-image'}
                    loading="lazy"
                    src={graphicCardItem.iconLink}
                />
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

            {infoData.length > 0 && (
                <div>
                    {Boolean(bitcoinItem) && (
                        <img
                            alt={bitcoinItem.name}
                            className={'item-image'}
                            loading="lazy"
                            src={bitcoinItem.iconLink}
                        />
                    )}
                    {infoData.map(({ label, text }) => {
                        return (
                            <div key={label}>
                                {label} {text}
                            </div>
                        );
                    })}
                </div>
            )}

            <BtcGraph />
        </div>
    );
};

export default BtcFarmCalculator;
