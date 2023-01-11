import React, { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Icon from '@mdi/react';
import { mdiClipboardCheck } from '@mdi/js';
import Tippy from '@tippyjs/react';

import ErrorPage from '../../components/error-page';
import ItemSearch from '../../components/item-search';

import { selectQuests, fetchQuests } from '../../features/quests/questsSlice';
import { useTradersQuery } from '../../features/traders/queries';
import { useItemsQuery } from '../../features/items/queries';
import { useMapsQuery } from '../../features/maps/queries';

import './index.css';

import mapJson from '../../data/maps.json';

dayjs.extend(relativeTime);

function Quest() {
    const settings = useSelector((state) => state.settings);
    const { taskIdentifier } = useParams();
    const { t } = useTranslation();

    const loadingData = {
        name: t('Loading...'),
        loading: true,
    };

    const tradersResult = useTradersQuery();
    const traders = useMemo(() => {
        return tradersResult.data;
    }, [tradersResult]);

    const itemsResult = useItemsQuery();
    const items = useMemo(() => {
        return itemsResult.data;
    }, [itemsResult]);

    const mapsResult = useMapsQuery();
    const maps = useMemo(() => {
        return mapsResult.data;
    }, [mapsResult]);

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

    let currentQuest = useMemo(() => {
        return quests.find((quest) => {
            if (quest.id === taskIdentifier) {
                return true;
            }
            if (String(quest.tarkovDataId) === taskIdentifier) {
                return true;
            }
            if (quest.normalizedName === taskIdentifier) {
                return true;
            }
            return false;
        });
    }, [quests, taskIdentifier]);

    // if the name we got from the params are the id of the item, redirect
    // to a nice looking path
    if (currentQuest && currentQuest.normalizedName !== taskIdentifier) {
        return <Navigate to={`/task/${currentQuest.normalizedName}`} replace />;
    }

    if (!currentQuest) {
        return <ErrorPage />;
    }

    if (!currentQuest) {
        currentQuest = loadingData;
    }

    // checks for item data loaded
    /*if (!currentQuest && (questStatus === 'idle' || questStatus === 'loading')) {
        currentQuest = loadingData;
    }

    if (!currentQuest && (questStatus === 'success' || questStatus === 'failed')) {
        return <ErrorPage />;
    }*/

    const nextQuests = quests.filter((quest) =>
        quest.taskRequirements.some(
            (req) => req.task.id === currentQuest.id && !req.status.includes('active'),
        ),
    );

    let requirementsChunk = '';
    if (
        currentQuest.minPlayerLevel ||
        currentQuest.taskRequirements?.length > 0 ||
        currentQuest.traderLevelRequirements.length > 0
    ) {
        let playerLevel = '';
        let tasksReqs = '';
        let traderLevels = '';

        if (currentQuest.minPlayerLevel) {
            playerLevel = (
                <div key={'player-level-req'}>
                    {t('Player level: {{playerLevel}}', { playerLevel: currentQuest.minPlayerLevel })}
                </div>
            );
        }

        if (currentQuest.traderLevelRequirements?.length > 0) {
            traderLevels = (
                <div key={'trader-level-req'}>
                    <h3>{t('Trader Levels')}</h3>
                    {currentQuest.traderLevelRequirements.map((traderReq) => {
                        const trader = traders.find((trad) => trad.id === traderReq.trader.id);
                        return (
                            <div key={`req-trader-${trader.id}`}>
                                <Link to={`/traders/${trader.normalizedName}`}>{trader.name}</Link>
                                <span>{` ${t('LL{{level}}', { level: traderReq.level })}`}</span>
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (currentQuest.taskRequirements?.length > 0) {
            tasksReqs = (
                <div key={'task-status-req'}>
                    <h3>{t('Prerequisite Tasks')}</h3>
                    {currentQuest.taskRequirements.map((taskReq) => {
                        const task = quests.find((quest) => quest.id === taskReq.task.id);
                        return (
                            <div key={`req-task-${task.id}`}>
                                <Link to={`/task/${task.normalizedName}`}>{task.name}</Link>
                                <span>
                                    {`: ${taskReq.status
                                        .map((taskStatus) => {
                                            // possible values for t already specified in Quests page
                                            return t(taskStatus);
                                        })
                                        .join(', ')}`}
                                </span>
                                {taskReq.status.includes('complete') &&
                                settings.completedQuests.includes(task.id) ? (
                                    <Icon
                                        path={mdiClipboardCheck}
                                        size={0.75}
                                        className="icon-with-text"
                                    />
                                ) : (
                                    ''
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        }
        requirementsChunk = (
            <div key={'all-start-requirements'}>
                <h2>📋 {t('Start Requirements')}</h2>
                {playerLevel}
                {traderLevels}
                {tasksReqs}
            </div>
        );
    }

    return [
        <Helmet key={'task-helmet'}>
            <meta charSet="utf-8" />
            <title>{currentQuest.name} - {t('Escape from Tarkov')} - {t('Tarkov.dev')}</title>
            <meta
                name="description"
                content={t('task-page-description', 'This page includes information on the objectives, rewards, and strategies for completing task {{questName}}. Get tips on how to prepare for and succeed in your mission.', { questName: currentQuest.name })}
            />
            <link rel="canonical" href={`https://tarkov.dev/task/${currentQuest.normalizedName}`} />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className={'item-page-wrapper'}>
                <ItemSearch showDropdown />
                <div className="main-information-grid">
                    <div className="item-information-wrapper">
                        <h1>
                            <div className={'item-font'}>
                                {currentQuest.name}
                                {currentQuest.factionName === 'Any'
                                    ? ''
                                    : ` (${t(currentQuest.factionName)})`}
                            </div>
                            <img
                                alt={currentQuest.trader.name}
                                className={'item-icon'}
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/${currentQuest.trader.normalizedName}-icon.jpg`}
                            />
                        </h1>
                        {currentQuest.wikiLink && (
                            <div className="wiki-link-wrapper">
                                <a href={currentQuest.wikiLink} target="_blank" rel="noopener noreferrer">{t('Wiki')}</a>
                            </div>
                        )}
                        {typeof currentQuest.tarkovDataId !== 'undefined' && (
                            <div className="wiki-link-wrapper">
                                <a
                                    href={`https://tarkovtracker.io/quest/${currentQuest.tarkovDataId}`}
                                >
                                    {t('TarkovTracker')}
                                </a>
                            </div>
                        )}
                    </div>
                    <div className={`icon-and-link-wrapper`}>
                        <Link to={`/traders/${currentQuest.trader.normalizedName}`}>
                            <img
                                alt={currentQuest.trader.name}
                                height="86"
                                width="86"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/${currentQuest.trader.normalizedName}-icon.jpg`}
                                // title = {`Sell ${currentItemData.name} on the Flea market`}
                            />
                        </Link>
                    </div>
                </div>
                {requirementsChunk}
                {nextQuests.length > 0 && (
                    <div>
                        <h2>➡️📋 {t('Leads to')}</h2>
                        {nextQuests.map((task) => {
                            let failNote = '';
                            let status = task.taskRequirements.find(
                                (req) => req.task.id === currentQuest.id,
                            ).status;
                            if (status.length === 1 && status[0] === 'failed') {
                                failNote = t('(on failure)');
                            }
                            return (
                                <div key={`req-task-${task.id}`}>
                                    <Link to={`/task/${task.normalizedName}`}>{task.name}</Link>{' '}
                                    {failNote}
                                </div>
                            );
                        })}
                    </div>
                )}
                {/* Divider between sections */}
                <hr className="hr-muted-full"></hr>

                <h2 className="center-title task-details-heading">{t('Task Details')}</h2>

                {currentQuest.map && <h2>{`🗺️ ${t('Map')}: ${currentQuest.map.name}`}</h2>}

                {/* loop through all the values in mapJson array and if there is a match, add a link to the map */}
                {currentQuest.map &&
                    mapJson.map((map) => {
                        if (map.normalizedName === currentQuest.map.normalizedName) {
                            return (
                                <div key={`map-link-${map.normalizedName}`}>
                                    <Link to={map.primaryPath}>
                                        {t('View Map')} - {t(map.name)}
                                    </Link>
                                </div>
                            );
                        }
                        return null;
                    })}

                <h2>🏆 {t('Objectives')}</h2>
                <div key="task-objectives">
                    {currentQuest.objectives.map((objective) => {
                        let taskDetails = '';
                        if (objective.type.includes('QuestItem')) {
                            let verb = t('Pick up');
                            if (objective.type === 'giveQuestItem') {
                                verb = t('Hand over');
                            }
                            taskDetails = (
                                <>
                                    <span>{verb} </span>
                                    <Tippy
                                        content={
                                            <span>
                                                <img src={objective.questItem.iconLink} alt={''} />
                                            </span>
                                        }
                                    >
                                        <span className="hover-item-name">
                                            {objective.questItem.name}
                                        </span>
                                    </Tippy>
                                </>
                            );
                        }
                        if (objective.type === 'buildWeapon') {
                            const baseItem = items.find((i) => i.id === objective.item.id);
                            const attributes = objective.attributes
                                .map((att) => {
                                    if (!att.requirement.value) {
                                        return false;
                                    }
                                    return att;
                                })
                                .filter(Boolean);
                            taskDetails = (
                                <>
                                    <>
                                        <Link to={`/item/${baseItem.normalizedName}`}>
                                            {baseItem.name}
                                        </Link>
                                    </>
                                    {attributes.length > 0 && (
                                        <>
                                            <h4>{t('Attributes')}</h4>
                                            <ul>
                                                {attributes.map((att) => {
                                                    return (
                                                        <li
                                                            key={att.name}
                                                            className={'quest-list-item'}
                                                        >{`${att.name}: ${att.requirement.compareMethod} ${att.requirement.value}`}</li>
                                                    );
                                                })}
                                            </ul>
                                        </>
                                    )}
                                    {objective.containsAll?.length > 0 && (
                                        <>
                                            <h4>{t('Contains All')}</h4>
                                            <ul>
                                                {objective.containsAll.map((part) => {
                                                    const item = items.find(
                                                        (i) => i.id === part.id,
                                                    );
                                                    return (
                                                        <li
                                                            key={item.id}
                                                            className={'quest-list-item'}
                                                        >
                                                            <Link
                                                                to={`/item/${item.normalizedName}`}
                                                            >
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </>
                                    )}
                                    {objective.containsCategory?.length > 0 && (
                                        <>
                                            <h4>{t('Contains Item in Category')}</h4>
                                            <ul>
                                                {objective.containsCategory.map((cat) => {
                                                    return (
                                                        <li
                                                            key={cat.id}
                                                            className={'quest-list-item-category'}
                                                        >
                                                            <Link
                                                                to={`/items/${cat.normalizedName}`}
                                                            >
                                                                {cat.name}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </>
                                    )}
                                </>
                            );
                        }
                        if (objective.type === 'experience') {
                            taskDetails = (
                                <>
                                    {`${t('Have the {{effectNames, list}} effect(s) on your {{bodyParts, list}} for {{operator}} {{count}} seconds', {
                                            effectNames: objective.healthEffect.effects
                                                .map((effect) => {
                                                    return t(effect);
                                                }),
                                            bodyParts: objective.healthEffect.bodyParts
                                                .map((part) => {
                                                    return t(part);
                                                }),
                                            operator: objective.healthEffect.time.compareMethod,
                                            count: objective.healthEffect.time.value,
                                        },
                                    )}`}
                                </>
                            );
                        }
                        if (objective.type === 'extract') {
                            taskDetails = (
                                <>
                                    {t('Extract with the status(es): {{extractStatuses, list}}', {
                                        extractStatuses: objective.exitStatus
                                            .map((status) => {
                                                return t(status);
                                            }),
                                    })}
                                </>
                            );
                        }
                        if (objective.type === 'giveItem' || objective.type === 'findItem') {
                            const item = items.find((i) => i.id === objective.item.id);
                            const attributes = [];
                            if (objective.foundInRaid) {
                                attributes.push({
                                    name: t('Found in raid'),
                                    value: t('Yes'),
                                });
                            }
                            if (objective.dogTagLevel) {
                                attributes.push({
                                    name: t('Dogtag level'),
                                    value: objective.dogTagLevel,
                                });
                            }
                            if (objective.maxDurability && objective.maxDurability < 100) {
                                attributes.push({
                                    name: t('Max durability'),
                                    value: objective.maxDurability,
                                });
                            }
                            if (objective.minDurability > 0) {
                                attributes.push({
                                    name: t('Min durability'),
                                    value: objective.minDurability,
                                });
                            }
                            taskDetails = (
                                <>
                                    <>
                                        <Link to={`/item/${item.normalizedName}`}>{item.name}</Link>
                                        {objective.count > 1 && (
                                            <span>{` x ${objective.count}`}</span>
                                        )}
                                    </>
                                    {attributes.length > 0 && (
                                        <ul>
                                            {attributes.map((att) => {
                                                return (
                                                    <li
                                                        key={att.name}
                                                        className={'quest-list-item'}
                                                    >
                                                        {`${att.name}: ${att.value}`}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </>
                            );
                        }
                        if (objective.type === 'mark') {
                            const item = items.find((i) => i.id === objective.markerItem.id);
                            taskDetails = (
                                <>
                                    <Link to={`/item/${item.normalizedName}`}>{item.name}</Link>
                                </>
                            );
                        }
                        if (objective.type === 'shoot') {
                            let verb = 'Kill';
                            if (objective.shotType !== 'kill') {
                                verb = 'Shoot';
                            }
                            taskDetails = (
                                <>
                                    <>
                                        {t('{{shootOrKill}} {{target}} {{count}} times', {
                                            // t('Shoot)
                                            // t('Kill')
                                            shootOrKill: t(verb),
                                            target: objective.target,
                                            count: objective.count,
                                        })}
                                    </>
                                    {objective.distance && (
                                        <div>
                                            {t('From distance: {{operator}} {{count}} meters', {
                                                operator: objective.distance.compareMethod,
                                                count: objective.distance.value,
                                            })}
                                        </div>
                                    )}
                                    {objective.zoneNames?.length > 0 && (
                                        <div>
                                            {t('While inside: {{zoneList, list}}', {
                                                zoneList: objective.zoneNames
                                                    .map((zone) => {
                                                        return t(zone);
                                                    }),
                                            })}
                                        </div>
                                    )}
                                    {objective.bodyParts?.length > 0 && (
                                        <div>
                                            {t('Hitting: {{bodyPartList, list}}', {
                                                bodyPartList: objective.bodyParts
                                                    .map((part) => {
                                                        return t(part);
                                                    }),
                                            })}
                                        </div>
                                    )}
                                    {objective.usingWeapon?.length > 0 && (
                                        <div>
                                            {t('Using weapon:')}{' '}
                                            <ul>
                                                {objective.usingWeapon.map((weap) => {
                                                    const item = items.find(
                                                        (i) => i.id === weap.id,
                                                    );
                                                    return (
                                                        <li
                                                            key={`weapon-${item.id}`}
                                                            className={'quest-list-item'}
                                                        >
                                                            <Link
                                                                to={`/item/${item.normalizedName}`}
                                                            >
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                    {objective.usingWeaponMods?.length > 0 && (
                                        <div>
                                            {t('Using weapon mods:')}{' '}
                                            {objective.usingWeaponMods.map((modSet, index) => {
                                                return (
                                                    <ul key={`modset-${index}`}>
                                                        {modSet.map((mod) => {
                                                            const item = items.find(
                                                                (i) => i.id === mod.id,
                                                            );
                                                            return (
                                                                <li
                                                                    key={`mod-${item.id}`}
                                                                    className={'quest-list-item'}
                                                                >
                                                                    <Link
                                                                        to={`/item/${item.normalizedName}`}
                                                                    >
                                                                        {item.name}
                                                                    </Link>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {objective.wearing?.length > 0 && (
                                        <div>
                                            {t('While wearing:')}{' '}
                                            {objective.wearing.map((outfit, index) => {
                                                return (
                                                    <ul key={`outfit-${index}`}>
                                                        {outfit.map((accessory) => {
                                                            const item = items.find(
                                                                (i) => i.id === accessory.id,
                                                            );
                                                            return (
                                                                <li
                                                                    key={`accessory-${item.id}`}
                                                                    className={'quest-list-item'}
                                                                >
                                                                    <Link
                                                                        to={`/item/${item.normalizedName}`}
                                                                    >
                                                                        {item.name}
                                                                    </Link>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {objective.notWearing?.length > 0 && (
                                        <div>
                                            {t('Not wearing:')}{' '}
                                            <ul>
                                                {objective.notWearing.map((accessory) => {
                                                    const item = items.find(
                                                        (i) => i.id === accessory.id,
                                                    );
                                                    return (
                                                        <li
                                                            key={`accessory-${item.id}`}
                                                            className={'quest-list-item'}
                                                        >
                                                            <Link
                                                                to={`/item/${item.normalizedName}`}
                                                            >
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                    {objective.playerHealthEffect && (
                                        <div>
                                            {`${t(
                                                objective.playerHealthEffect.time
                                                    ? 'While having the {{effectNames, list}} effect(s) on your {{bodyParts, list}} for {{operator}} {{count}} seconds'
                                                    : 'While having the {{effectNames, list}} effect(s) on your {{bodyParts, list}}',
                                                {
                                                    effectNames:
                                                        objective.playerHealthEffect.effects
                                                            .map((effect) => {
                                                                return t(effect);
                                                            }),
                                                    bodyParts:
                                                        objective.playerHealthEffect.bodyParts
                                                            .map((part) => {
                                                                return t(part);
                                                            }),
                                                    operator:
                                                        objective.playerHealthEffect.time?.compareMethod,
                                                    count:
                                                        objective.playerHealthEffect.time?.value,
                                                },
                                            )}`}
                                        </div>
                                    )}
                                    {objective.enemyHealthEffect && (
                                        <div>
                                            {`${t(
                                                objective.enemyHealthEffect.time
                                                    ? 'While target has the {{effectNames, list}} effect(s) on their {{bodyParts, list}} for {{operator}} {{count}} seconds'
                                                    : 'While target has the {{effectNames, list}} effect(s) on their {{bodyParts, list}}',
                                                {
                                                    effectNames: objective.enemyHealthEffect.effects
                                                        .map((effect) => {
                                                            return t(effect);
                                                        }),
                                                    bodyParts: objective.enemyHealthEffect.bodyParts
                                                        .map((part) => {
                                                            return t(part);
                                                        }),
                                                    operator:
                                                        objective.enemyHealthEffect.time?.compareMethod,
                                                    count:
                                                        objective.enemyHealthEffect.time?.value,
                                                },
                                            )}`}
                                        </div>
                                    )}
                                </>
                            );
                        }
                        if (objective.type === 'skill') {
                            taskDetails = (
                                <>
                                    {t('Obtain level {{level}} {{skillName}} skill', {
                                        level: objective.skillLevel.level,
                                        skillName: objective.skillLevel.name,
                                    })}
                                </>
                            );
                        }
                        if (objective.type === 'taskStatus') {
                            const task = quests.find((q) => q.id === objective.task.id);
                            taskDetails = (
                                <>
                                    <Link to={`/task/${task.normalizedName}`}>{task.name}</Link>
                                    <span>
                                        :{' '}
                                        {objective.status
                                            .map((status) => {
                                                return t(status);
                                            })
                                            .join(', ')}
                                    </span>
                                </>
                            );
                        }
                        if (objective.type === 'traderLevel') {
                            const trader = traders.find((t) => t.id === objective.trader.id);
                            taskDetails = (
                                <>
                                    <Link to={`/traders/${trader.normalizedName}`}>
                                        {trader.name}
                                    </Link>
                                    <span>{` ${t('LL{{level}}', { level: objective.level })}`}</span>
                                </>
                            );
                        }
                        return (
                            <div key={objective.id}>
                                <h3>{`✔️ ${objective.description}${
                                    objective.optional ? ` (${t('optional')})` : ''
                                }`}</h3>
                                {objective.maps.length > 0 && (
                                    <div key="objective-maps">
                                        {`${t('Maps')}: ${objective.maps
                                            .map((m) => m.name)
                                            .join(', ')}`}
                                    </div>
                                )}
                                {taskDetails}
                            </div>
                        );
                    })}
                </div>
                {currentQuest.neededKeys?.length > 0 && (
                    <div key="task-keys">
                        <h2>🗝️ {t('Needed Keys')}</h2>
                        <ul>
                            {currentQuest.neededKeys.map((mapKeys) => {
                                const map = maps.find((m) => m.id === mapKeys.map.id);
                                return (
                                    <li key={map.id} className="quest-list-item">
                                        {`${map.name}: `}
                                        {mapKeys.keys
                                            .map((key) => {
                                                const item = items.find((i) => i.id === key.id);
                                                return (
                                                    <Link
                                                        key={item.id}
                                                        to={`/item/${item.normalizedName}`}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                );
                                            })
                                            .reduce((elements, current) => {
                                                if (elements.length > 0) {
                                                    elements.push(<span> or </span>);
                                                }
                                                elements.push(current);
                                                return elements;
                                            }, [])}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                <hr className="hr-muted-full"></hr>

                <h2 className="center-title task-details-heading">{t('Task Completion')}</h2>

                <h2>🎁 {t('Rewards')}</h2>
                {currentQuest.finishRewards?.items?.length > 0 && (
                    <div key="finishRewards">
                        <h3>{t('Items')}</h3>
                        <ul>
                            {currentQuest.finishRewards?.items.map((rewardItem, index) => {
                                const item = items.find((it) => it.id === rewardItem.item.id);
                                return (
                                    <li
                                        className="quest-list-item"
                                        key={`reward-index-${rewardItem.item.id}`}
                                    >
                                        <Link to={`/item/${item.normalizedName}`}>{item.name}</Link>
                                        <span>{` x ${rewardItem.count.toLocaleString()}`}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
                {currentQuest.finishRewards?.traderStanding?.length > 0 && (
                    <>
                        <h3>{t('Trader Standing')}</h3>
                        <ul>
                            {currentQuest.finishRewards.traderStanding.map((standing) => {
                                const trader = traders.find((t) => t.id === standing.trader.id);
                                let sign = '';
                                if (standing.standing > 0) {
                                    sign = '+';
                                }
                                return (
                                    <li className="quest-list-item" key={standing.trader.id}>
                                        <Link to={`/traders/${trader.normalizedName}`}>
                                            {trader.name}
                                        </Link>
                                        <span>
                                            {' '}
                                            {sign}
                                            {standing.standing}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
                {currentQuest.finishRewards?.skillLevelReward?.length > 0 && (
                    <>
                        <h3>{t('Skill Level')}</h3>
                        {currentQuest.finishRewards.skillLevelReward.map((skillReward) => {
                            return <>{`${skillReward.name} +${skillReward.level}`}</>;
                        })}
                    </>
                )}
                {currentQuest.finishRewards?.offerUnlock?.length > 0 && (
                    <>
                        <h3>{t('Trader Offer Unlock')}</h3>
                        <ul>
                            {currentQuest.finishRewards.offerUnlock.map((unlock) => {
                                const trader = traders.find((t) => t.id === unlock.trader.id);
                                const item = items.find((i) => i.id === unlock.item.id);
                                return (
                                    <li className="quest-list-item" key={unlock.item.id}>
                                        <Link to={`/item/${item.normalizedName}`}>{item.name}</Link>
                                        <span>{' @ '}</span>
                                        <Link to={`/traders/${trader.normalizedName}`}>
                                            {trader.name}
                                        </Link>
                                        <span>{` ${t('LL{{level}}', { level: unlock.level })}`}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
                {currentQuest.finishRewards?.traderUnlock?.length > 0 && (
                    <>
                        <h3>{t('Trader Unlock')}</h3>
                        <ul>
                            {currentQuest.finishRewards.traderUnlock.map((unlock) => {
                                const trader = traders.find((t) => t.id === unlock.id);
                                return (
                                    <li className="quest-list-item" key={unlock.id}>
                                        <Link to={`/traders/${trader.normalizedName}`}>
                                            {trader.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </div>
        </div>,
    ];
}

export default Quest;
