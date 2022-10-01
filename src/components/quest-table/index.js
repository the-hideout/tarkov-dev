import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import DataTable from '../data-table';
import QuestItemsCell from './quest-items-cell';
import { selectQuests, fetchQuests } from '../../features/quests/questsSlice';
import { useItemsQuery } from '../../features/items/queries';

import './index.css';

export function getRequiredQuestItems(quest) {
    const requiredItems = [];
    const addItem = (item, count = 1, foundInRaid = false) => {
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

    quest.neededKeys.forEach(taskKey => {
        taskKey.keys.forEach(key => {
            addItem(key);
        });
    });

    return requiredItems;
}

const rewardTypes = ['startRewards', 'finishRewards'];

export function getRewardQuestItems(quest) {
    const rewardItems = [];
    const addItem = (item, count = 1, rewardType) => {
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
    requiredItemFilter,
    rewardItemFilter,
    hideBorders,
    showCompleted,
    requiredItems,
    rewardItems,
 }) {
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings);

    const result = useItemsQuery();
    const items = result.data;
    
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
                requiredItems: getRequiredQuestItems(rawQuest).filter(req => {
                    if (requiredItemFilter) {
                        return req.item.id === requiredItemFilter;
                    }
                    return true;
                }).map(req => {
                    return {
                        ...req,
                        item: items.find(i => i.id === req.item.id)
                    };
                }),
                rewardItems: getRewardQuestItems(rawQuest).filter(rew => {
                    if (rewardItemFilter) {
                        if (rew.item.id === rewardItemFilter) {
                            return true;
                        }
                        for (const contained of rew.item.containsItems) {
                            if (contained.item.id === rewardItemFilter) {
                                return true;
                            }
                        }
                        return false;
                    }
                    return true;
                }).map(rew => {
                    const contained = rew.item.containsItems;
                    const mapped = {
                        ...rew,
                        item: items.find(i => i.id === rew.item.id),
                    };
                    mapped.item.containsItems = contained;
                    return mapped;
                }),
            };

            return questData;
        }).filter(questData => {
            if (requiredItemFilter) {
                return questData.requiredItems.some(req => req.item.id === requiredItemFilter);
            }
            return true;
        }).filter(questData => {
            if (rewardItemFilter) {
                for (const reward of questData.rewardItems) {
                    if (reward.item.id === rewardItemFilter) {
                        return true;
                    }
                    for (const contained of reward.item.containsItems) {
                        if (contained.item.id === rewardItemFilter) {
                            return true;
                        }
                    }
                }
                return false;
            }
            return true;
        });
    }, [
        quests, 
        items,
        requiredItemFilter,
        rewardItemFilter,
    ]);

    const shownQuests = useMemo(() => {
        return allQuestData.filter(quest => showCompleted || !settings.completedQuests.some(stringId => parseInt(stringId) === quest.tarkovDataId));
    }, [
        settings,
        allQuestData,
        showCompleted,
    ]);

    const columns = useMemo(() => {
        const useColumns = [
            {
                Header: t('Quest'),
                accessor: 'name',
                Cell: (props) => {
                    const questData = props.row.original;
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
                            <a
                                className="quest-name-wrapper"
                                href={`https://tarkovtracker.io/quest/${questData.tarkovDataId}/`}
                            >
                                <div>
                                    {questData.name} {questData.factionName !== 'Any' ? questData.factionName : ''}
                                </div>
                            </a>
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
