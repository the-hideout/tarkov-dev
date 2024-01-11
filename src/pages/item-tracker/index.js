import { useMemo, useCallback } from 'react';
import Switch from 'react-switch';
import { useTranslation } from 'react-i18next';

import SEO from '../../components/SEO.jsx';
import ItemGrid from '../../components/item-grid/index.js';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';

//import quests from '../../data/quests.json';
import useItemsData from '../../features/items/index.js';
import useTradersData from '../../features/traders/index.js';
import useQuestsData from '../../features/quests/index.js';

import './index.css';

function ItemTracker() {
    const { data: quests } = useQuestsData();
    const [questData, setQuestData] = useStateWithLocalStorage(
        'quests',
        quests,
    );
    
    // const [questData, setQuestData] = useState(quests.data);
    // const [groupByQuest, setGroupByQuest] = useStateWithLocalStorage('groupByQuest', true);
    const [onlyFoundInRaid, setOnlyFoundInRaid] = useStateWithLocalStorage(
        'onlyFoundInRaid',
        true,
    );
    const { data: items } = useItemsData();
    const { data: traders } = useTradersData();
    const { t } = useTranslation();

    const handleItemClick = useCallback(
        (item, event) => {
            event.preventDefault();

            const questDataCopy = [...questData];
            for (const quest of questDataCopy) {
                if (quest.questId !== item.questId) {
                    continue;
                }

                for (const questItem of quest.items) {
                    if (item.id !== questItem.id) {
                        continue;
                    }

                    questItem.count = questItem.count - 1;
                    break;
                }

                break;
            }

            setQuestData(questDataCopy);
        },
        [questData, setQuestData],
    );

    const handleDoneClick = useCallback(
        (questId, event) => {
            event.preventDefault();

            const questDataCopy = [...questData];
            for (const quest of questDataCopy) {
                if (quest.questId !== questId) {
                    continue;
                }

                for (const questItem of quest.items) {
                    questItem.count = 0;
                }

                break;
            }

            setQuestData(questDataCopy);
        },
        [questData, setQuestData],
    );

    const displayQuests = useMemo(() => {
        return questData
            .sort((itemA, itemB) => {
                if (itemA.name && itemB.name) {
                    return itemA.name
                        .replace(/[^a-zA-Z0-9]/g, '')
                        .localeCompare(itemB.name.replace(/[^a-zA-Z0-9]/g, ''));
                }

                return 0;
            })
            .map((questData) => {
                const questItems = [];
                questData.items.forEach((questItem) => {
                    if (items.length === 0) {
                        return;
                    }

                    const questTemplate = {
                        count: 1,
                        foundInRaid: false,
                        onClick: handleItemClick,
                        questId: questData.questId
                    }
                    if (questItem.__typename === 'TaskObjectiveBuildItem' && !onlyFoundInRaid) {
                        questItems.push({
                            ...items.find(
                                (item) => item.id === questItem.item.id,
                            ),
                            ...questTemplate
                        });
                        for (const part of questItem.containsAll) {
                            questItems.push({
                                ...items.find(
                                    (item) => item.id === part.id,
                                ),
                                ...questTemplate
                            });
                        }
                        return;
                    }
                    if (questItem.__typename === 'TaskObjectiveItem' && !(onlyFoundInRaid && !questItem.foundInRaid)) {
                        questItems.push({
                            ...items.find(
                                (item) => item.id === questItem.item.id,
                            ),
                            count: questItem.count,
                            foundInRaid: questItem.foundInRaid,
                            onClick: handleItemClick,
                            questId: questData.questId
                        });
                        return;
                    }
                    if (questItem.__typename === 'TaskObjectiveMark' && !onlyFoundInRaid) {
                        questItems.push({
                            ...items.find(
                                (item) => item.id === questItem.markerItem.id,
                            ),
                            ...questTemplate
                        });
                        return;
                    }

                    if (!(onlyFoundInRaid && !questItem.foundInRaid)) {
                        questItems.push({
                            ...items.find(
                                (item) => item.id === questItem.id,
                            ),
                            count: questItem.count,
                            foundInRaid: questItem.foundInRaid,
                            onClick: handleItemClick,
                            questId: questData.questId
                        });
                    }
                });

                if (questItems.length === 0) {
                    return false;
                }

                if (traders.length > 0) {
                    let trader = traders.find(trader => trader.normalizedName === questData.traderId);
                    questData.traderName = trader.name || '';
                }

                return (
                    <ItemGrid
                        key={`loot-group-${questData.questId}`}
                        name={questData.name || questData.questId}
                        subtitle={questData.traderName}
                        items={questItems}
                        extraTitleProps={
                            <button
                                onClick={handleDoneClick.bind(
                                    this,
                                    questData.questId,
                                )}
                            >
                                {t('Collected')}
                            </button>
                        }
                    />
                );
            });
    }, [
        onlyFoundInRaid,
        handleItemClick,
        questData,
        handleDoneClick,
        items,
        traders,
        t,
    ]);

    return [
        <SEO 
            title={`${t('Item Tracker')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description="Track what items you need to Found in Raid for Escape from Tarkov quests"
            key="seo-wrapper"
        />,
        <div
            className="display-wrapper item-tracker-wrapper"
            key={'display-wrapper'}
        >
            <h1 className="center-title">
                {t('Escape from Tarkov')} {t('Item Tracker')}
            </h1>
            <div className="item-group-wrapper filter-wrapper">
                <div className={'filter-content-wrapper'}>
                    {/* <label
                        className = {'filter-toggle-wrapper'}
                    >
                        <span
                            className = {'filter-toggle-label'}
                        >
                            Group by quest
                        </span>
                        <Switch
                            className = {'filter-toggle'}
                            onChange = {e => setGroupByQuest(!groupByQuest)}
                            checked = {groupByQuest}
                        />
                    </label> */}
                    <label className={'filter-toggle-wrapper'}>
                        <span className={'filter-toggle-label'}>
                            {t('Only show Found in Raid')}
                        </span>
                        <Switch
                            className={'filter-toggle'}
                            onChange={(e) =>
                                setOnlyFoundInRaid(!onlyFoundInRaid)
                            }
                            checked={onlyFoundInRaid}
                        />
                    </label>
                    <label className={'filter-toggle-wrapper'}>
                        <button onClick={() => setQuestData(quests)}>
                            {t('Reset all tracking')}
                        </button>
                    </label>
                </div>
            </div>
            {displayQuests}
        </div>,
    ];
}

export default ItemTracker;
