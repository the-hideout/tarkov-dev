import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Icon from '@mdi/react';
import { mdiClipboardCheck, mdiClipboardRemove } from '@mdi/js';

import DataTable from '../data-table';
import QuestItemsCell from './quest-items-cell';
import CenterCell from '../center-cell';
import { selectQuests, fetchQuests } from '../../features/quests/questsSlice';
import { useItemsQuery } from '../../features/items/queries';
import { useTradersQuery } from '../../features/traders/queries';

import './index.css';

export function getRequiredQuestItems(quest, itemFilter = false) {
    const requiredItems = [];
    const addItem = (item, count = 1, foundInRaid = false) => {
        if (itemFilter && item.id !== itemFilter) {
            return;
        }
        let req = requiredItems.find(reqItem => reqItem.item.id === item.id);
        if (!req) {
            req = {
                item: item,
                count: 0,
                foundInRaid: foundInRaid
            };
            requiredItems.push(req);
        }
        req.count += count;
    };
    quest.objectives.forEach((objectiveData) => {
        if (objectiveData.item?.id && objectiveData.type !== 'findItem') {
            addItem(objectiveData.item, objectiveData.count || 1, objectiveData.foundInRaid);
        }
        if (objectiveData.markerItem?.id) {
            addItem(objectiveData.markerItem);
        }
        objectiveData.containsAll?.forEach(part => {
            addItem(part);
        });
        if (objectiveData.usingWeapon?.length === 1) {
            objectiveData.usingWeapon?.forEach(item => {
                addItem(item);
            });
        }
        if (objectiveData.usingWeaponMods?.length === 1) {
            objectiveData.usingWeaponMods[0].forEach(item => {
                addItem(item);
            });
        } else if (objectiveData.usingWeaponMods?.length) {
            let requiredCount = {};
            objectiveData.usingWeaponMods?.forEach(modSet => {
                modSet.forEach(item => {
                    if (!requiredCount[item.id]) {
                        requiredCount[item.id] = 0;
                    }
                    requiredCount[item.id]++;
                });
            });
            for (const id of Object.keys(requiredCount)) {
                if (requiredCount[id] === objectiveData.usingWeaponMods.length) {
                    addItem(objectiveData.usingWeaponMods[0].find(mod => mod.id === id));
                }
            }
        }
        if (objectiveData.wearing?.length === 1) {
            objectiveData.wearing?.forEach(outfit => {
                outfit.forEach(item => {
                    addItem(item);
                });
            });
        } else if (objectiveData.wearing?.length) {
            let requiredCount = {};
            objectiveData.wearing?.forEach(outfit => {
                outfit.forEach(item => {
                    if (!requiredCount[item.id]) {
                        requiredCount[item.id] = 0;
                    }
                    requiredCount[item.id]++;
                });
            });
            for (const id of Object.keys(requiredCount)) {
                if (requiredCount[id] === objectiveData.wearing.length) {
                    addItem(objectiveData.wearing[0].find(item => item.id === id));
                }
            }
        }
    });

    quest.neededKeys?.forEach(taskKey => {
        taskKey.keys.forEach(key => {
            addItem(key);
        });
    });

    return requiredItems;
}

const rewardTypes = ['startRewards', 'finishRewards'];

export function getRewardQuestItems(quest, itemFilter = false) {
    const rewardItems = [];
    const addItem = (item, count = 1, rewardType) => {
        if (itemFilter) {
            let passed = item.id === itemFilter;
            if (!passed && item.containsItems) {
                for (const contained of item.containsItems) {
                    if (contained.item.id === itemFilter) {
                        passed = true;
                        break;
                    }
                }
            }
            if (!passed) {
                return;
            }
        }
        let rew = rewardItems.find(rewItem => rewItem.item.id === item.id);
        if (!rew) {
            rew = {
                item: item,
                count: 0,
                rewardType: rewardType
            };
            rewardItems.push(rew);
        }
        rew.count += count;
    };
    rewardTypes.forEach(rewardType => {
        quest[rewardType].items.forEach(contained => {
            addItem(contained.item, contained.count, rewardType);
        });
    });

    return rewardItems;
}

function QuestTable({
    giverFilter,
    nameFilter,
    requiredItemFilter,
    rewardItemFilter,
    hideBorders,
    hideCompleted,
    hideLocked,
    questRequirements,
    minimumLevel,
    minimumTraderLevel,
    requiredItems,
    rewardItems,
 }) {
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings);

    const result = useItemsQuery();
    const items = result.data;

    const tradersResult = useTradersQuery();
    const traders = useMemo(() => {
        return tradersResult.data;
    }, [tradersResult]);
    
    const dispatch = useDispatch();
    const quests = useSelector(selectQuests);
    const questsStatus = useSelector((state) => {
        return state.quests.status;
    });

    useEffect(() => {
        let timer = false;
        if (questsStatus === 'idle') {
            dispatch(fetchQuests());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchQuests());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [questsStatus, dispatch]);

    const allQuestData = useMemo(() => {
        return quests.map(rawQuest => {
            const questData = {
                ...rawQuest,
                requiredItems: [],
                rewardItems: [],
            };

            if (requiredItemFilter || requiredItems) {
                questData.requiredItems = getRequiredQuestItems(rawQuest, requiredItemFilter).map(req => {
                    return {
                        ...req,
                        item: items.find(i => i.id === req.item.id)
                    };
                });
                if (requiredItemFilter && questData.requiredItems.length === 0) {
                    return false;
                }
            }

            if (rewardItemFilter || rewardItems) {
                questData.rewardItems = getRewardQuestItems(rawQuest, rewardItemFilter).map(rew => {
                    const contained = rew.item.containsItems;
                    const mapped = {
                        ...rew,
                        item: items.find(i => i.id === rew.item.id),
                    };
                    mapped.item.containsItems = contained;
                    return mapped;
                });
                if (rewardItemFilter && questData.rewardItems.length === 0) {
                    return false;
                }
            }

            if (giverFilter && giverFilter !== 'all') {
                if (questData.trader.normalizedName !== giverFilter) {
                    return false;
                }
            }

            if (nameFilter && !questData.name.toLowerCase().includes(nameFilter.toLowerCase())) {
                return false
            }

            return questData;
        }).filter(Boolean);
    }, [
        quests, 
        items,
        giverFilter,
        nameFilter,
        requiredItemFilter,
        rewardItemFilter,
        requiredItems,
        rewardItems,
    ]);

    const shownQuests = useMemo(() => {
        return allQuestData.filter(quest => {
            if (!hideCompleted && !hideLocked) {
                return true;
            }

            let completedPassed = true;
            if (hideCompleted) {
                completedPassed = !settings.completedQuests.some(stringId => parseInt(stringId) === quest.tarkovDataId);
            }

            let lockedPassed = true;
            if (hideLocked) {
                for (const req of quest.traderLevelRequirements) {
                    const trader = traders.find(t => t.id === req.trader.id);
                    if (settings[trader.normalizedName] < req.level) {
                        lockedPassed = false;
                        break;
                    }
                }
                for (const req of quest.taskRequirements) {
                    const questReq = allQuestData.find(q => q.id === req.task.id);
                    if (req.status.includes('complete')) {
                        const isComplete = settings.completedQuests.some(stringId => parseInt(stringId) === questReq.tarkovDataId);
                        if (!isComplete) {
                            lockedPassed = false;
                            break;
                        }
                    }
                }
            }

            return completedPassed && lockedPassed;
        });
    }, [
        settings,
        allQuestData,
        traders,
        hideCompleted,
        hideLocked,
    ]);

    const columns = useMemo(() => {
        const useColumns = [
            {
                Header: t('Task'),
                accessor: 'name',
                Cell: (props) => {
                    const questData = props.row.original;
                    let completedIcon = '';
                    if (settings.completedQuests.includes(String(questData.tarkovDataId))) {
                        completedIcon = (
                            <Icon
                                path={mdiClipboardCheck}
                                size={1}
                                className="icon-with-text"
                            />
                        );
                    }
                    return (
                        <div className="quest-link-wrapper">
                            <Link
                                to={`/traders/${questData.trader.normalizedName}`}
                            >
                                <img
                                    alt={questData.trader.name}
                                    loading="lazy"
                                    className="quest-giver-image"
                                    src={`${process.env.PUBLIC_URL}/images/${questData.trader.normalizedName}-icon.jpg`}
                                />
                            </Link>
                            <Link
                                to={`/task/${questData.normalizedName}`}
                            >
                                {questData.name} {questData.factionName !== 'Any' ? ` (${questData.factionName})` : ''}
                            </Link>
                            {completedIcon}
                        </div>
                    );
                },
            }
        ];

        if (requiredItems) {
            useColumns.push({
                Header: t('Required items'),
                accessor: (quest) => {
                    return quest.requiredItems[0]?.item.name;
                },
                Cell: (props) => {
                    const questData = props.row.original;
                    return (
                        <QuestItemsCell
                            questItems={questData.requiredItems}
                        />
                    );
                },
                position: requiredItems,
            });
        }

        if (rewardItems) {
            useColumns.push({
                Header: t('Reward items'),
                accessor: (quest) => {
                    return quest.rewardItems[0]?.item.name;
                },
                Cell: (props) => {
                    const questData = props.row.original;
                    return (
                        <QuestItemsCell
                            questItems={questData.rewardItems}
                        />
                    );
                },
                position: rewardItems,
            });
        }

        if (questRequirements) {
            useColumns.push({
                Header: t('Required tasks'),
                accessor: (questData) => {
                    return quests.find(quest => quest.id === questData.taskRequirements[0]?.task.id)?.name;
                },
                Cell: (props) => {
                    const questData = props.row.original;
                    return questData.taskRequirements.map(req => {
                        const reqQuest = quests.find(quest => quest.id === req.task.id);
                        let completedIcon = '';
                        if (req.status.includes('complete') && settings.completedQuests.includes(String(questData.tarkovDataId))) {
                            completedIcon = (
                                <Icon
                                    path={mdiClipboardCheck}
                                    size={0.75}
                                    className="icon-with-text"
                                />
                            );
                        }
                        if (req.status.length === 1 && req.status[0] === 'active' && settings.completedQuests.includes(String(questData.tarkovDataId))) {
                            completedIcon = (
                                <Icon
                                    path={mdiClipboardRemove}
                                    size={0.75}
                                    className="icon-with-text"
                                />
                            );
                        }
                        return (
                            <div key={`quest-req-${req.task.id}`}>
                                <Link
                                    to={`/task/${reqQuest.normalizedName}`}
                                >
                                    {reqQuest.name}{reqQuest.factionName !== 'Any' ? ` (${reqQuest.factionName})` : ''}
                                </Link>
                                <span>
                                    {`: ${req.status.map(status => t(status)).join(', ')}`}
                                    {completedIcon}
                                </span>
                            </div>
                        );
                    });
                },
                position: rewardItems,
            });
        }

        if (minimumLevel) {
            useColumns.push({
                Header: t('Minimum level'),
                accessor: 'minPlayerLevel',
                Cell: CenterCell,
                position: minimumLevel,
            });
        }

        if (minimumTraderLevel) {
            useColumns.push({
                Header: t('Minimum trader level'),
                accessor: (questData) => {
                    return questData.traderLevelRequirements[0]?.level;
                },
                Cell: (props) => {
                    return (
                        <CenterCell value ={props.row.original.traderLevelRequirements.map(req => req.level).join(', ')}/>
                    );
                },
                position: minimumTraderLevel,
            });
        }

        const claimedPositions = [];
        for (let i = 1; i < useColumns.length; i++) {
            const column = useColumns[i];
            if (Number.isInteger(column.position)) {
                let position = parseInt(column.position);
                if (position < 1) {
                    position = 1;
                }
                if (position >= useColumns.length) {
                    position = useColumns.length-1;
                }
                if (position !== i && !claimedPositions.includes(position)) {
                    //console.log(`Moving ${column.Header} from ${i} to ${position}`);
                    claimedPositions.push(position);
                    useColumns.splice(i, 1);
                    useColumns.splice(position, 0, column);
                    i = 1;
                } else if (position !== i && claimedPositions.includes(position)) {
                    //console.warn(`Warning: ${column.Header} wants position ${position}, but that position has already been claimed by ${useColumns[position].Header}`);
                }
            }
        }

        return useColumns;
    }, [
        t,
        settings,
        quests,
        questRequirements,
        minimumLevel,
        minimumTraderLevel,
        requiredItems,
        rewardItems,
    ]);

    let extraRow = false;

    if (allQuestData.length <= 0) {
        extraRow = t('No quests found');
    } else if (allQuestData.length !== shownQuests.length) {
        extraRow = (
            <>
                {t('Some completed quests hidden by ')}<Link to="/settings/">{t('your settings')}</Link>
            </>
        );
    }

    return (
        <DataTable
            className={`quest-table ${hideBorders ? 'no-borders' : ''}`}
            columns={columns}
            extraRow={extraRow}
            key="small-item-table"
            data={shownQuests}
            autoResetSortBy={false}
        />
    );
}

export default QuestTable;
