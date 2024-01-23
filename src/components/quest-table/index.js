import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Icon } from '@mdi/react';
import { mdiClipboardCheck, mdiClipboardRemove, mdiBriefcase, mdiLighthouse } from '@mdi/js';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import DataTable from '../data-table/index.js';
import QuestItemsCell from '../quest-items-cell/index.js';
import CenterCell from '../center-cell/index.js';
import useQuestsData from '../../features/quests/index.js';
import useItemsData from '../../features/items/index.js';
import useTradersData from '../../features/traders/index.js';
import TraderImage from '../trader-image/index.js';

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
    reputationRewards,
    requiredForEndGame,
 }) {
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings);

    const { data: items } = useItemsData();

    const { data: traders } = useTradersData();
    
    const { data: quests } = useQuestsData();

    const allQuestData = useMemo(() => {
        return quests.map(rawQuest => {
            const questData = {
                ...rawQuest,
                requiredItems: [],
                rewardItems: [],
            };

            if (reputationRewards) {
                questData.totalRepReward = rawQuest.finishRewards.traderStanding?.reduce((total, current) => {
                    total += current.standing;
                    return Math.round(total * 100) / 100;
                }, 0);
            }

            if (requiredItemFilter || requiredItems) {
                questData.requiredItems = getRequiredQuestItems(rawQuest, requiredItemFilter).map(req => {
                    return {
                        ...req,
                        item: items.find(i => i.id === req.item.id)
                    };
                }).filter(req => req.item);
                if (requiredItemFilter && questData.requiredItems.length === 0) {
                    return false;
                }
            }

            if (rewardItemFilter || rewardItems) {
                questData.rewardItems = getRewardQuestItems(rawQuest, rewardItemFilter).map(rew => {
                    const foundItem = items.find(i => i.id === rew.item.id);
                    if (!foundItem) {
                        return false;
                    }
                    const contained = rew.item.containsItems;
                    const mapped = {
                        ...rew,
                        item: {
                            ...foundItem,
                            containsItems: contained,
                        },
                    };
                    return mapped;
                }).filter(Boolean);
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
        reputationRewards,
    ]);

    const shownQuests = useMemo(() => {
        return allQuestData.filter(quest => {
            if (!hideCompleted && !hideLocked) {
                return true;
            }

            let completedPassed = true;
            if (hideCompleted) {
                completedPassed = !settings.completedQuests.includes(quest.id) && !settings.failedQuests.includes(quest.id);
            }

            let lockedPassed = true;
            if (hideLocked) {
                lockedPassed = quest.active;
                if (!hideCompleted && !quest.active) {
                    lockedPassed = settings.completedQuests.includes(quest.id) || settings.failedQuests.includes(quest.id);
                }
            }

            return completedPassed && lockedPassed;
        });
    }, [
        settings,
        allQuestData,
        hideCompleted,
        hideLocked,
    ]);

    const columns = useMemo(() => {
        const useColumns = [
            {
                Header: t('Task'),
                id: 'name',
                accessor: 'name',
                Cell: (props) => {
                    const questData = props.row.original;
                    let completedIcon = '';
                    if (settings.completedQuests.includes(questData.id)) {
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
                            <TraderImage
                                trader={questData.trader}
                                style={{marginRight: '10px'}}
                            />
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
                id: 'requiredItems',
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
                id: 'rewardItems',
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
                id: 'questRequirements',
                accessor: (questData) => {
                    return quests.find(quest => quest.id === questData.taskRequirements[0]?.task.id)?.name;
                },
                Cell: (props) => {
                    const questData = props.row.original;
                    return questData.taskRequirements.map(req => {
                        const reqQuest = quests.find(quest => quest.id === req.task.id);
                        if (!reqQuest)
                            return null;
                        let completedIcon = '';
                        if (req.status.includes('complete') && settings.completedQuests.includes(req.task.id)) {
                            completedIcon = (
                                <Icon
                                    path={mdiClipboardCheck}
                                    size={0.75}
                                    className="icon-with-text"
                                />
                            );
                        }
                        if (completedIcon === '' && req.status.includes('failed') && settings.failedQuests.includes(req.task.id)) {
                            completedIcon = (
                                <Icon
                                    path={mdiClipboardCheck}
                                    size={0.75}
                                    className="icon-with-text"
                                />
                            );
                        }
                        if (completedIcon === '' && req.status.length === 1 && req.status[0] === 'active' && (settings.completedQuests.includes(req.task.id) || settings.failedQuests.includes(req.task.id))) {
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
                                    {`: ${
                                        // t('loading')
                                        // t('active')
                                        // t('succeeded')
                                        // t('complete')
                                        // t('failed')
                                        req.status.map(status => t(status)).join(', ')
                                    }`}
                                    {completedIcon}
                                </span>
                            </div>
                        );
                    });
                },
                position: questRequirements,
            });
        }

        if (minimumLevel) {
            useColumns.push({
                Header: t('Minimum level'),
                id: 'minimumLevel',
                accessor: 'minPlayerLevel',
                sortType: (a, b, columnId, desc) => {
                    let minA = a.original.minPlayerLevel;
                    let minB = b.original.minPlayerLevel;
                    if (minA === 0) {
                        minA = desc ? -1 : 100;
                    }
                    if (minB === 0) {
                        minB = desc ? -1 : 100;
                    }
                    return minA - minB;
                },
                Cell: (props) => {
                    if (!props.value) {
                        return '';
                    }
                    return (
                        <CenterCell value={props.value}/>
                    );
                },
                position: minimumLevel,
            });
        }

        if (minimumTraderLevel) {
            useColumns.push({
                Header: t('Minimum trader level'),
                id: 'minimumTraderLevel',
                accessor: (questData) => {
                    return questData.traderRequirements.filter(req => req.requirementType === 'level')[0]?.value;
                },
                Cell: (props) => {
                    return (
                        <CenterCell value={props.row.original.traderRequirements.filter(req => req.requirementType === 'level').map(req => req.value).join(', ')}/>
                    );
                },
                position: minimumTraderLevel,
            });
        }

        if (reputationRewards) {
            useColumns.push({
                Header: t('Reputation rewards'),
                id: 'reputationRewards',
                accessor: 'totalRepReward',
                sortType: (a, b, columnId, desc) => {
                    return a.original.totalRepReward - b.original.totalRepReward;
                },
                Cell: (props) => {
                    return <CenterCell>
                        {props.row.original.finishRewards.traderStanding.map(reward => {
                            const trader = traders.find(t => t.id === reward.trader.id);
                            return <TraderImage
                                trader={trader}
                                reputationChange={reward.standing}
                                key={trader.id}
                            />
                        })}
                    </CenterCell>;
                },
                position: reputationRewards,
            });
        }

        if (requiredForEndGame) {
            useColumns.push({
                Header: t('Endgame'),
                id: 'requiredForEndGame',
                accessor: 'kappaRequired',
                sortType: (a, b, columnId, desc) => {
                    let aValue = 0;
                    let bValue = 0;
                    if (a.original.kappaRequired) {
                        aValue += 1;
                    }
                    if (b.original.kappaRequired) {
                        bValue += 1;
                    }
                    if (a.original.lightkeeperRequired) {
                        aValue += 2;
                    }
                    if (b.original.lightkeeperRequired) {
                        bValue += 2;
                    }
                    return aValue - bValue;
                },
                Cell: (props) => {
                    const endgameGoals = [];
                    if (props.row.original.kappaRequired) {
                        endgameGoals.push(
                            <Tippy
                                key={`${props.row.original.id}-kappa`}
                                content={t('Required for Kappa')}
                            >
                                <Link to={'/task/collector'}>
                                    <Icon
                                        path={mdiBriefcase}
                                        size={0.75}
                                        className="icon-with-text"
                                    />
                                </Link>
                            </Tippy>
                        );
                    }
                    if (props.row.original.lightkeeperRequired) {
                        endgameGoals.push(
                            <Tippy
                            key={`${props.row.original.id}-lightkeeper`}
                                content={t('Required for Lightkeeper')}
                            >
                                <Link to={'/task/knock-knock'}>
                                    <Icon
                                        path={mdiLighthouse}
                                        size={0.75}
                                        className="icon-with-text"
                                    />
                                </Link>
                            </Tippy>
                        );
                    }
                    return <CenterCell>
                        {endgameGoals}
                    </CenterCell>;
                },
                position: requiredForEndGame,
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
        traders,
        questRequirements,
        minimumLevel,
        minimumTraderLevel,
        requiredItems,
        rewardItems,
        reputationRewards,
        requiredForEndGame,
    ]);

    let extraRow = false;

    if (allQuestData.length <= 0) {
        extraRow = t('No quests found');
    } else if (allQuestData.length !== shownQuests.length) {
        extraRow = t('Some tasks hidden by filter settings');
    }

    return (
        <DataTable
            className={`quest-table ${hideBorders ? 'no-borders' : ''}`}
            key="quest-table"
            columns={columns}
            data={shownQuests}
            extraRow={extraRow}
            autoResetSortBy={false}
            sortBy={'minimumLevel'}
        />
    );
}

export default QuestTable;
