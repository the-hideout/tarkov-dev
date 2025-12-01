import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import SEO from '../../components/SEO.jsx';
import DataTable from '../../components/data-table/index.js';
import CenterCell from '../../components/center-cell/index.js';

import { averageWipeLength, wipeDetails } from '../../modules/wipe-length.js';

import './index.css';

const lengthDaysAverage = averageWipeLength();

const data = wipeDetails();

const WipeLength = (props) => {
    const { t } = useTranslation();

    const columns = useMemo(() => {
        return [
            {
                Header: t('Patch'),
                id: 'name',
                accessor: 'name',
            },
            {
                Header: t('Wipe start'),
                id: 'start',
                accessor: ({ start }) => {
                    if (start) {
                        return dayjs(start).format('YYYY-MM-DD');
                    }

                    return '';
                },
                Cell: CenterCell,
            },
            {
                Header: t('Wipe end'),
                id: 'end',
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
            },
            {
                Header: t('Wipe length'),
                id: 'wipeLength',
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
        <SEO 
            title={`${t('Wipe Length')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('wipe-length-description', 'Get the latest information on the average wipe length in Escape from Tarkov. Find out how long wipes typically last, and prepare for the next wipe.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'}>
            <h1 className="center-title">
                {t('Escape from Tarkov')} - {t('Wipe Length')}
            </h1>
            <div className="center-title">
                <h3>{t('Average Wipe Length among last 6 wipes:')}</h3>
                <h2>{t('{{count}} days', { count: lengthDaysAverage })} 📆</h2>
            </div>
            <DataTable
                key="wipe-length-table"
                columns={columns}
                data={data}
                disableSortBy={false}
                sortBy={'start'}
                sortByDesc={true}
            />
            {}
        </div>
    );
};

export default WipeLength;

export function getAverageWipeLength() {
    return lengthDaysAverage;
}

export function getWipeData() {
    return data;
}
