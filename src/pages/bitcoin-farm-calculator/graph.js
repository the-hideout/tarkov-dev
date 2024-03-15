import {
    VictoryAxis,
    VictoryChart,
    VictoryLine,
    VictoryTheme,
    VictoryVoronoiContainer,
} from 'victory';
import { getDurationDisplay } from '../../modules/format-duration.js';
import { ProduceBitcoinData } from './data.js';

import { useTranslation } from 'react-i18next';

const BtcGraph = () => {
    const { t } = useTranslation();

    return (
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
            <VictoryAxis label={t('Num graphic cards')} />
            <VictoryAxis label={t('Hours')} dependentAxis />
        </VictoryChart>
    );
};

export default BtcGraph;
