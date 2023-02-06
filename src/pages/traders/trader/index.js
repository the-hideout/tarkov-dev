import { useCallback, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import useStateWithLocalStorage from '../../../hooks/useStateWithLocalStorage';

import SEO from '../../../components/SEO';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
} from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';
import QuestTable from '../../../components/quest-table';
import TraderResetTime from '../../../components/trader-reset-time';
import ErrorPage from '../../../components/error-page';
import LoadingSmall from '../../../components/loading-small';

import QueueBrowserTask from '../../../modules/queue-browser-task';

import { selectAllTraders, fetchTraders } from '../../../features/traders/tradersSlice';

import i18n from '../../../i18n';

const romanLevels = {
    0: '0',
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
    10: 'X'
};

function Trader() {
    const { traderName } = useParams();
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [selectedTable, setSelectedTable] = useStateWithLocalStorage(
        `${traderName}SelectedTable`,
        'spending',
    );
    //const [showAllTraders, setShowAllTraders] = useState(false);
    const { t } = useTranslation();

    const handleNameFilterChange = useCallback(
        (e) => {
            if (typeof window !== 'undefined') {
                const name = e.target.value.toLowerCase();

                // schedule this for the next loop so that the UI
                // has time to update but we do the filtering as soon as possible
                QueueBrowserTask.task(() => {
                    setNameFilter(name);
                });
            }
        },
        [setNameFilter],
    );
    const dispatch = useDispatch();
    const traders = useSelector(selectAllTraders);
    const tradersStatus = useSelector((state) => {
        return state.traders.status;
    });
    useEffect(() => {
        let timer = false;
        if (tradersStatus === 'idle') {
            dispatch(fetchTraders());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchTraders());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [tradersStatus, dispatch]);
    
    const trader = traders.find(tr => tr.normalizedName === traderName);
    if (!trader) 
        return <ErrorPage />;
    
    let resetTime = (<LoadingSmall/>);
    if (trader.resetTime) {
        resetTime = (
            <TraderResetTime timestamp={trader.resetTime} locale={i18n.language} />
        );
    }
    return [
        <SEO 
            title={`${t('Trader {{trader}}', { trader: trader.name })} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('trader-page-description', 'Get the latest information on the trader {{trader}} in Escape from Tarkov. Learn about the items he sells on certain Loyalty level and how to maximize your cash back money to level Loyalty.', { trader: trader.name })}
            image={`${window.location.origin}${process.env.PUBLIC_URL}/images/traders/${trader.normalizedName}-portrait.png`}
            card='summary_large_image'
            key="seo-wrapper"
        />,
        <div className="page-wrapper" key={'page-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {trader.name}
                    <cite>
                        {resetTime}
                    </cite>
                </h1>
                <Filter center>
                    <ButtonGroupFilter>
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {t('Items with the best cash back prices for leveling when buying from flea')}
                                </>
                            }
                            selected={selectedTable === 'spending'}
                            content={t('Spending')}
                            type="text"
                            onClick={setSelectedTable.bind(undefined, 'spending')}
                        />
                    </ButtonGroupFilter>
                    {trader.normalizedName !== 'fence' ? (
                        <ButtonGroupFilter>
                            {trader.levels.map(level => (
                                <ButtonGroupFilterButton
                                    key={level.level}
                                    tooltipContent={
                                        <>
                                            {t('Unlocks at Loyalty Level {{level}}', { level: level.level})}
                                        </>
                                    }
                                    selected={selectedTable === level.level}
                                    content={romanLevels[level.level]}
                                    onClick={setSelectedTable.bind(undefined, level.level)}
                                />
                            ))}
                        </ButtonGroupFilter>
                    ) : ''}
                    <ButtonGroupFilter>
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {t('Tasks given by {{traderName}}', {traderName: trader.name})}
                                </>
                            }
                            selected={selectedTable === 'tasks'}
                            content={t('Tasks')}
                            type="text"
                            onClick={setSelectedTable.bind(undefined, 'tasks')}
                        />
                    </ButtonGroupFilter>
                    <InputFilter
                        defaultValue={nameFilter}
                        onChange={handleNameFilterChange}
                        placeholder={t('filter on item')}
                    />
                </Filter>
            </div>

            {selectedTable !== 'tasks' && (
                <SmallItemTable
                    nameFilter={nameFilter}
                    traderFilter={traderName}
                    loyaltyLevelFilter={Number.isInteger(selectedTable) ? selectedTable : false}
                    traderBuybackFilter={selectedTable === 'spending' ? true : false}
                    maxItems={selectedTable === 'spending' ? 50 : false}
                    totalTraderPrice={true}
                    traderValue={selectedTable === 'spending' ? 1 : false}
                    fleaPrice={selectedTable === 'spending' ? 2 : 1}
                    traderPrice={selectedTable === 'spending' ? false : 2}
                    traderBuyback={selectedTable === 'spending' ? 3 : false}
                    sortBy={selectedTable === 'spending' ? 'traderBuyback' : null}
                    sortByDesc={true}
                />
            )}
            {selectedTable === 'tasks' && (
                <QuestTable
                    giverFilter={trader.normalizedName}
                    nameFilter={nameFilter}
                    questRequirements={1}
                    minimumLevel={2}
                />
            )}

            <div className="page-wrapper" style={{ minHeight: 0 }}>
                <p>
                    {trader.description}
                </p>
            </div>
        </div>,
    ];
}

export default Trader;
