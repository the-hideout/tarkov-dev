import { Link } from 'react-router-dom';
import { Icon } from '@mdi/react';
import {
    mdiClipboardCheck,
    mdiClipboardList,
    mdiClipboardPlay,
    mdiClipboardRemove,
    mdiCheckboxBlankOutline,
    mdiCheckboxOutline,
} from '@mdi/js';

import ItemImage from '../components/item-image/index.js';
import TraderImage from '../components/trader-image/index.js';

import './task-elements.css';

const intelCashMultiplier = {
    0: 1,
    1: 1.05,
    2: 1.15,
    3: 1.15,
};

export function CustomizationReward(reward, items, settings) {
    if (reward.items) {
        return <ul className="quest-item-list">
            {reward.items.map((rewardItem, index) => {
                const item = items.find((it) => it.id === rewardItem.id);
                if (!item) {
                    return null;
                }
                return (
                    <li
                        key={`reward-index-${rewardItem.id}-${index}`}
                    >
                        <ItemImage
                            key={`reward-index-${rewardItem.id}-${index}`}
                            item={item}
                            imageField="baseImageLink"
                            linkToItem={true}
                        />
                    </li>
                );
            })}
        </ul>
    }
    return <div key={reward.id} className="customization-image">
        <img src={reward.imageLink} alt=""/>
        <div className='customization-name'>{reward.name}</div>
    </div>
}

export function TaskObjective({objective, items, bosses, quests, traders, maps, handbook, settings, stations, t}) {
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
    if (objective.type === 'giveItem' || objective.type === 'findItem' || objective.type === 'sellItem' || objective.type === 'haveItem') {
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
        if (!item) {
            return null;
        }
        if (item.properties?.defaultPreset) {
            const preset = items.find(i => i.id === item.properties.defaultPreset.id);
            item = {
                ...item,
                baseImageLink: preset.baseImageLink,
                width: preset.width,
                height: preset.height,
            };
        }
        let plantCount;
        if (objective.count > 1) {
            plantCount = objective.count;
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
                        count={plantCount}
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
        const targets = objective.targetNames.map(t => {
            const boss = bosses.find(b => b.name === t);
            if (!boss) {
                return <span key={`mob-${t}`}>{t}</span>;
            }
            return <Link key={`boss-${t}`} to={`/boss/${boss.normalizedName}`}>{t}</Link>;
        }).reduce((allTargets, current, index) => {
            if (allTargets.length > 0) {
                allTargets.push(<span key={`comma-${index}`}>, </span>)
            }
            allTargets.push(current);
            return allTargets;
        }, []);
        let shootCount = '';
        if (objective.count > 1) {
            shootCount = <span>{` x ${objective.count}`}</span>
        }
        taskDetails = (
            <>
                <>
                    {verb} {targets}{shootCount}
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
                {(objective.usingWeaponMods?.length > 0 && objective.usingWeaponMods[0].length > 0) && (
                    <div>
                        {t('Using weapon mods:')}{' '}
                        <ul className="quest-item-list">
                            {objective.usingWeaponMods.map((modSet, index) => {
                                return (
                                    <li
                                        key={`mod-set-${index}`}
                                        className={'quest-list-item'}
                                    >
                                        {modSet.map((mod) => {
                                            const item = items.find((i) => i.id === mod.id);
                                            if (!item)
                                                return null;
                                            return (
                                                
                                                    <ItemImage
                                                        item={item}
                                                        imageField="baseImageLink"
                                                        linkToItem={true}
                                                        key={item.id}
                                                    />
                                            );
                                        })}
                                    </li>
                                );
                            })}
                        </ul>
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
        const skill = handbook.skills.find(s => s.id === objective.skillLevel.skill.id);
        taskDetails = (
            <>
                {t('Obtain level {{level}} {{skillName}} skill', {
                    level: objective.skillLevel.level,
                    skillName: skill.name,
                })}
            </>
        );
    }
    if (objective.type === 'hideoutStation') {
        const station = stations.find(s => s.id === objective.hideoutStation.id);
        taskDetails = (
            <>
                {t('Construct level {{level}} {{stationName}}', {
                    level: objective.stationLevel,
                    stationName: station.name,
                })}
            </>
        );
    }
    if (objective.type === 'taskStatus') {
        const task = quests.find((q) => q.id === objective.task.id);
        if (!task)
            return null;
        let taskIcon = mdiClipboardList;
        if (settings.failedQuests.includes(task.id)) {
            taskIcon = mdiClipboardRemove;
        } else if (settings.completedQuests.includes(task.id)) {
            taskIcon = mdiClipboardCheck;
        } else if (task.active) {
            taskIcon = mdiClipboardPlay;
        }
        taskDetails = (
            <>
                <Icon
                    path={taskIcon}
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
    let objectiveCounter = '';
    let objectiveIconPath = mdiCheckboxBlankOutline;
    if (objective.complete) {
        objectiveIconPath = mdiCheckboxOutline;
        if (objective.count && objective.count > 1) {
            objectiveCounter = ` - ${objective.count}/${objective.count}`;
        }
    } else if (objective.count && objective.count > 1) {
        const completeCount = settings.objectivesCompletionProgress?.[objective.id] ?? 0;
        objectiveCounter = ` - ${completeCount}/${objective.count}`;
    }
    let objectiveTitle = '';
    if (objective.description && objective.description !== objective.id) {
        objectiveTitle = `${objective.description}${objective.optional ? ` (${t('optional')})` : ''}${objectiveCounter}`;
    }
    const objectiveDescription = <h3><Icon path={objectiveIconPath} size={1} className="icon-with-text" />{objectiveTitle}</h3>;
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
            <div className="objective-details">    
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
        </div>
    );
}

export function TaskRewards({rewards, t, items, settings, traders, stations, achievements}) {
    const rewardElements = [];
    if (rewards.items?.length > 0) {
        rewardElements.push(
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
        );
    }
    if (rewards.traderStanding?.length > 0) {
        rewardElements.push(
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
        );
    }
    if (rewards?.skillLevelReward?.length > 0) {
        rewardElements.push(
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
        );
    }
    if (rewards.offerUnlock?.length > 0) {
        rewardElements.push(
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
        );
    }
    if (rewards.traderUnlock?.length > 0) {
        rewardElements.push(
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
        );
    }
    if (rewards.craftUnlock?.length > 0) {
        rewardElements.push(
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
        );
    }
    if (rewards.achievement?.length > 0) {
        rewardElements.push(
            <div key="reward-achievement">
                <h3>{t('Achievement')}</h3>
                <ul className="quest-item-list">
                    {rewards.achievement.map((reward, index) => {
                        const achievement = achievements.find((a) => a.id === reward.id);
                        if (!achievement){
                            return false;
                        }
                        console.log(achievement);
                        return (
                            <li className="quest-list-item" key={`${achievement.id}-${index}`}>
                                <div className='achievement-image'>
                                    <img src={achievement.imageLink} alt=""/>
                                    <div className='achievement-name'>{achievement.name}</div>
                                </div>
                            </li>
                        );
                    }).filter(Boolean)}
                </ul>
            </div>
        );
    }
    if (rewards.customization?.length > 0) {
        rewardElements.push(
            <div key="reward-customization">
                <h3>{t('Customization')}</h3>
                <ul className="quest-item-list">
                    {rewards.customization.map((reward, index) => {
                        return (
                            <li className="quest-list-item" key={`${reward.id}-${index}`}>
                                {CustomizationReward(reward, items, settings)}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
    return rewardElements;
}

