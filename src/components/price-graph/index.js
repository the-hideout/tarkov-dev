import { useQuery } from 'react-query';
import {
    VictoryChart,
    VictoryLine,
    VictoryTheme,
    // VictoryAxis,
    // VictoryTooltip,
    VictoryVoronoiContainer,
} from 'victory';

import formatPrice from '../../modules/format-price';

import './index.css';

function PriceGraph({ itemId }) {
    const { status, data } = useQuery(
        `historical-price-${itemId}`,
        () =>
            fetch('https://api.tarkov.dev/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: dataQuery,
            }).then((response) => response.json()),
        {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        },
    );
    let height = VictoryTheme.material.height;

    if (window.innerWidth < 760) {
        height = 1280;
    }

    const dataQuery = JSON.stringify({
        query: `{
        historicalItemPrices(id:"${itemId}"){
            price
            timestamp
        }
    }`,
    });

    if (status !== 'success') {
        return null;
    }

    if (status === 'success' && data.data.historicalItemPrices.length === 0) {
        return 'No data';
    }

    let max = 0;

    data.data.historicalItemPrices.map((price) => {
        if (price.price > max) {
            max = price.price;
        }

        return true;
    });

    return (
        <div className="price-history-wrapper">
            <VictoryChart
                height={height}
                width={1280}
                padding={{ top: 20, left: 15, right: -100, bottom: 30 }}
                minDomain={{ y: 0 }}
                maxDomain={{ y: max + max * 0.1 }}
                theme={VictoryTheme.material}
                containerComponent={
                    <VictoryVoronoiContainer
                        labels={({ datum }) => `${formatPrice(datum.y)}`}
                    />
                }
            >
                <VictoryLine
                    padding={{ right: -120 }}
                    scale={{
                        x: 'time',
                        y: 'linear',
                    }}
                    style={{
                        data: { stroke: '#c43a31' },
                        parent: { border: '1px solid #ccc' },
                    }}
                    data={data.data.historicalItemPrices.map((pricePoint) => {
                        return {
                            x: new Date(Number(pricePoint.timestamp)),
                            y: pricePoint.price,
                        };
                    })}
                />
            </VictoryChart>
        </div>
    );
}

export default PriceGraph;
