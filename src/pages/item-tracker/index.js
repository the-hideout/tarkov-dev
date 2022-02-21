import { useMemo, useCallback } from 'react';
import Switch from 'react-switch';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import ItemGrid from '../../components/item-grid';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';
import Traders from '../../data/traders.json';

import quests from '../../data/quests.json';
import { useItemsQuery } from '../../features/items/queries';

function ItemTracker() {
    const [questData, setQuestData] = useStateWithLocalStorage(
        'quests',
        quests.data,
    );
    // const [questData, setQuestData] = useState(quests.data);
    // const [groupByQuest, setGroupByQuest] = useStateWithLocalStorage('groupByQuest', true);
    const [onlyFoundInRaid, setOnlyFoundInRaid] = useStateWithLocalStorage(
        'onlyFoundInRaid',
        true,
    );
    const { data: items } = useItemsQuery();
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
                const questItems = questData.items
                    .map((questItemData) => {
                        if (onlyFoundInRaid && !questItemData.foundInRaid) {
                            return false;
                        }

                        if (questItemData.count <= 0) {
                            return false;
                        }

                        return {
                            ...questItemData,
                            ...items.find(
                                (item) => item.id === questItemData.id,
                            ),
                            onClick: handleItemClick,
                            questId: questData.questId,
                        };
                    })
                    .filter(Boolean);

                if (questItems.length === 0) {
                    return false;
                }

                return (
                    <ItemGrid
                        key={`loot-group-${questData.questId}`}
                        name={questData.name || questData.questId}
                        subtitle={Traders[questData.traderId].locale.en}
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
        t,
    ]);

    return [
        <Helmet>
            <meta charSet="utf-8" />
            <title>Escape from Tarkov item tracker</title>
            <meta
                name="description"
                content="Track what items you need to find in Raid for Escape from Tarkov quests"
            />
        </Helmet>,
        <div
            className="display-wrapper"
            style={{
                backgroundColor: '#000',
                height: 'auto',
            }}
            key={'display-wrapper'}
        >
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
                            {t('Only show Find in Raid')}
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
                        <button onClick={() => setQuestData(quests.data)}>
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
