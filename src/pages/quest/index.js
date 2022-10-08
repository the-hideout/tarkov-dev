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
//import ItemImage from '../../components/item-image';

import { selectQuests, fetchQuests } from '../../features/quests/questsSlice';
import { useTradersQuery } from '../../features/traders/queries';
import { useItemsQuery } from '../../features/items/queries';
import { useMapsQuery } from '../../features/maps/queries';

import './index.css';

dayjs.extend(relativeTime);

/*const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
};*/

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
                    {t('Player level: {{playerLevel}}', {
                        playerLevel: currentQuest.minPlayerLevel,
                    })}
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
                                <span>{` LL${traderReq.level}`}</span>
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (currentQuest.taskRequirements?.length > 0) {
            tasksReqs = (
                <div key={'task-status-req'}>
                    <h3>{t('Precursor Tasks')}</h3>
                    {currentQuest.taskRequirements.map((taskReq) => {
                        const task = quests.find((quest) => quest.id === taskReq.task.id);
                        return (
                            <div key={`req-task-${task.id}`}>
                                <Link to={`/task/${task.normalizedName}`}>{task.name}</Link>
                                <span>
                                    {`: ${taskReq.status
                                        .map((taskStatus) => {
                                            return t(taskStatus);
                                        })
                                        .join(', ')}`}
                                </span>
                                {taskReq.status.includes('complete') &&
                                settings.completedQuests.includes(task.tarkovDataid) ? (
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
                <h2>{t('Start Requirements')}</h2>
                {playerLevel}
                {traderLevels}
                {tasksReqs}
            </div>
        );
    }
    //console.log(currentQuest)
    return [
        <Helmet key={'quest-page-helmet'}>
            <meta charSet="utf-8" />
            <title>{`${currentQuest.name} - Escape from Tarkov`}</title>
            <meta
                name="description"
                content={`All the relevant information about ${currentQuest.name}`}
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
                                <a href={currentQuest.wikiLink}>{t('Wiki')}</a>
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
                {/* Divider between sections */}
                <hr className="hr-muted"></hr>
                {currentQuest.map && <h2>{`🗺️ ${t('Map')}: ${currentQuest.map.name}`}</h2>}
                <h2>🏆 {t('Objectives')}</h2>
                <div>
                    {currentQuest.objectives.map((objective) => {
                        let taskDetails = '';
                        if (objective.type.includes('QuestItem')) {
                            let verb = t('Pick up');
                            if (objective.type === 'giveQuestItem') {
                                verb = t('Hand over');
                            }
                            taskDetails = (
                                <div>
                                    <span>{verb} </span>
                                    <Tippy
                                        content={
                                            <span>
                                                <img src={objective.questItem.iconLink} alt={''} />
                                            </span>
                                        }
                                    >
                                        <span>{objective.questItem.name}</span>
                                    </Tippy>
                                </div>
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
                                <div>
                                    <>
                                        <Link to={`/item/${baseItem.normalizedName}`}>
                                            {baseItem.name}
                                        </Link>
                                    </>
                                    {attributes.length > 0 && (
                                        <div>
                                            <h4>{t('Attributes')}</h4>
                                            <ul>
                                                {attributes.map((att) => {
                                                    return (
                                                        <li
                                                            key={att.name}
                                                        >{`${att.name}: ${att.requirement.compareMethod} ${att.requirement.value}`}</li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                    {objective.containsAll?.length > 0 && (
                                        <div>
                                            <h4>{t('Contains All')}</h4>
                                            <ul>
                                                {objective.containsAll.map((part) => {
                                                    const item = items.find(
                                                        (i) => i.id === part.id,
                                                    );
                                                    return (
                                                        <li key={item.id}>
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
                                    {objective.containsOne?.length > 0 && (
                                        <div>
                                            <h4>{t('Contains One')}</h4>
                                            <ul>
                                                {objective.containsOne.map((part) => {
                                                    const item = items.find(
                                                        (i) => i.id === part.id,
                                                    );
                                                    return (
                                                        <li key={item.id}>
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
                                </div>
                            );
                        }
                        if (objective.type === 'experience') {
                            taskDetails = (
                                <div>
                                    {`${t(
                                        'Have the {{effectNames}} effect(s) on your {{bodyParts}} for {{operator}} {{seconds}} seconds',
                                        {
                                            effectNames: objective.healthEffect.effects
                                                .map((effect) => {
                                                    return t(effect);
                                                })
                                                .join(', '),
                                            bodyParts: objective.healthEffect.bodyParts
                                                .map((part) => {
                                                    return t(part);
                                                })
                                                .join(', '),
                                            operator: objective.healthEffect.time.compareMethod,
                                            seconds: objective.healthEffect.time.value,
                                        },
                                    )}`}
                                </div>
                            );
                        }
                        if (objective.type === 'extract') {
                            taskDetails = (
                                <div>
                                    {t('Extract with the status(es): {{extractStatuses}}', {
                                        extractStatuses: objective.exitStatus
                                            .map((status) => {
                                                return t(status);
                                            })
                                            .join(', '),
                                    })}
                                </div>
                            );
                        }
                        if (objective.type === 'giveItem' || objective.type === 'findItem') {
                            const item = items.find((i) => i.id === objective.item.id);
                            const attributes = [];
                            if (objective.foundInRaid) {
                                attributes.push({
                                    name: t('Found in raid'),
                                    value: 'Yes',
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
                                <div>
                                    <div>
                                        <Link to={`/item/${item.normalizedName}`}>{item.name}</Link>
                                        {objective.count > 1 && (
                                            <span>{` x ${objective.count}`}</span>
                                        )}
                                    </div>
                                    {attributes.length > 0 && (
                                        <ul>
                                            {attributes.map((att) => {
                                                return (
                                                    <li key={att.name}>
                                                        {`${att.name}: ${att.value}`}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            );
                        }
                        if (objective.type === 'mark') {
                            const item = items.find((i) => i.id === objective.markerItem.id);
                            taskDetails = (
                                <div>
                                    <Link to={`/item/${item.normalizedName}`}>{item.name}</Link>
                                </div>
                            );
                        }
                        if (objective.type === 'shoot') {
                            let verb = 'Kill';
                            if (objective.shotType !== 'kill') {
                                verb = 'Shoot';
                            }
                            taskDetails = (
                                <div>
                                    <div>
                                        {t('{{shootOrKill}} {{target}} {{shotCount}} time(s)', {
                                            shootOrKill: t(verb),
                                            shotCount: objective.count,
                                            target: objective.target,
                                        })}
                                    </div>
                                    {objective.distance && (
                                        <div>
                                            {t('From distance: {{operator}} {{distance}} meters', {
                                                operator: objective.distance.compareMethod,
                                                distance: objective.distance.value,
                                            })}
                                        </div>
                                    )}
                                    {objective.zoneNames?.length > 0 && (
                                        <div>
                                            {t('While inside: {{zoneList}}', {
                                                zoneList: objective.zoneNames
                                                    .map((zone) => {
                                                        return t(zone);
                                                    })
                                                    .join(', '),
                                            })}
                                        </div>
                                    )}
                                    {objective.bodyParts?.length > 0 && (
                                        <div>
                                            {t('Hitting: {{bodyPartList}}', {
                                                bodyPartList: objective.bodyParts
                                                    .map((part) => {
                                                        return t(part);
                                                    })
                                                    .join(', '),
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
                                                        <li key={`weapon-${item.id}`}>
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
                                            {objective.usingWeaponMods.map((modSet) => {
                                                return (
                                                    <ul>
                                                        {modSet.map((mod) => {
                                                            const item = items.find(
                                                                (i) => i.id === mod.id,
                                                            );
                                                            return (
                                                                <li key={`mod-${item.id}`}>
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
                                            {objective.wearing.map((outfit) => {
                                                return (
                                                    <ul>
                                                        {outfit.map((accessory) => {
                                                            const item = items.find(
                                                                (i) => i.id === accessory.id,
                                                            );
                                                            return (
                                                                <li key={`accessory-${item.id}`}>
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
                                                        <li key={`accessory-${item.id}`}>
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
                                                'While having the {{effectNames}} effect(s) on your {{bodyParts}} for {{operator}} {{seconds}} seconds',
                                                {
                                                    effectNames:
                                                        objective.playerHealthEffect.effects
                                                            .map((effect) => {
                                                                return t(effect);
                                                            })
                                                            .join(', '),
                                                    bodyParts:
                                                        objective.playerHealthEffect.bodyParts
                                                            .map((part) => {
                                                                return t(part);
                                                            })
                                                            .join(', '),
                                                    operator:
                                                        objective.playerHealthEffect.time
                                                            .compareMethod,
                                                    seconds:
                                                        objective.playerHealthEffect.time.value,
                                                },
                                            )}`}
                                        </div>
                                    )}
                                    {objective.enemyHealthEffect && (
                                        <div>
                                            {`${t(
                                                'While target has the {{effectNames}} effect(s) on their {{bodyParts}} for {{operator}} {{seconds}} seconds',
                                                {
                                                    effectNames: objective.enemyHealthEffect.effects
                                                        .map((effect) => {
                                                            return t(effect);
                                                        })
                                                        .join(', '),
                                                    bodyParts: objective.enemyHealthEffect.bodyParts
                                                        .map((part) => {
                                                            return t(part);
                                                        })
                                                        .join(', '),
                                                    operator:
                                                        objective.enemyHealthEffect.time
                                                            .compareMethod,
                                                    seconds: objective.enemyHealthEffect.time.value,
                                                },
                                            )}`}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        if (objective.type === 'skill') {
                            taskDetails = (
                                <div>
                                    {t('Obtain level {{level}} {{skillName}} skill', {
                                        level: objective.skillLevel.level,
                                        skillName: objective.skillLevel.name,
                                    })}
                                </div>
                            );
                        }
                        if (objective.type === 'taskStatus') {
                            const task = quests.find((q) => q.id === objective.task.id);
                            taskDetails = (
                                <div>
                                    <Link to={`/task/${task.normalizedName}`}>{task.name}</Link>
                                    <span>
                                        :{' '}
                                        {objective.status
                                            .map((status) => {
                                                return t(status);
                                            })
                                            .join(', ')}
                                    </span>
                                </div>
                            );
                        }
                        if (objective.type === 'traderLevel') {
                            const trader = traders.find((t) => t.id === objective.trader.id);
                            taskDetails = (
                                <div>
                                    <Link to={`/traders/${trader.normalizedName}`}>
                                        {trader.name}
                                    </Link>
                                    <span>{` LL${objective.level}`}</span>
                                </div>
                            );
                        }
                        return (
                            <div key={objective.id}>
                                <h3>{`${objective.description}${
                                    objective.optional ? ` (${t('optional')})` : ''
                                }`}</h3>
                                {objective.maps.length > 0 && (
                                    <div>{`${t('Maps')}: ${objective.maps
                                        .map((m) => m.name)
                                        .join(', ')}`}</div>
                                )}
                                {taskDetails}
                            </div>
                        );
                    })}
                </div>
                {currentQuest.neededKeys?.length > 0 && (
                    <div>
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
                <h2>🎁 {t('Rewards')}</h2>
                {currentQuest.finishRewards?.items?.length > 0 && (
                    <div>
                        <h3>{t('Items')}</h3>
                        <ul>
                            {currentQuest.finishRewards?.items.map((rewardItem) => {
                                const item = items.find((it) => it.id === rewardItem.item.id);
                                return (
                                    <>
                                        <li className="quest-list-item" key={rewardItem.item.id}>
                                            <Link to={`/item/${item.normalizedName}`}>
                                                {item.name}
                                            </Link>
                                            <span>{` x ${rewardItem.count.toLocaleString()}`}</span>
                                        </li>
                                    </>
                                );
                            })}
                        </ul>
                    </div>
                )}
                {currentQuest.finishRewards?.traderStanding?.length > 0 && (
                    <div>
                        <h3>{t('Trader Standing')}</h3>
                        <ul>
                            {currentQuest.finishRewards.traderStanding.map((standing) => {
                                const trader = traders.find((t) => t.id === standing.trader.id);
                                let sign = '';
                                if (standing.standing > 0) {
                                    sign = '+';
                                }
                                return (
                                    <>
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
                                    </>
                                );
                            })}
                        </ul>
                    </div>
                )}
                {currentQuest.finishRewards?.skillLevelReward?.length > 0 && (
                    <div>
                        <h3>{t('Skill Level')}</h3>
                        {currentQuest.finishRewards.skillLevelReward.map((skillReward) => {
                            return <>{`${skillReward.name} +${skillReward.level}`}</>;
                        })}
                    </div>
                )}
                {currentQuest.finishRewards?.offerUnlock?.length > 0 && (
                    <div>
                        <h3>{t('Trader Offer Unlock')}</h3>
                        <ul>
                            {currentQuest.finishRewards.offerUnlock.map((unlock) => {
                                const trader = traders.find((t) => t.id === unlock.trader.id);
                                const item = items.find((i) => i.id === unlock.item.id);
                                return (
                                    <>
                                        <li className="quest-list-item" key={unlock.item.id}>
                                            <Link to={`/item/${item.normalizedName}`}>
                                                {item.name}
                                            </Link>
                                            <span>{' @ '}</span>
                                            <Link to={`/traders/${trader.normalizedName}`}>
                                                {trader.name}
                                            </Link>
                                            <span>{` LL${unlock.level}`}</span>
                                        </li>
                                    </>
                                );
                            })}
                        </ul>
                    </div>
                )}
                {currentQuest.finishRewards?.traderUnlock?.length > 0 && (
                    <div>
                        <h3>{t('Trader Unlock')}</h3>
                        <ul>
                            {currentQuest.finishRewards.traderUnlock.map((unlock) => {
                                const trader = traders.find((t) => t.id === unlock.id);
                                return (
                                    <>
                                        <li className="quest-list-item" key={unlock.id}>
                                            <Link to={`/traders/${trader.normalizedName}`}>
                                                {trader.name}
                                            </Link>
                                        </li>
                                    </>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>,
    ];
}

export default Quest;
