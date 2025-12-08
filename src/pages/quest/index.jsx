import { useMemo, useState, useCallback } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ImageViewer from 'react-simple-image-viewer';

import { Icon } from '@mdi/react';
import { 
    mdiCheck,
    mdiClipboardCheck,
    mdiClipboardList,
    mdiClipboardPlay,
    mdiClipboardRemove,
    mdiClose,
    mdiBriefcase,
    mdiCheckBold,
    mdiChevronRight,
    mdiCloseThick,
    mdiFormatListCheckbox,
    mdiGift,
    mdiKeyVariant,
    mdiLighthouse,
    mdiPlay,
    mdiSourceBranch,
} from '@mdi/js';
import { Tooltip } from '@mui/material';

import SEO from '../../components/SEO.jsx';
import ErrorPage from '../error-page/index.jsx';
import ItemSearch from '../../components/item-search/index.jsx';
import ItemImage from '../../components/item-image/index.jsx';
import PropertyList from '../../components/property-list/index.jsx';

import useQuestsData, { useAchievementsData } from '../../features/quests/index.js';
import useTradersData from '../../features/traders/index.js';
import useItemsData, { useHandbookData } from '../../features/items/index.js';
import useMapsData from '../../features/maps/index.js';
import useHideoutData from '../../features/hideout/index.js';
import useBossesData from '../../features/bosses/index.js';

import { TaskObjective, TaskRewards } from '../../modules/task-elements.mjs';

import './index.css';

function Quest() {
    const settings = useSelector((state) => state.settings[state.settings.gameMode]);
    const { taskIdentifier } = useParams();
    const { t } = useTranslation();

    const loadingData = {
        name: t('Loading...'),
        factionName: 'Any',
        trader: {
            name: t('Loading...'),
            normalizedName: 'unknown'
        },
        objectives: [],
        startRewards: [],
        finishRewards: [],
        failureOutcome: [],
        loading: true,
    };

    const { data: traders } = useTradersData();

    const { data: items } = useItemsData();

    const { data: maps } = useMapsData();

    const { data: quests, status: questsStatus } = useQuestsData();

    const { data: stations } = useHideoutData();

    const { data: bosses } = useBossesData();
    
    const { data: achievements } = useAchievementsData();
    
    const { data: handbook } = useHandbookData();

    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const openImageViewer = useCallback(() => {
        setIsViewerOpen(true);
        }, []);
    const closeImageViewer = () => {
        setIsViewerOpen(false);
    };
    const backgroundStyle = {
        backgroundColor: 'rgba(0,0,0,.9)',
        zIndex: 20,
    };

    let currentQuest = useMemo(() => {
        return quests.find((quest) => {
            if (quest.id === taskIdentifier) {
                return true;
            }
            if (String(quest.tarkovDataId) === taskIdentifier) {
                return true;
            }
            if (quest.normalizedName === (taskIdentifier ? String(taskIdentifier).toLowerCase() : '')) {
                return true;
            }
            return false;
        });
    }, [quests, taskIdentifier]);

    const hasFailInfo = useMemo(() => {
        if (!currentQuest) {
            return false;
        }
        const failureOutcome = currentQuest?.failureOutcome ?? {};
        return Object.keys(failureOutcome).some(r => failureOutcome[r]?.length > 0) || currentQuest.failConditions?.length > 0;
    }, [currentQuest]);

    const neededKeysPerMap = useMemo(() => {
        if (!currentQuest?.neededKeys) {
            return [];
        }
        return currentQuest.neededKeys.reduce((neededByMap, current) => {
            let mapKeys = neededByMap.find(m => m.id === current.map.id);
            if (!mapKeys) {
                const map = maps.find(m => m.id === current.map.id);
                if (!map) {
                    return neededByMap;
                }
                mapKeys = {
                    id: map.id,
                    name: map.name,
                    normalizedName: map.normalizedName,
                    link: `/map/${map.normalizedName}`,
                    keys: [],
                };
                neededByMap.push(mapKeys);
            }
            mapKeys.keys.push(current.keys);
            return neededByMap;
        }, []);
    }, [currentQuest, maps]);

    const endgameGoals = useMemo(() => {
        const goals = [];
        if (currentQuest?.kappaRequired) {
            goals.push(
                <Tooltip
                    key={`${currentQuest.id}-kappa`}
                    title={t('Required for Kappa')}
                    placement={'top'}
                    arrow
                >
                    <Link to={'/task/collector'}>
                        <Icon
                            path={mdiBriefcase}
                            size={0.75}
                            className="icon-with-text"
                        />
                    </Link>
                </Tooltip>
            );
        }
        if (currentQuest?.lightkeeperRequired) {
            goals.push(
                <Tooltip
                    key={`${currentQuest.id}-lightkeeper`}
                    title={t('Required for Lightkeeper')}
                    placement={'top'}
                    arrow
                >
                    <Link to={'/task/knock-knock'}>
                        <Icon
                            path={mdiLighthouse}
                            size={0.75}
                            className="icon-with-text"
                        />
                    </Link>
                </Tooltip>
            );
        }
        if (goals.length > 1) {
            return <span>{goals}</span>
        }
        return '';
    }, [currentQuest, t]);

    const taskStatusIcon = useMemo(() => {
        if (!currentQuest || (!settings.completedQuests.includes(currentQuest.id) && !currentQuest.active)) {
            return '';
        }
        let iconPath = mdiClipboardCheck;
        let iconTitle = t('Completed');
        if (settings.failedQuests.includes(currentQuest.id)) {
            iconPath = mdiClipboardRemove;
            iconTitle = t('Failed');
        }
        if (currentQuest.active) {
            iconPath = mdiClipboardPlay;
            iconTitle = t('Active');
        }
        return (
            <Tooltip
                key={`${currentQuest.id}-status-icon`}
                title={iconTitle}
                placement={'top'}
                arrow
            >
                <Icon
                    path={iconPath}
                    size={0.75}
                    className="icon-with-text"
                />
            </Tooltip>
        );
    }, [currentQuest, settings, t]);

    const questRequirementProperties = useMemo(() => {
        const props = {};
        if (!currentQuest) {
            return props;
        }
        if (currentQuest.minPlayerLevel) {
            props.minPlayerLevel = {
                value: currentQuest.minPlayerLevel,
                label: t('Minimum PMC Level'),
                order: 1,
            };
        }
        const levelReqs = currentQuest.traderRequirements.filter(req => req.requirementType === 'level');
        if (levelReqs.length > 0) {
            props.traderLevel = {
                value: <span>{
                    levelReqs.map((traderReq) => {
                        const trader = traders.find((trad) => trad.id === traderReq.trader.id);
                        return (
                            <div key={`req-trader-${trader.id}`}>
                                <Link to={`/trader/${trader.normalizedName}`}>{trader.name}</Link>
                                <span>{` ${t('LL{{level}}', { level: traderReq.value })}`}</span>
                            </div>
                        );
                    })
                }</span>,
                label: t('Trader Levels'),
                order: 2,
            };
        }
        const repReqs = currentQuest.traderRequirements.filter(req => req.requirementType === 'reputation');
        if (repReqs.length > 0) {
            props.traderRep = {
                value: <span>{
                    repReqs.map((traderRep) => {
                        const trader = traders.find((trad) => trad.id === traderRep.trader.id);
                        return (
                            <div key={`req-trader-${trader.id}`}>
                                <Link to={`/trader/${trader.normalizedName}`}>{trader.name}</Link>
                                <span>{` ${traderRep.compareMethod} ${traderRep.value}`}</span>
                            </div>
                        );
                    })
                }</span>,
                label: t('Trader Reputation'),
                order: 3,
            };
        }
        if (currentQuest?.map) {
            props.map = {
                value: <Link to={`/map/${currentQuest.map.normalizedName}`}>
                    {currentQuest.map.name}
                </Link>,
                label: t('Map'),
                order: 4,
            };
        }
        return props;
    }, [currentQuest, traders, t]);

    const getTaskStatusIcon = useCallback((status, options = {}) => {
        const questStatusIconMap = {
            active: mdiPlay,
            complete: mdiCheck,
            failed: mdiClose,
        };
        return <Tooltip title={options.tooltip ?? t(status)} key={options.key ?? `task-status-${status}`} arrow>
            <Icon path={questStatusIconMap[status]} size={options.size ?? 0.75} className="icon-with-text"/>
        </Tooltip>
    }, [t]);

    const previousTasks = useMemo(() => {
        if (!currentQuest?.taskRequirements?.length > 0) {
            return '';
        }
        return (
            <div className="related-quests" key={'task-status-req'}>
                <h3><Icon path={mdiCheckBold} size={1} className="icon-with-text" /> {t('Prerequisite Tasks')}</h3>
                {currentQuest.taskRequirements.map((taskReq) => {
                    const task = quests.find((quest) => quest.id === taskReq.task.id);
                    if (!task) {
                        return null;
                    }
                    let taskIcon = mdiClipboardList;
                    if (taskReq.status.includes('complete') && settings.completedQuests.includes(task.id)) {
                        taskIcon = mdiClipboardCheck;
                    } else if (task.active) {
                        taskIcon = mdiClipboardPlay;
                    }
                    let taskStatuses = [];
                    if (taskReq.status.length > 1 || taskReq.status[0] !== 'complete') {
                        taskStatuses = taskReq.status.map((s, i) => getTaskStatusIcon(s));
                    }
                    return (
                        <div key={`req-task-${task.id}`}>
                            <Icon
                                path={taskIcon}
                                size={1}
                                className="icon-with-text"
                            />
                            <Link to={`/task/${task.normalizedName}`}>{task.name}</Link>
                            <span className="class-status-list">{taskStatuses}</span>
                        </div>
                    );
                })}
            </div>
        );
    }, [currentQuest, quests, settings, t, getTaskStatusIcon]);

    const nextTasks = useMemo(() => {
        if (!currentQuest) {
            return '';
        }
        const nextQuests = quests.filter((quest) =>
            quest.taskRequirements.some(
                (req) => req.task.id === currentQuest.id && (!req.status.includes('active') || (req.status.length === 2 && req.status.includes('complete') && req.status.includes('active'))),
            )
        );
        if (nextQuests.length === 0) {
            return '';
        }
        return <div className="related-quests" key="next-tasks">
            <h3><Icon path={mdiChevronRight} size={1} className="icon-with-text" /> {t('Leads to')}</h3>
            {nextQuests.map((task) => {
                let status = task.taskRequirements.find(
                    (req) => req.task.id === currentQuest.id,
                ).status;
                let taskStatuses = [];
                if (status.length > 1 || status[0] !== 'complete') {
                    taskStatuses = status.map((s) => getTaskStatusIcon(s, {tooltip: t('This task {{taskStatus}}', {taskStatus: t(s)})}));
                }
                let taskIcon = mdiClipboardList;
                if (settings.failedQuests.includes(task.id)) {
                    taskIcon = mdiClipboardRemove;
                } else if (settings.completedQuests.includes(task.id)) {
                    taskIcon = mdiClipboardCheck;
                } else if (task.active) {
                    taskIcon = mdiClipboardPlay;
                }
                return (
                    <div key={`req-task-${task.id}`}>
                        <Icon
                            path={taskIcon}
                            size={1}
                            className="icon-with-text"
                        />
                        <Link to={`/task/${task.normalizedName}`}>{task.name}</Link>{' '}
                        <span className="class-status-list">{taskStatuses}</span>
                    </div>
                );
            })}
        </div>
    }, [currentQuest, quests, settings, t, getTaskStatusIcon]);

    const alternateTasks = useMemo(() => {
        if (!currentQuest) {
            return '';
        }
        const altQuests = quests.filter(q => currentQuest.failConditions.some((objective) => 
            objective.type === 'taskStatus' && 
            objective.task.id === q.id &&
            objective.status.includes('complete')
        ));
        if (altQuests.length === 0) {
            return '';
        }
        return <div className="related-quests" key="alternate-quests">
            <h3><Icon path={mdiSourceBranch} size={1} className="icon-with-text" /> {t('Other Options')}</h3>
            {altQuests.map((task) => {
                let taskIcon = mdiClipboardList;
                if (settings.failedQuests.includes(task.id)) {
                    taskIcon = mdiClipboardRemove;
                } else if (settings.completedQuests.includes(task.id)) {
                    taskIcon = mdiClipboardCheck;
                } else if (task.active) {
                    taskIcon = mdiClipboardPlay;
                }
                return (
                    <div key={`req-task-${task.id}`}>
                        <Icon
                            path={taskIcon}
                            size={1}
                            className="icon-with-text"
                        />
                        <Link to={`/task/${task.normalizedName}`}>{task.name}</Link>{' '}
                    </div>
                );
            })}
        </div>
    }, [currentQuest, quests, settings, t]);

    // if the name we got from the params are the id of the item, redirect
    // to a nice looking path
    if (currentQuest && currentQuest.normalizedName !== taskIdentifier) {
        return <Navigate to={`/task/${currentQuest.normalizedName}`} replace />;
    }

    // checks for item data loaded
    if (!currentQuest && (questsStatus === 'idle' || questsStatus === 'loading')) {
        currentQuest = loadingData;
    }

    if (!currentQuest && (questsStatus === 'succeeded' || questsStatus === 'failed')) {
        return <ErrorPage />;
    }

    return [
        <SEO 
            title={`${currentQuest.name} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('task-page-description', 'This page includes information on the objectives, rewards, and strategies for completing task {{questName}}. Get tips on how to prepare for and succeed in your mission.', { questName: currentQuest.name })}
            url={`https://tarkov.dev/task/${currentQuest.normalizedName}`}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className={'entity-page-wrapper'} key={'quest-page-display-wrapper'}>
                <ItemSearch showDropdown defaultSearch="task" />
                <div className="entity-information-wrapper">
                  <div className="entity-top-content">
                    <div className="entity-information-images">
                        <img
                            alt={currentQuest.name}
                            className={'entity-information-image'}
                            loading="lazy"
                            src={currentQuest.taskImageLink}
                            onClick={() => openImageViewer(0)}
                        />
                        <Link to={`/trader/${currentQuest.trader.normalizedName}`}>
                            <img
                                alt={currentQuest.trader.name}
                                className={'entity-information-image'}
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/traders/${currentQuest.trader.normalizedName}-icon.jpg`}
                            />
                        </Link>
                    </div>
                    <div className="title-bar">
                      <span className="type">{t('Task')}</span>
                      <h1>{currentQuest.name} {taskStatusIcon}{endgameGoals}</h1>

                      {currentQuest.wikiLink &&
                        <span className="wiki-link-wrapper">
                            <a href={currentQuest.wikiLink} target="_blank" rel="noopener noreferrer">
                                {t('Wiki')}
                            </a>
                        </span>
                      }
                    </div>
                    <div className="main-content">
                      
                    </div>
                    <div className="entity-properties">
                      <PropertyList properties={questRequirementProperties} />
                    </div>
                    <div className="task-connections">
                        {previousTasks}
                        {nextTasks}
                        {alternateTasks}
                    </div>
                  </div>
                  <div className="entity-icon-cont">
                    <div className="entity-icon-and-link-wrapper"
                      onClick={() => openImageViewer(0)}
                      style={{ backgroundImage: `url(${currentQuest.taskImageLink})` }}
                    >
                        <Link to={`/trader/${currentQuest.trader.normalizedName}`}>
                            <img
                                alt={currentQuest.trader.name}
                                className={'quest-icon'}
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/traders/${currentQuest.trader.normalizedName}-icon.jpg`}
                                style={{position: 'absolute', right: 2, bottom: 2}}
                            />
                        </Link>
                    </div>
                  </div>
                </div>
                {isViewerOpen && (
                  <ImageViewer
                    src={[currentQuest.taskImageLink]}
                    currentIndex={0}
                    backgroundStyle={backgroundStyle}
                    disableScroll={true}
                    closeOnClickOutside={true}
                    onClose={closeImageViewer}
                  />
                )}
                <div className="information-section has-table">
                    <h2><Icon path={mdiFormatListCheckbox} size={1.5} className="icon-with-text" /> {t('Objectives')}</h2>
                    <div className="information-content">
                        {currentQuest.objectives.map((objective) => {
                            return TaskObjective({objective, items, bosses, quests, traders, maps, settings, t, handbook, stations});
                        })}
                    </div>
                </div>
                {currentQuest.failConditions?.length > 0 && (
                    <div className="information-section has-table">
                        <h2><Icon path={mdiCloseThick} size={1.5} className="icon-with-text" /> {t('Fail On')}</h2>
                        <div key="task-fail-conditions" className="information-content">
                            {currentQuest.failConditions.map((objective) => {
                                return TaskObjective({objective, items, bosses, quests, traders, maps, settings, t, handbook, stations});
                            })}
                        </div>
                    </div>
                )}
                {currentQuest.neededKeys?.length > 0 && (
                    <div key="task-keys" className="information-section has-table">
                        <h2><Icon path={mdiKeyVariant} size={1.5} className="icon-with-text" /> {t('Needed Keys')}</h2>
                        <ul>
                            {neededKeysPerMap.map((map, mapIndex) => {
                                return (
                                    <li key={`${map.id}-${mapIndex}`} className="quest-list-item">
                                        <Link to={map.link}>{`${map.name}`}</Link>
                                        {map.keys.map((keyChoices, choiceIndex) => {
                                            return (
                                                <ul className="quest-item-list" key={`${map.id}-${choiceIndex}`}>
                                                {keyChoices
                                                    .map((key, keyIndex) => {
                                                        const item = items.find((i) => i.id === key.id);
                                                        if (!item)
                                                            return null;
                                                        return (
                                                            <li key={`${key.id}-${keyIndex}`}>
                                                                <ItemImage
                                                                    item={item}
                                                                    imageField="baseImageLink"
                                                                    linkToItem={true}
                                                                    fullNameTooltip={true}
                                                                />
                                                            </li>
                                                        );
                                                    })
                                                    .reduce((elements, current, index) => {
                                                        if (elements.length > 0) {
                                                            elements.push(<li key={`or-${index}`}><span style={{verticalAlign: 'middle', minHeight: '64px', display: 'inline-block', padding: '0px 3px'}}> and </span></li>);
                                                        }
                                                        elements.push(current);
                                                        return elements;
                                                    }, [])}
                                                </ul>
                                            );
                                        })}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {Object.keys(currentQuest.startRewards).some(r => currentQuest.startRewards[r]?.length) && (
                    <div key="task-start-rewards" className="information-section has-table">
                        <h2><Icon path={mdiPlay} size={1.5} className="icon-with-text" /> {t('Starting Equipment')}</h2>
                        <div key="task-start-rewards-content" className="information-content">
                            {TaskRewards({rewards: currentQuest.startRewards, t, items, settings, traders, stations, handbook, achievements})}
                        </div>
                    </div>
                )}

                {Object.keys(currentQuest.finishRewards).some(r => currentQuest.finishRewards[r]?.length) && (    
                    <div key="task-finish-rewards" className="information-section has-table">
                        <h2><Icon path={mdiGift} size={1.5} className="icon-with-text" /> {t('Completion Rewards')}</h2>
                        <div key="task-finish-rewards-content" className="information-content">
                            {TaskRewards({rewards: currentQuest.finishRewards, t, items, settings, traders, stations, handbook, achievements})}
                        </div>
                    </div>
                )}
                
                {hasFailInfo && (
                    <div>
                        <div key="task-failure-rewards" className="information-section has-table">
                            <h2><Icon path={mdiCloseThick} size={1.5} className="icon-with-text" /> {t('Failure Penalties')}</h2>
                            <div key="task-failure-rewards-content-restartable" className="information-content">{currentQuest.restartable ? t('Can be restarted') : t('Cannot be restarted')}</div>
                            <div key="task-failure-rewards-content" className="information-content">
                                {TaskRewards({rewards: currentQuest.failureOutcome, t, items, settings, traders, stations, handbook, achievements})}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
    ];
}

export default Quest;
