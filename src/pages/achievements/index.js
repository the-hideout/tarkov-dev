import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { mdiTrophy, mdiCheckboxMarked, mdiCheckboxBlank } from '@mdi/js';

import SEO from '../../components/SEO.jsx';

import DataTable from '../../components/data-table/index.js';

import useAchievementsData from '../../features/achievements/index.js';

import './index.css';

const raritySort = {
    "common": 0,
    "rare": 1,
    "legendary": 2
}

function Achievements() {
    const { t } = useTranslation();

    const { data: achievements } = useAchievementsData();

    const tableData = useMemo(() => {
        return achievements || [];
    }, [achievements]);

    const columns = useMemo(
        () => [
            {
                Header: () => (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('Name')}
                    </div>),
                id: 'name',
                accessor: 'name',
            },
            {
                Header: () => (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('Description')}
                    </div>),
                id: 'description',
                accessor: 'description',
            },
            {
                Header: t('Hidden'),
                id: 'hidden',
                accessor: 'hidden',
                Cell: (props) => {
                    return (
                        <Icon path={props.value ? mdiCheckboxMarked : mdiCheckboxBlank } size={1.5} className="icon-with-text"/>
                    );
                },
                sortType: (rowA, rowB) => {
                    let rowAhidden = rowA.original.hidden ? 1 : 0
                    let rowBhidden = rowB.original.hidden ? 1 : 0
                    if (rowAhidden === rowBhidden) {
                        return rowB.original.playersCompletedPercent - rowA.original.playersCompletedPercent
                    }
                    return rowAhidden - rowBhidden;
                },
            },
            {
                Header: t('Player %'),
                id: 'playersCompletedPercent',
                accessor: 'playersCompletedPercent',
                Cell: (props) => {
                    return (
                        <div className="center-content">
                            {props.value}%
                        </div>
                    );
                },
            },
            {
                Header: t('Rarity'),
                id: 'rarity',
                accessor: 'rarity',
                Cell: (props) => {
                    return (
                        <div className={`center-content ${props.row.original.normalizedRarity}`}>
                            {props.value}
                        </div>
                    );
                },
                sortType: (rowA, rowB) => {
                    let rowAr = raritySort[rowA.original.normalizedRarity];
                    let rowBr = raritySort[rowB.original.normalizedRarity];
                    if (rowAr === rowBr) {
                        return rowB.original.playersCompletedPercent - rowA.original.playersCompletedPercent
                    }
                    return rowAr - rowBr;
                },
            }
        ],
        [t],
    );

    return [
        <SEO 
            title={`${t('Achievements')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('achievements-page-description', 'This page includes information on the achievements that can be earned.')}
            key="seo-wrapper"
        />,
        <div className="page-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiTrophy} size={1.5} className="icon-with-text"/>
                    {t('Achievements')}
                </h1>
            </div>
            <DataTable
                key="achievements-table"
                columns={columns}
                data={tableData}
            />
        </div>,
    ];
}

export default Achievements;
