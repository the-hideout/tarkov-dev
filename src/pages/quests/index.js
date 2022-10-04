import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiClipboardList } from '@mdi/js';

import QuestTable from '../../components/quest-table';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter,
} from '../../components/filter';

import { selectAllTraders, fetchTraders } from '../../features/traders/tradersSlice';

import './index.css';

function Quests() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [selectedTrader, setSelectedTrader] = useStateWithLocalStorage(
        'selectedTrader',
        'all',
    );
    const [showAll, setShowAll] = useStateWithLocalStorage(
        'showAllBarters',
        false,
    );

    const dispatch = useDispatch();
    const allTraders = useSelector(selectAllTraders);
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

    const { t } = useTranslation();

    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Tasks')}</title>
            <meta name="description" content="Tasks" />
        </Helmet>,
        <div className={'page-wrapper'} key="quests-page-wrapper">
            <div className="quests-headline-wrapper" key="quests-headline">
                <h1 className="quests-page-title">
                    <Icon path={mdiClipboardList} size={1.5} className="icon-with-text"/>
                    {t('Tasks')}
                </h1>
                <Filter>
                    <ToggleFilter
                        checked={showAll}
                        label={t('Show completed')}
                        onChange={(e) => setShowAll(!showAll)}
                        tooltipContent={
                            <>
                                {t('Shows all tasks')}
                            </>
                        }
                    />
                    <ButtonGroupFilter>
                        {allTraders.map((trader) => {
                            return (
                                <ButtonGroupFilterButton
                                    key={`trader-tooltip-${trader.normalizedName}`}
                                    tooltipContent={
                                        <>
                                            {trader.name}
                                        </>
                                    }
                                    selected={trader.normalizedName === selectedTrader}
                                    content={
                                        <img
                                            alt={trader.name}
                                            loading="lazy"
                                            title={trader.name}
                                            src={`${process.env.PUBLIC_URL}/images/${trader.normalizedName}-icon.jpg`}
                                        />
                                    }
                                    onClick={setSelectedTrader.bind(
                                        undefined,
                                        trader.normalizedName)}
                                />
                            );
                        })}
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {t('Show all tasks')}
                                </>
                            }
                            selected={selectedTrader === 'all'}
                            content={t('All')}
                            onClick={setSelectedTrader.bind(undefined, 'all')}
                        />
                    </ButtonGroupFilter>
                    <InputFilter
                        defaultValue={nameFilter || ''}
                        label={t('Name filter')}
                        type={'text'}
                        placeholder={t('filter on task name')}
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
                </Filter>
            </div>

            <QuestTable
                showCompleted={showAll}
                giverFilter={selectedTrader}
                nameFilter={nameFilter}
                questRequirements={1}
                minimumLevel={2}
            />

            <div>
                <p>
                    {"Traders in Escape from Tarkov have a number of tasks you can complete."}
                </p>
                <p>
                    {"In exchange for retrieving items, eliminating targets, and performing other actions in raid, you can increase your standing with the traders and earn valuable items."}
                </p>
            </div>
        </div>,
    ];
}

export default Quests;
