import { useState, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { mdiClipboardList } from '@mdi/js';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';

import SEO from '../../components/SEO.jsx';
import QuestTable from '../../components/quest-table/index.js';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter,
} from '../../components/filter/index.js';

import useTradersData from '../../features/traders/index.js';
import useQuestsData from '../../features/quests/index.js';

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
    const [hideCompleted, setHideCompleted] = useStateWithLocalStorage(
        'hideCompletedTasks',
        false,
    );
    const [hideLocked, setHideLocked] = useStateWithLocalStorage(
        'hideLockedTasks',
        false,
    );
    const [hideNonKappa, setHideNonKappa] = useStateWithLocalStorage(
        'hideNonKappaTasks',
        false,
    );
    const [hideNonLK, setHideNonLK] = useStateWithLocalStorage(
        'hideNonLKTasks',
        false,
    );

    const { data: allTraders } = useTradersData();
    const { data: quests } = useQuestsData();

    const traders = useMemo(() => {
        return allTraders.filter(trader => quests.some(q => q.trader.id === trader.id));
    }, [allTraders, quests]);

    const { t } = useTranslation();

    return [
        <SEO 
            title={`${t('Tasks')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('tasks-page-description', 'Find out everything you need to know about tasks in Escape from Tarkov. Learn about the different types of tasks available in the game, how to complete them, and the rewards you can earn.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'} key="quests-page-wrapper">
            <div className="quests-headline-wrapper" key="quests-headline">
                <h1 className="quests-page-title">
                    <Icon path={mdiClipboardList} size={1.5} className="icon-with-text"/>
                    {t('Tasks')}
                </h1>
                <Filter>
                    <ToggleFilter
                        checked={hideCompleted}
                        label={t('Hide completed')}
                        onChange={(e) => setHideCompleted(!hideCompleted)}
                        tooltipContent={
                            <>
                                {t('Hides completed tasks')}
                            </>
                        }
                    />
                    <ToggleFilter
                        checked={hideLocked}
                        label={t('Hide locked')}
                        onChange={(e) => setHideLocked(!hideLocked)}
                        tooltipContent={
                            <>
                                {t('Hides locked tasks')}
                            </>
                        }
                    />
                    <ToggleFilter
                        checked={hideNonKappa}
                        label={t('Kappa')}
                        onChange={(e) => setHideNonKappa(!hideNonKappa)}
                        tooltipContent={
                            <>
                                {t('Required for Kappa')}
                            </>
                        }
                    />
                    <ToggleFilter
                        checked={hideNonLK}
                        label={t('Lightkeeper')}
                        onChange={(e) => setHideNonLK(!hideNonLK)}
                        tooltipContent={
                            <>
                                {t('Required for Lightkeeper')}
                            </>
                        }
                    />
                    <ButtonGroupFilter>
                        {traders.map((trader) => {
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
                                            src={`${process.env.PUBLIC_URL}/images/traders/${trader.normalizedName}-icon.jpg`}
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
                hideCompleted={hideCompleted}
                hideLocked={hideLocked}
                hideNonKappa={hideNonKappa}
                hideNonLK={hideNonLK}
                giverFilter={selectedTrader}
                nameFilter={nameFilter}
                questRequirements={1}
                minimumLevel={2}
                reputationRewards={3}
                requiredForEndGame={4}
            />

            <div>
                <Trans i18nKey={'quests-page-p'}>
                    <p>
                        Traders in Escape from Tarkov have a number of tasks you can complete.
                    </p>
                    <p>
                        In exchange for retrieving items, eliminating targets, and performing other actions in raid, you can increase your standing with the traders and earn valuable items.
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Quests;
