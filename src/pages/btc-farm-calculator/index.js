import { useTranslation } from 'react-i18next';
import './index.css';
import { useItemByIdQuery } from '../../features/items/queries';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

import { InputFilter } from '../../components/filter';
import formatPrice from '../../modules/format-price';

import {
    BitcoinItemId,
    GraphicCardItemId,
    MaxNumGraphicsCards,
    MinNumGraphicsCards,
} from './data';
import BtcGraph from './graph';
import ProfitInfo from './profit-info';

const BtcFarmCalculator = () => {
    const { t } = useTranslation();

    const [graphicCardsCount, setGraphicCardsCount] = useStateWithLocalStorage(
        'num-graphic-cards',
        MaxNumGraphicsCards,
    );

    const { data: bitcoinItem } = useItemByIdQuery(BitcoinItemId);
    const { data: graphicCardItem } = useItemByIdQuery(GraphicCardItemId);

    const btcSellPrice = bitcoinItem.sellFor?.[0].price ?? 0;
    const graphicsCardBuyPrice = graphicCardItem.buyFor?.[0].price ?? 0;

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
                    {formatPrice(graphicsCardBuyPrice)}
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
                    {formatPrice(btcSellPrice)}
                </div>
            )}
            <ProfitInfo
                profitForNumCards={[graphicCardsCount, 1, 10, 25, 50]}
            />
            <BtcGraph />
        </div>
    );
};

export default BtcFarmCalculator;
