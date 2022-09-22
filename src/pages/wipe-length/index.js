import { Helmet } from 'react-helmet';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import DataTable from '../../components/data-table';
import CenterCell from '../../components/center-cell';

import wipeDetailsJson from '../../data/wipe-details.json';

import './index.css';

// number or wipes to use when calculating the average
const CountLastNumWipesForAverage = 6; //Infinity;

const wipeDetails = wipeDetailsJson.map((wipeDetailJson) => {
    return {
        ...wipeDetailJson,
        start: new Date(wipeDetailJson.start),
    };
});

const data = [];
for (let i = 0; i < wipeDetails.length; i += 1) {
    const currentWipe = wipeDetails[i];
    const nextWipe = wipeDetails[i + 1];

    let end;
    let ongoing;
    if (nextWipe) {
        end = nextWipe.start;
        ongoing = false;
    } else {
        end = new Date();
        ongoing = true;
    }

    const lengthDays = Math.floor(
        (end.getTime() - currentWipe.start.getTime()) / (1000 * 60 * 60 * 24),
    );

    const addData = {
        ...currentWipe,
        lengthDays,
        end,
        ongoing,
    };
    data.push(addData);
}

// calculate average wipe length
const calculateAverage = (wipeDatas) => {
    const endedWipes = wipeDatas.filter(({ ongoing }) => !ongoing);
    endedWipes.sort((a, b) => b.start.getTime() - a.start.getTime());
    const calculateUsingWipes = endedWipes.slice(
        0,
        CountLastNumWipesForAverage,
    );

    let sum = 0;
    for (const endedWipe of calculateUsingWipes) {
        sum += endedWipe.lengthDays;
    }
    const average = sum / calculateUsingWipes.length;

    return Math.floor(average);
};

const lengthDaysAverage = calculateAverage(data);

// Add average wipe length to the table
// data.push({
//     name: `Average${
//         Number.isFinite(CountLastNumWipesForAverage)
//             ? ` last ${CountLastNumWipesForAverage} wipes`
//             : ''
//     }`,
//     lengthDays: lengthDaysAverage,
// });

data.reverse();

const WipeLength = (props) => {
    const { t } = useTranslation();

    const columns = useMemo(() => {
        return [
            {
                Header: t('Patch'),
                accessor: 'name',
            },
            {
                Header: t('Wipe start'),
                accessor: ({ start }) => {
                    if (start) {
                        return dayjs(start).format('YYYY-MM-DD');
                    }

                    return '';
                },
                Cell: CenterCell,
                id: 'start',
            },
            {
                Header: t('Wipe end'),
                accessor: ({ end, ongoing }) => {
                    if (ongoing) {
                        return t('Ongoing wipe');
                    }
                    if (end) {
                        return dayjs(end).format('YYYY-MM-DD');
                    }
                    return '';
                },
                Cell: CenterCell,
                id: 'end',
            },
            {
                Header: t('Wipe length'),
                accessor: 'lengthDays',
                Cell: (props) => {
                    const { value } = props;

                    return (
                        <div className="wipe-length-cell">
                            <div className="wipe-length-bar-wrapper">
                                <div
                                    className="wipe-length-bar"
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            (value / lengthDaysAverage) * 100,
                                        )}%`,
                                    }}
                                />
                            </div>
                            {t('{{count}} days', { count: value })}
                        </div>
                    );
                },
            },
        ];
    }, [t]);

    // const graphData = useMemo(() => {
    //   return data.map(({start, lengthDays}) => {
    //     return {
    //       x: dayjs(start).format('YYYY-MM-DD'),
    //       y: lengthDays
    //     }
    //   })
    // }, []);

    return (
        <React.Fragment>
            <Helmet>
                <meta charSet="utf-8" />
                <title>{t('Escape from Tarkov')} - {t('Wipe Length')}</title>
                <meta
                    name="description"
                    content={t('Escape from Tarkov - Wipe Length Statistics')}
                />
            </Helmet>
            <div className={'page-wrapper'}>
                <h1 className="center-title">
                    {t('Escape from Tarkov')} - {t('Wipe Length')}
                </h1>
                <div className="center-title">
                    <h2>Average Wipe Length among last 6 wipes</h2>
                    <p>{t(lengthDaysAverage)} Days 📆</p>
                </div>
                <DataTable
                    columns={columns}
                    data={data}
                    disableSortBy={false}
                />
                {}
            </div>
        </React.Fragment>
    );
};

export default WipeLength;

export function getAverageWipeLength() {
    return lengthDaysAverage;
}

export function getWipeData() {
    return data;
}
