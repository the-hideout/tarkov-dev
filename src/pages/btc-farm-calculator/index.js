import { useTranslation } from 'react-i18next';
import './index.css';
import { useItemByIdQuery } from '../../features/items/queries';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

import { InputFilter } from '../../components/filter';
import {
    VictoryAxis,
    VictoryChart,
    VictoryLine,
    VictoryTheme,
    VictoryVoronoiContainer,
} from 'victory';
import formatPrice from '../../modules/format-price';

import { getDurationDisplay } from '../../modules/format-duration';

const BitcoinItemId = '59faff1d86f7746c51718c9c';
const GraphicCardItemId = '57347ca924597744596b4e71';
const MaxNumGraphicsCards = 50;
const MinNumGraphicsCards = 1;

const calculateMSToProduceBTC = (numCards) => {
    return (145000 / (1 + (numCards - 1) * 0.041225)) * 1000;
};


const ProduceBitcoinData = {};
for (
    let count = MinNumGraphicsCards;
    count <= MaxNumGraphicsCards;
    count = count + 1
) {
    const msToProduceBTC = calculateMSToProduceBTC(count);
    const hoursToProduceBTC = msToProduceBTC / 60 / 60 / 1000;
    const btcPerHour = 1 / hoursToProduceBTC;

    ProduceBitcoinData[count] = {
        count,
        msToProduceBTC,
        hoursToProduceBTC,
        btcPerHour,
    };
}

const BtcFarmCalculator = () => {
    const { t } = useTranslation();

    const [graphicCardsCount, setGraphicCardsCount] = useStateWithLocalStorage(
        'num-graphic-cards',
        MaxNumGraphicsCards,
    );

    const { data: bitcoinItem } = useItemByIdQuery(BitcoinItemId);
    const { data: graphicCardItem } = useItemByIdQuery(GraphicCardItemId);

    console.log({ bitcoinItem, graphicCardsCount, graphicCardItem });

    const selectedData = ProduceBitcoinData[graphicCardsCount];

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
                        setGraphicCardsCount(parseInt(event.target.value, 10));
                    }
                }}
                min={MinNumGraphicsCards}
                max={MaxNumGraphicsCards}
            />

            {Boolean(selectedData) && (
                <div>
                    {Boolean(bitcoinItem) && (
                        <img
                            alt={bitcoinItem.name}
                            className={'item-image'}
                            loading="lazy"
                            src={bitcoinItem.iconLink}
                        />
                    )}
                    <div>
                        {t(
                            'Bitcoins per hour {{time, number(minimumFractionDigits: 2)}}',
                            {
                                time: selectedData.btcPerHour,
                            },
                        )}
                    </div>
                    <div>
                        {t(
                            'Time to produce {{count}} bitcoin {{durationStr}}',
                            {
                                count: 1,
                                durationStr: getDurationDisplay(
                                    selectedData.msToProduceBTC,
                                ),
                            },
                        )}
                    </div>
                    {Boolean(bitcoinItem) && (
                        <>
                            <div>
                                {t('Profit per hour (not counting fuel)')}{' '}
                                {formatPrice(
                                    bitcoinItem.sellFor?.[0].price *
                                        selectedData.btcPerHour,
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            <VictoryChart
                theme={VictoryTheme.material}
                height={200}
                containerComponent={
                    <VictoryVoronoiContainer
                        labels={({ datum }) =>
                            `${datum.count}: ${getDurationDisplay(
                                datum.msToProduceBTC,
                            )}`
                        }
                    />
                }
            >
                <VictoryLine
                    data={Object.values(ProduceBitcoinData)}
                    x="count"
                    y="hoursToProduceBTC"
                />
                <VictoryAxis label={t('num graphic cards')} />
                <VictoryAxis label={t('hours')} dependentAxis />
            </VictoryChart>
        </div>
    );
};

export default BtcFarmCalculator;
