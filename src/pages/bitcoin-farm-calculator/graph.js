import {
    VictoryAxis,
    VictoryChart,
    VictoryLine,
    VictoryTheme,
    VictoryVoronoiContainer,
} from 'victory';
import { getDurationDisplay } from '../../modules/format-duration';
import { ProduceBitcoinData } from './data';

const { useTranslation } = require('react-i18next');

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
            <VictoryAxis label={t('num graphic cards')} />
            <VictoryAxis label={t('hours')} dependentAxis />
        </VictoryChart>
    );
};

export default BtcGraph;
