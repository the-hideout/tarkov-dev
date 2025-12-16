import { VictoryChart, VictoryTheme, VictoryLine, VictoryAxis } from 'victory';

const ProfitableGraph = (props) => {
    const { data } = props;

    return (
        <VictoryChart theme={VictoryTheme.material} height={200}>
            {data.map(({ graphicCardsCount, values }, index) => (
                <VictoryLine key={graphicCardsCount} data={values} />
            ))}
            {data.map(({ profitableDay, graphicCardsCount }) => {
                return (
                    <VictoryAxis
                        axisValue={profitableDay}
                        label={profitableDay}
                        key={graphicCardsCount}
                    />
                );
            })}
        </VictoryChart>
    );
};

export default ProfitableGraph;
