import React, { useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { mdiClipboardCheck, mdiClipboardList, mdiBriefcase, mdiLighthouse } from '@mdi/js';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import SEO from '../../components/SEO.jsx';
import ErrorPage from '../error-page/index.js';
import ItemSearch from '../../components/item-search/index.js';
import LoadingSmall from '../../components/loading-small/index.js';
import ItemImage from '../../components/item-image/index.js';
import TraderImage from '../../components/trader-image/index.js';

import useQuestsData from '../../features/quests/index.js';
import useTradersData from '../../features/traders/index.js';
import useItemsData from '../../features/items/index.js';
import useMapsData from '../../features/maps/index.js';
import useHideoutData from '../../features/hideout/index.js';

import './index.css';

const intelCashMultiplier = {
    0: 1,
    1: 1.05,
    2: 1.15,
    3: 1.15,
};

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

    const hasFailPenalties = useMemo(() => {
        return currentQuest?.failureOutcome?.items?.length > 0 ||
            currentQuest?.failureOutcome?.traderStanding?.length > 0 ||
            currentQuest?.failureOutcome?.skillLevelReward?.length > 0 || 
            currentQuest?.failureOutcome?.offerUnlock?.length > 0 || 
            currentQuest?.failureOutcome?.traderUnlock?.length > 0;
    }, [currentQuest]);

    const questMap = useMemo(() => {
        if (!currentQuest?.map) {
            return null;
        }
        return (
            <Link to={`/map/${currentQuest.map.normalizedName}`}>
                {currentQuest.map.name}
            </Link>
        );
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
                <Tippy
                    key={`${currentQuest.id}-kappa`}
                    content={t('Required for Kappa')}
                    placement={'bottom'}
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
        if (currentQuest?.lightkeeperRequired) {
            goals.push(
                <Tippy
                key={`${currentQuest.id}-lightkeeper`}
                    content={t('Required for Lightkeeper')}
                    placement={'bottom'}
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
        return goals;
    }, [currentQuest, t]);

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

    const nextQuests = quests.filter((quest) =>
        quest.taskRequirements.some(
            (req) => req.task.id === currentQuest.id && (!req.status.includes('active') || (req.status.length === 2 && req.status.includes('complete') && req.status.includes('active'))),
        ),
    );

    let completedIcon = '';
    if (settings.completedQuests.includes(currentQuest.id)) {
        completedIcon = (
            <Icon
                path={mdiClipboardCheck}
                size={1.2}
                className="icon-with-text"
            />
        );
    }

    let requirementsChunk = '';
    if (
        currentQuest.minPlayerLevel ||
        currentQuest.taskRequirements?.length > 0 ||
        currentQuest.traderRequirements?.length > 0
    ) {
        let playerLevel = '';
        let tasksReqs = '';
        let traderLevels = '';
        let traderReps = '';

        if (currentQuest.minPlayerLevel) {
            playerLevel = (
                <div key={'player-level-req'}>
                    {t('Player level: {{playerLevel}}', { playerLevel: currentQuest.minPlayerLevel })}
                </div>
            );
        }
        const levelReqs = currentQuest.traderRequirements.filter(req => req.requirementType === 'level');
        if (levelReqs.length > 0) {
            traderLevels = (
                <div key={'trader-level-req'}>
                    <h3>{t('Trader Levels')}</h3>
                    {levelReqs.map((traderReq) => {
                        const trader = traders.find((trad) => trad.id === traderReq.trader.id);
                        return (
                            <div key={`req-trader-${trader.id}`}>
                                <Link to={`/trader/${trader.normalizedName}`}>{trader.name}</Link>
                                <span>{` ${t('LL{{level}}', { level: traderReq.value })}`}</span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        const repReqs = currentQuest.traderRequirements.filter(req => req.requirementType === 'reputation');
        if (repReqs.length > 0) {
            traderReps = (
                <div key={'trader-rep-req'}>
                    <h3>{t('Trader Reputation')}</h3>
                    {repReqs.map((traderRep) => {
                        const trader = traders.find((trad) => trad.id === traderRep.trader.id);
                        return (
                            <div key={`req-trader-${trader.id}`}>
                                <Link to={`/trader/${trader.normalizedName}`}>{trader.name}</Link>
                                <span>{` ${traderRep.compareMethod} ${traderRep.value}`}</span>
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
                        if (!task)
                            return null;
                        return (
                            <div key={`req-task-${task.id}`}>
                                <Icon
                                    path={mdiClipboardList}
                                    size={1}
                                    className="icon-with-text"
                                />
                                <Link to={`/task/${task.normalizedName}`}>{task.name}</Link>
                                <span>
                                    {`: ${taskReq.status
                                        .map((taskStatus) => {
                                            // possible values for t already specified in Quests page
                                            return t(taskStatus);
                                        })
                                        .join(', ')}`}
                                </span>
                                {taskReq.status.includes('complete') && settings.completedQuests.includes(task.id) ? (
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
                {traderReps}
                {tasksReqs}
            </div>
        );
    }

    const getObjective = (objective) => {
        let taskDetails = '';
        let mapQuery = '';
        if (objective.type.includes('QuestItem')) {
            taskDetails = (
                <ItemImage
                    item={{
                        ...objective.questItem,
                        backgroundColor: 'yellow',
                        types: ['quest'],
                    }}
                    imageField="baseImageLink"
                    imageViewer={true}
                />
            );
            if (objective.type.includes('find')) {
                mapQuery = objective.questItem.id;
            }
        }
        if (objective.type === 'buildWeapon') {
            let baseItem = items.find((i) => i.id === objective.item.id);
            if (!baseItem)
                return null;
            if (baseItem.properties?.defaultPreset) {
                const preset = items.find(i => i.id === baseItem.properties.defaultPreset.id);
                baseItem = {
                    ...baseItem,
                    baseImageLink: preset.baseImageLink,
                    width: preset.width,
                    height: preset.height,
                };
            }
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
                        <ItemImage
                            item={baseItem}
                            imageField="baseImageLink"
                            linkToItem={true}
                        />
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
                            <ul className="quest-item-list">
                                {objective.containsAll.map((part) => {
                                    const item = items.find((i) => i.id === part.id);
                                    if (!item)
                                        return null;
                                    return (
                                        <li
                                            key={item.id}
                                        >
                                            <ItemImage
                                                item={item}
                                                imageField="baseImageLink"
                                                linkToItem={true}
                                            />
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
                    {t('Have the {{effectNames, list}} effect(s) on your {{bodyParts, list(type: disjunction)}} for {{operator}} {{count}} seconds', {
                            effectNames: objective.healthEffect.effects,
                            bodyParts: objective.healthEffect.bodyParts,
                            operator: objective.healthEffect.time.compareMethod,
                            count: objective.healthEffect.time.value,
                        },
                    )}
                </>
            );
        }
        if (objective.type === 'extract') {
            let extract = <></>;
            if (objective.exitName) {
                extract = (
                    <div>{t('using extract: {{extractName}}', {extractName: objective.exitName})}</div>
                );
            }
            let objDesc = 'Extract with the status(es): {{extractStatuses, list(type: disjunction)}}';
            if (objective.count > 1) {
                objDesc = 'Extract {{extractCount}} times with the status(es): {{extractStatuses, list(type: disjunction)}}';
            }
            // t('Extract with the status(es): {{extractStatuses, list(type: disjunction)}}')
            // t('Extract {{extractCount}} times with the status(es): {{extractStatuses, list(type: disjunction)}}')
            taskDetails = (
                <>
                    <>
                        {t(objDesc, {
                            extractStatuses: objective.exitStatus,
                            extractCount: objective.count,
                        })}
                    </>
                    {extract}
                </>
            );
        }
        if (objective.type === 'giveItem' || objective.type === 'findItem' || objective.type === 'sellItem') {
            let itemElements = [];
            let countElement = '';
            if (objective.items.length < 1000) {
                for (const objItem of objective.items) {
                    let item = items.find((i) => i.id === objItem.id);
                    if (!item)
                        continue;
                    if (item.properties?.defaultPreset) {
                        const preset = items.find(i => i.id === item.properties.defaultPreset.id);
                        item = {
                            ...item,
                            baseImageLink: preset.baseImageLink,
                            width: preset.width,
                            height: preset.height,
                        };
                    }
                    itemElements.push(
                        <ItemImage
                            key={item.id}
                            item={item}
                            imageField="baseImageLink"
                            linkToItem={true}
                            count={objective.count > 1 && objective.items.length === 1 ? objective.count : false}
                            isFIR={objective.foundInRaid}
                        />
                    );
                }
                if (itemElements.length < 1) {
                    return null;
                }
                if (itemElements.length > 1 && objective.count > 1) {
                    countElement = <div>{t('{{itemCount}}x any of', {itemCount: objective.count})}:</div>;
                }
            } else {
                countElement = <div>{`x ${objective.count}`}</div>;
            }
            const attributes = [];
            if (objective.dogTagLevel) {
                attributes.push({
                    name: t('Dogtag level'),
                    value: objective.dogTagLevel,
                });
            }
            if (objective.maxDurability && objective.maxDurability < 100) {
                attributes.push({
                    name: t('Max durability'),
                    value: objective.maxDurability+'%',
                });
            }
            if (objective.minDurability > 0) {
                attributes.push({
                    name: t('Min durability'),
                    value: objective.minDurability+'%',
                });
            }
            taskDetails = (
                <>
                    <>
                        {countElement}
                        <ul className="quest-item-list">
                        {itemElements.map((el, i) => 
                            <li
                                key={`objective-item-${i}`}
                                className={'quest-list-item'}
                            >
                                {el}
                            </li>
                        )}
                        </ul>
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
            if (!item)
                return null;
            taskDetails = (
                <>
                    <ItemImage
                        item={item}
                        imageField="baseImageLink"
                        linkToItem={true}
                    />
                </>
            );
        }
        if (objective.type === 'plantItem') {
            let item = items.find((i) => i.id === objective.items[0].id);
            if (!item)
                return null;
            if (item.properties?.defaultPreset) {
                const preset = items.find(i => i.id === item.properties.defaultPreset.id);
                item = {
                    ...item,
                    baseImageLink: preset.baseImageLink,
                    width: preset.width,
                    height: preset.height,
                };
            }
            if (objective.items.length > 1) {
                taskDetails = (
                    <div>
                        {t('Use any of:')}{' '}
                        <ul className="quest-item-list">
                            {objective.items.map((useItem, index) => {
                                const item = items.find((i) => i.id === useItem.id);
                                if (!item)
                                    return null;
                                return (
                                    <li
                                        key={`item-${index}-${item.id}`}
                                    >
                                        <ItemImage
                                            item={item}
                                            imageField="baseImageLink"
                                            linkToItem={true}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            } else {
                taskDetails = (
                    <>
                        <ItemImage
                            item={item}
                            imageField="baseImageLink"
                            linkToItem={true}
                        />
                    </>
                );
            }
        }
        if (objective.type === 'shoot') {
            let verb = t('Kill');
            if (objective.shotType !== 'kill') {
                verb = t('Shoot');
            }
            let shootString = `${verb} ${objective.targetNames.join(', ')}`;
            if (objective.count > 1) {
                shootString += ` x ${objective.count}`;
            }
            taskDetails = (
                <>
                    <>
                        {shootString}
                    </>
                    {objective.timeFromHour !== objective.timeUntilHour && (
                        <div>
                            {t('During hours: {{hourStart}}:00 to {{hourEnd}}:00', {hourStart: objective.timeFromHour, hourEnd: objective.timeUntilHour})}
                        </div>
                    )}
                    {objective.distance > 0 && (
                        <div>
                            {t('From distance: {{operator}} {{count}} meters', {
                                operator: objective.distance.compareMethod,
                                count: objective.distance.value,
                            })}
                        </div>
                    )}
                    {objective.zoneNames?.length > 0 && (
                        <div>
                            {t('While inside: {{zoneList, list(type: disjunction)}}', {
                                zoneList: objective.zoneNames,
                            })}
                        </div>
                    )}
                    {objective.bodyParts?.length > 0 && (
                        <div>
                            {t('Hitting: {{bodyPartList, list(type: disjunction)}}', {
                                bodyPartList: objective.bodyParts,
                            })}
                        </div>
                    )}
                    {objective.usingWeapon?.length > 0 && (
                        <div>
                            {t('Using weapon:')}{' '}
                            <ul className="quest-item-list">
                                {objective.usingWeapon.map((weap) => {
                                    let item = items.find((i) => i.id === weap.id,);
                                    if (!item)
                                        return null;
                                    if (item.properties?.defaultPreset) {
                                        const preset = items.find(i => i.id === item.properties.defaultPreset.id);
                                        item = {
                                            ...item,
                                            baseImageLink: preset.baseImageLink,
                                            width: preset.width,
                                            height: preset.height,
                                        };
                                    }
                                    return (
                                        <li
                                            key={`weapon-${item.id}`}
                                            className={'quest-list-item'}
                                        >
                                            <ItemImage
                                                item={item}
                                                imageField="baseImageLink"
                                                linkToItem={true}
                                            />
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
                                    <ul key={`modset-${index}`} className="quest-item-list">
                                        {modSet.map((mod) => {
                                            const item = items.find((i) => i.id === mod.id);
                                            if (!item)
                                                return null;
                                            return (
                                                <li
                                                    key={`mod-${item.id}`}
                                                    className={'quest-list-item'}
                                                >
                                                    <ItemImage
                                                        item={item}
                                                        imageField="baseImageLink"
                                                        linkToItem={true}
                                                    />
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
                                    <ul key={`outfit-${index}`} className="quest-item-list">
                                        {outfit.map((accessory) => {
                                            const item = items.find((i) => i.id === accessory.id);
                                            if (!item)
                                                return null;
                                            return (
                                                <li
                                                    key={`accessory-${item.id}`}
                                                    className={'quest-list-item'}
                                                >
                                                    <ItemImage
                                                        item={item}
                                                        imageField="baseImageLink"
                                                        linkToItem={true}
                                                    />
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
                            <ul className="quest-item-list">
                                {objective.notWearing.map((accessory) => {
                                    const item = items.find((i) => i.id === accessory.id);
                                    if (!item)
                                        return null;
                                    return (
                                        <li
                                            key={`accessory-${item.id}`}
                                            className={'quest-list-item'}
                                        >
                                            <ItemImage
                                                item={item}
                                                imageField="baseImageLink"
                                                linkToItem={true}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    {objective.playerHealthEffect && (
                        <div>
                            {objective.playerHealthEffect.time ?
                                t('While having the {{effectNames, list}} effect(s) on your {{bodyParts, list(type: disjunction)}} for {{operator}} {{count}} seconds', {
                                    effectNames: objective.playerHealthEffect.effects,
                                    bodyParts: objective.playerHealthEffect.bodyParts,
                                    operator: objective.playerHealthEffect.time?.compareMethod,
                                    count: objective.playerHealthEffect.time?.value,
                                })
                            :
                                t('While having the {{effectNames, list}} effect(s) on your {{bodyParts, list(type: disjunction)}}', {
                                    effectNames: objective.playerHealthEffect.effects,
                                    bodyParts: objective.playerHealthEffect.bodyParts,
                                })
                            }
                        </div>
                    )}
                    {objective.enemyHealthEffect && (
                        <div>
                            {objective.enemyHealthEffect.time ?
                                t('While target has the {{effectNames, list}} effect(s) on their {{bodyParts, list(type: disjunction)}} for {{operator}} {{count}} seconds', {
                                    effectNames: objective.enemyHealthEffect.effects,
                                    bodyParts: objective.enemyHealthEffect.bodyParts,
                                    operator: objective.enemyHealthEffect.time?.compareMethod,
                                    count: objective.enemyHealthEffect.time?.value,
                                })
                            :
                                t('While target has the {{effectNames, list}} effect(s) on their {{bodyParts, list(type: disjunction)}}', {
                                    effectNames: objective.enemyHealthEffect.effects,
                                    bodyParts: objective.enemyHealthEffect.bodyParts,
                                })
                            }
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
            if (!task)
                return null;
            taskDetails = (
                <>
                    <Icon
                        path={mdiClipboardList}
                        size={1}
                        className="icon-with-text"
                    />
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
                    <Link to={`/trader/${trader.normalizedName}`}>
                        {trader.name}
                    </Link>
                    <span>{` ${t('LL{{level}}', { level: objective.level })}`}</span>
                </>
            );
        }
        if (objective.type === 'traderStanding') {
            const trader = traders.find((t) => t.id === objective.trader.id);
            taskDetails = (
                <>
                    <Link to={`/trader/${trader.normalizedName}`}>
                        {trader.name}
                    </Link>
                    <span>{` ${t('{{compareMethod}} {{reputation}} reputation', { reputation: objective.value, compareMethod: objective.compareMethod })}`}</span>
                </>
            );
        }
        if (objective.type === 'useItem') {
            let zones = <></>;
            if (objective.zoneNames.length > 0) {
                zones = (
                    <div>{t('In area(s): {{areaList, list(type: disjunction)}}', {areaList: objective.zoneNames})}</div>
                );
            }
            taskDetails = (
                <div>
                    {t('Use any of:')}{' '}
                    <ul className="quest-item-list">
                        {objective.useAny.map((useItem, index) => {
                            const item = items.find((i) => i.id === useItem.id);
                            if (!item)
                                return null;
                            return (
                                <li
                                    key={`item-${index}-${item.id}`}
                                >
                                    <ItemImage
                                        item={item}
                                        imageField="baseImageLink"
                                        linkToItem={true}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                    {zones}
                </div>
            );
        }
        if (objective.type === 'playerLevel') {
            taskDetails = <div>
                {t('Reach level {{playerLevel}}', {playerLevel: objective.playerLevel})}
            </div>
        }
        let objectiveDescription = null;
        if (objective.description) {
            objectiveDescription = <h3>{`✔️ ${objective.description} ${objective.optional ? `(${t('optional')})` : ''}`}</h3>;
        }
        if (objective.zones?.length > 0) {
            mapQuery = objective.zones.reduce((ids, z) => {
                if (!ids.includes(z.id)) {
                    ids.push(z.id);
                }
                return ids;
            }, []).join(',');
        }
        if (mapQuery) {
            mapQuery = `?q=${mapQuery}`;
        }
        return (
            <div key={objective.id}>
                {objectiveDescription}
                {objective.maps.length > 0 && (
                    <div key="objective-maps">
                        <span>{`${t('Maps')}: `}</span>
                        {objective.maps
                            .map((m, i) => [
                                i > 0 && ', ',
                                <Link key={i} to={`/map/${maps.find(map => map.id === m.id)?.normalizedName}${mapQuery}`}>
                                    {m.name}
                                </Link>
                            ])}
                    </div>
                )}
                {taskDetails}
            </div>
        );
    };

    const getRewards = (rewards) => {
        return [rewards.items?.length > 0 && (
            <div key="finishRewards">
                <h3>{t('Items')}</h3>
                <ul className="quest-item-list">
                    {rewards.items.map((rewardItem, index) => {
                        const item = items.find((it) => it.id === rewardItem.item.id);
                        if (!item)
                            return null;
                        let itemCount = rewardItem.count;
                        if (item.categories.some(cat => cat.normalizedName === 'money')) {
                            const multiplier = intelCashMultiplier[settings['intelligence-center']];
                            itemCount = Math.round(itemCount * multiplier);
                        }
                        return (
                            <li
                                key={`reward-index-${rewardItem.item.id}-${index}`}
                            >
                                <ItemImage
                                    key={`reward-index-${rewardItem.item.id}-${index}`}
                                    item={item}
                                    imageField="baseImageLink"
                                    linkToItem={true}
                                    count={rewardItem.count > 1 ? itemCount : false}
                                    isFIR={true}
                                />
                            </li>
                        );
                    })}
                </ul>
            </div>
        ),
        rewards.traderStanding?.length > 0 && (
            <div key="reward-standing">
                <h3>{t('Trader Standing')}</h3>
                <ul className="quest-item-list">
                    {rewards.traderStanding.map((standing) => {
                        const trader = traders.find((t) => t.id === standing.trader.id);
                        return (
                            <li className="quest-list-item" key={standing.trader.id}>
                                <TraderImage
                                    trader={trader}
                                    reputationChange={standing.standing}
                                />
                            </li>
                        );
                    })}
                </ul>
            </div>
        ),
        rewards?.skillLevelReward?.length > 0 && (
            <div key="reward-skill">
                <h3>{t('Skill Level')}</h3>
                <ul>
                    {rewards.skillLevelReward.map((skillReward) => {
                        return (
                            <li className="quest-list-item" key={skillReward.name}>
                                {`${skillReward.name} +${skillReward.level}`}
                            </li>
                        )
                    })}
                </ul>
            </div>
        ),
        rewards.offerUnlock?.length > 0 && (
            <div key="reward-offer">
                <h3>{t('Trader Offer Unlock')}</h3>
                <ul className="quest-item-list">
                    {rewards.offerUnlock.map((unlock, index) => {
                        const trader = traders.find((t) => t.id === unlock.trader.id);
                        const item = items.find((i) => i.id === unlock.item.id);
                        if (!item)
                            return null;
                        return (
                            <li className="quest-list-item" key={`${unlock.item.id}-${index}`}>
                                <ItemImage
                                    key={`reward-index-${item.id}-${index}`}
                                    item={item}
                                    imageField="baseImageLink"
                                    linkToItem={true}
                                    trader={trader}
                                    count={unlock.level}
                                />
                            </li>
                        );
                    })}
                </ul>
            </div>
        ),
        rewards.traderUnlock?.length > 0 && (
            <div key="reward-trader">
                <h3>{t('Trader Unlock')}</h3>
                <ul>
                    {rewards.traderUnlock.map((unlock) => {
                        const trader = traders.find((t) => t.id === unlock.id);
                        return (
                            <li className="quest-list-item" key={unlock.id}>
                                <Link to={`/trader/${trader.normalizedName}`}>
                                    {trader.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        ),
        rewards.craftUnlock?.length > 0 && (
            <div key="reward-craft">
                <h3>{t('Craft Unlock')}</h3>
                <ul className="quest-item-list">
                    {rewards.craftUnlock.map((unlock, index) => {
                        const station = stations.find((s) => s.id === unlock.station.id);
                        const item = items.find((i) => i.id === unlock.rewardItems[0].item.id);
                        if (!item)
                            return null;
                        return (
                            <li className="quest-list-item" key={`${unlock.rewardItems[0].item.id}-${index}`}>
                                <ItemImage
                                    key={`reward-index-${item.id}-${index}`}
                                    item={item}
                                    imageField="baseImageLink"
                                    linkToItem={true}
                                    station={station}
                                    count={unlock.level}
                                />
                            </li>
                        );
                    })}
                </ul>
            </div>
        ),];
    };

    return [
        <SEO 
            title={`${currentQuest.name} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('task-page-description', 'This page includes information on the objectives, rewards, and strategies for completing task {{questName}}. Get tips on how to prepare for and succeed in your mission.', { questName: currentQuest.name })}
            url={`https://tarkov.dev/task/${currentQuest.normalizedName}`}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className={'quest-page-wrapper'}>
                <ItemSearch showDropdown defaultSearch="task" />
                <div className="quest-information-grid">
                    <div className="quest-information-wrapper">
                        <h1>
                            <span className={'quest-font'}>
                                {!currentQuest.loading
                                    ? (currentQuest.name)
                                    : (<LoadingSmall />)
                                }
                                {currentQuest.factionName === 'Any' ? '' : ` (${currentQuest.factionName})`}
                            </span>
                            {completedIcon}
                            <img
                                alt={currentQuest.trader.name}
                                className={'quest-icon'}
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/traders/${currentQuest.trader.normalizedName}-icon.jpg`}
                            />
                        </h1>
                        {currentQuest.wikiLink && (
                            <div className="wiki-link-wrapper">
                                <a href={currentQuest.wikiLink} target="_blank" rel="noopener noreferrer">{t('Wiki')}</a>
                            </div>
                        )}
                        {false && typeof currentQuest.tarkovDataId !== 'undefined' && (
                            <div className="wiki-link-wrapper">
                                <a href={`https://tarkovtracker.io/quest/${currentQuest.tarkovDataId}`} target="_blank" rel="noopener noreferrer">{t('TarkovTracker')}</a>
                            </div>
                        )}
                        {endgameGoals.length > 0 && (
                            <div>
                                {endgameGoals}
                            </div>
                        )}
                    </div>
                    <div className={`quest-icon-and-link-wrapper`}>
                        <Link to={`/trader/${currentQuest.trader.normalizedName}`}>
                            <img
                                alt={currentQuest.trader.name}
                                height="86"
                                width="86"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/traders/${currentQuest.trader.normalizedName}-portrait.png`}
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
                            let completedIcon = '';
                            if (settings.completedQuests.includes(currentQuest.id)) {
                                completedIcon = (
                                    <Icon
                                        path={mdiClipboardCheck}
                                        size={1}
                                        className="icon-with-text"
                                    />
                                );
                            }
                            return (
                                <div key={`req-task-${task.id}`}>
                                    <Icon
                                        path={mdiClipboardList}
                                        size={1}
                                        className="icon-with-text"
                                    />
                                    <Link to={`/task/${task.normalizedName}`}>{task.name}</Link>{' '}
                                    {failNote}
                                    {completedIcon}
                                </div>
                            );
                        })}
                    </div>
                )}
                {/* Divider between sections */}
                <hr className="hr-muted-full"></hr>

                <h2 className="center-title task-details-heading">{t('Task Details')}</h2>

                {currentQuest.map && <h2><span>{`🗺️ ${t('Map')}: `}</span>{questMap}</h2>}

                <h2>🏆 {t('Objectives')}</h2>
                <div key="task-objectives">
                    {currentQuest.objectives.map((objective) => {
                        return getObjective(objective);
                    })}
                </div>
                {currentQuest.failConditions?.length > 0 && (
                    <div>
                        <h2>❌ {t('Fail On')}</h2>
                        <div key="task-fail-conditions">
                            {currentQuest.failConditions.map((objective) => {
                                return getObjective(objective);
                            })}
                        </div>
                    </div>
                )}
                {currentQuest.neededKeys?.length > 0 && (
                    <div key="task-keys">
                        <h2>🗝️ {t('Needed Keys')}</h2>
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

                <hr className="hr-muted-full"></hr>

                {Object.keys(currentQuest.startRewards).some(r => currentQuest.startRewards[r]?.length) && [
                    <h2 className="center-title task-details-heading" key="task-start-reward-heading">{t('Task Start')}</h2>,
                    getRewards(currentQuest.startRewards)
                ]}

                <h2 className="center-title task-details-heading">{t('Task Completion')}</h2>

                <h2>🎁 {t('Rewards')}</h2>
                {getRewards(currentQuest.finishRewards)}
                {hasFailPenalties > 0 && (
                    <div>
                        <hr className="hr-muted-full"></hr>
                        <h2 className="center-title task-details-heading">{t('Task Failure')}</h2>
                        <p>{currentQuest.restartable ? t('Can be restarted') : t('Cannot be restarted')}</p>
                        {hasFailPenalties && (
                                <h2>{t('Penalties')}</h2>
                        )}
                        {currentQuest.failureOutcome?.items?.length > 0 && (
                            <div key="finishRewards">
                                <h3>{t('Items')}</h3>
                                <ul className="quest-item-list">
                                    {currentQuest.failureOutcome?.items.map((rewardItem, index) => {
                                        const item = items.find((it) => it.id === rewardItem.item.id);
                                        if (!item)
                                            return null;
                                        let itemCount = rewardItem.count;
                                        if (item.categories.some(cat => cat.normalizedName === 'money')) {
                                            const multiplier = intelCashMultiplier[settings['intelligence-center']];
                                            itemCount = Math.round(itemCount * multiplier);
                                        }
                                        return (
                                            <li
                                                key={`reward-index-${rewardItem.item.id}-${index}`}
                                            >
                                                <ItemImage
                                                    key={`reward-index-${rewardItem.item.id}-${index}`}
                                                    item={item}
                                                    imageField="baseImageLink"
                                                    linkToItem={true}
                                                    count={rewardItem.count > 1 ? itemCount : false}
                                                    isFIR={true}
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                        {currentQuest.failureOutcome?.traderStanding?.length > 0 && (
                            <>
                                <h3>{t('Trader Standing')}</h3>
                                <ul className="quest-item-list">
                                    {currentQuest.failureOutcome.traderStanding.map((standing) => {
                                        const trader = traders.find((t) => t.id === standing.trader.id);
                                        return (
                                            <li className="quest-list-item" key={standing.trader.id}>
                                                <TraderImage
                                                    trader={trader}
                                                    reputationChange={standing.standing}
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                        {currentQuest.failureOutcome?.skillLevelReward?.length > 0 && (
                            <>
                                <h3>{t('Skill Level')}</h3>
                                <ul>
                                    {currentQuest.failureOutcome.skillLevelReward.map((skillReward) => {
                                        return (
                                            <li className="quest-list-item" key={skillReward.name}>
                                                {`${skillReward.name} +${skillReward.level}`}
                                            </li>
                                        )
                                    })}
                                </ul>
                            </>
                        )}
                        {currentQuest.failureOutcome?.offerUnlock?.length > 0 && (
                            <>
                                <h3>{t('Trader Offer Unlock')}</h3>
                                <ul className="quest-item-list">
                                    {currentQuest.failureOutcome.offerUnlock.map((unlock, index) => {
                                        const trader = traders.find((t) => t.id === unlock.trader.id);
                                        const item = items.find((i) => i.id === unlock.item.id);
                                        if (!item)
                                            return null;
                                        return (
                                            <li className="quest-list-item" key={`${unlock.item.id}-${index}`}>
                                                <ItemImage
                                                    key={`reward-index-${item.id}-${index}`}
                                                    item={item}
                                                    imageField="baseImageLink"
                                                    linkToItem={true}
                                                    trader={trader}
                                                    count={t('LL{{level}}', { level: unlock.level })}
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                        {currentQuest.failureOutcome?.traderUnlock?.length > 0 && (
                            <>
                                <h3>{t('Trader Unlock')}</h3>
                                <ul>
                                    {currentQuest.failureOutcome.traderUnlock.map((unlock) => {
                                        const trader = traders.find((t) => t.id === unlock.id);
                                        return (
                                            <li className="quest-list-item" key={unlock.id}>
                                                <Link to={`/trader/${trader.normalizedName}`}>
                                                    {trader.name}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>,
    ];
}

export default Quest;
