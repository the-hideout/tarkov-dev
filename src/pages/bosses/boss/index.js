import React, { Suspense, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';

import Icon from '@mdi/react';
import { mdiEmoticonDevil, mdiPoll, mdiDiamondStone, mdiMapLegend, mdiAccountGroup, mdiPartyPopper } from '@mdi/js';

import SEO from '../../../components/SEO';
import CenterCell from '../../../components/center-cell';
import ErrorPage from '../../../components/error-page';
import Loading from '../../../components/loading';
import SmallItemTable from '../../../components/small-item-table';
import DataTable from '../../../components/data-table';
import PropertyList from '../../../components/property-list';
import CheekiBreekiEffect from '../../../components/cheeki-breeki-effect';

import capitalize from '../../../modules/capitalize-first';

import { useBossDetails } from '../../../features/bosses/queries';
import { useItemsQuery } from '../../../features/items/queries';

import './index.css';

function BossPage(params) {
    const { t } = useTranslation();

    // cheeki breeki
    const [isShown, setIsShown] = useState(false);

    const bosses = useBossDetails();

    const {data: items} = useItemsQuery();

    let audio = new Audio("/audio/killa.mp3")
    const handleClick = event => {
        setIsShown(current => !current);
        audio.play()
    };
    // end cheeki breeki

    // Format the boss table columns for locations
    const columnsLocations = useMemo(() => {
        return [
            {
                Header: t('Map'),
                accessor: 'map',
                Cell: CenterCell
            },
            {
                Header: t('Spawn Location'),
                accessor: 'spawnLocations',
                Cell: CenterCell
            },
            {
                Header: t('Chance'),
                accessor: 'chance',
                Cell: CenterCell
            }
        ];
    }, [t]);

    // Format the boss table columns
    const columnsEscorts = useMemo(() => {
        return [
            {
                Header: t('Map'),
                accessor: 'map',
                Cell: CenterCell
            },
            {
                Header: t('Name'),
                accessor: 'name',
                Cell: (props) => {
                    if (bosses.some(boss => boss.normalizedName === props.row.original.normalizedName)) {
                        return (
                            <CenterCell>
                                <Link to={`/boss/${props.row.original.normalizedName}`}>
                                    {props.value}
                                </Link>
                            </CenterCell>
                        );
                    }
                    return <CenterCell value={props.value} nowrap />;
                },
            },
            {
                Header: t('Count'),
                accessor: 'count',
                Cell: CenterCell
            },
            {
                Header: t('Chance'),
                accessor: 'chance',
                Cell: CenterCell
            }
        ];
    }, [t, bosses]);

    const bossNameLower = params.bossName

    // If no bosses have been returned yet, return 'loading'
    if (!bosses || bosses.length === 0) {
        return <Loading />;
    }

    // Format the boss data
    //const bossSpawns = formatBossData(maps);

    // Get the correct individual boss data
    //var bossSpawnData = bossSpawns.find(boss => boss.normalizedName === bossNameLower);
    const bossData = bosses.find(boss => boss.normalizedName === bossNameLower);

    // If no boss data has been found, return the error page
    if (!bossData) {
        return <ErrorPage />;
    }

    const loot = [];
    const attachmentMap = {};

    const lootValueCutoff = 80000;
    const getItemSlotValue = (item) => {
        if (!item)
            return 0;
        return item.sellFor.reduce((best, current) => {
            if (current.priceRUB > best) {
                return current.priceRUB;
            }
            return best;
        }, 0) / (item.width * item.height);
    };
    gearLoop:
    for (const gear of bossData.equipment) {
        const item = items.find(it => it.id === gear.item.id);
        if (!item)
            continue;
        const itemValue = getItemSlotValue(item);
        if (item.types.includes('noFlea') || itemValue > lootValueCutoff) {
            loot.push(gear.item);
            attachmentMap[item.id] = gear.item.containsItems.map(ci => ci.item.id);
            continue;
        }
        for ( const attach of gear.item.containsItems) {
            const attachItem = items.find(it => it.id === attach.item.id);
            if (!attachItem) {
                continue;
            }
            const attachItemValue = getItemSlotValue(item);
            if (attachItem.types.includes('noFlea') || attachItemValue > lootValueCutoff) {
                loot.push(gear.item);
                attachmentMap[item.id] = gear.item.containsItems.map(ci => ci.item.id);
                continue gearLoop;
            }
        }
    }
    for (const lootItem of bossData.items) {
        const item = items.find(it => it.id === lootItem.id);
        if (!item)
            continue;
        const itemValue = getItemSlotValue(item);
        if (item.types.includes('noFlea') || itemValue > lootValueCutoff) {
            loot.push(lootItem);
        }
    }
    loot.sort((a, b) => {
        const itemA = items.find(it => it.id === a.id);
        const itemB = items.find(it => it.id === b.id);
        return getItemSlotValue(itemB) - getItemSlotValue(itemA);
    });

    // Get static boss data from json file
    //var bossJsonData = bossJson.find(boss => boss.normalizedName === bossNameLower);

    // Collect a list of all maps without duplicates
    var bossMaps = [];
    for (const map of bossData.maps) {
        if (bossMaps.includes(map.name)) {
            continue;
        }
        bossMaps.push(map.name);
    }

    // Format the bossProperties data for the 'stats' section
    var bossProperties = {}
    bossProperties[t('Map') + ' 🗺️'] = bossMaps;

    // Collect spawn stats for each map
    var spawnStatsMsg = [];

    for (const map of bossData.maps) {
        // If a specific boss override exists, use that instead of the default from the API
        const spawnChanceOverride = bossData.spawnChanceOverride?.find(override => override.map === map.normalizedName);
        if (spawnChanceOverride) {
            spawnStatsMsg.push(`${spawnChanceOverride.chance * 100}% (${map.name})`);
            continue;
        }
        /*if (map.spawns.length === 1) {
            spawnStatsMsg.push(`${map.spawns[0].spawnChance * 100}% (${map.name})`);
            continue;
        }*/
        let lowerBound = 1;
        let upperBound = 0;
        for (const spawn of map.spawns) {
            lowerBound = lowerBound > spawn.spawnChance ? spawn.spawnChance : lowerBound;
            upperBound = upperBound < spawn.spawnChance ? spawn.spawnChance : upperBound;
        }
        upperBound = Math.round(upperBound * 100);
        lowerBound = Math.round(lowerBound * 100);
        let displayPercent = `${lowerBound}-${upperBound}`;
        if (lowerBound === upperBound || upperBound === 100) {
            displayPercent = upperBound;
        } 
        spawnStatsMsg.push(`${displayPercent}% (${map.name})`)
    }

    if (spawnStatsMsg.length > 0) {
        bossProperties['spawnChance'] = {
            value: spawnStatsMsg.join(', '),
            label: `${t('Spawn chance')} 🎲`,
            tooltip: t('Chance that the boss spawns on a given map'),
        };
    }

    // Display health stats
    bossProperties['health'] = {
        value: bossData.health.reduce((totalHealth, current) => {
            totalHealth += current.max;
            return totalHealth;
        }, 0),
        label: `${t('Health')} 🖤`,
        tooltip: t('Total boss health'),
    };

    // Display behavior info
    if (bossData.behavior) {
        bossProperties['behavior'] = {
            // t('Patrol')
            // t('Rush')
            // t('Stalker')
            // t('Hostile and accurate')
            // t('Patrol and highly armored')
            // t('Group patrol')
            // t('Frequent healing and stim injections')
            // t('Sniper')
            // t('Batshit insane')
            value: t(bossData.behavior),
            label: `${t('Behavior')} 💡`,
            tooltip: t("The boss's general AI behavior"),
        };
    }

    // Format the boss table spawnLocation data
    const spawnLocations = []
    for (const map of bossData.maps) {
        for (const spawn of map.spawns) {
            for (const location of spawn.locations) {
                const chance = map.spawns.length > 1 && location.chance === 1 ? spawn.spawnChance : location.chance;
                spawnLocations.push({
                    spawnLocations: location.name,
                    chance: `${parseInt(chance * 100)}%`,
                    map: map.name
                });
            }
        }
    }

    // Format the boss table escorts data
    const escorts = []
    for (const map of bossData.maps) {
        for (const escort of map.escorts) {
            for (const amount of escort.amount) {
                escorts.push({
                    map: map.name,
                    name: escort.name,
                    normalizedName: escort.normalizedName,
                    chance: `${parseInt(amount.chance * 100)}%`,
                    count: amount.count
                });
            }
        }
    }

    // Return the main react component for the boss page
    return [
        <div className="display-wrapper" key={'boss-display-wrapper'}>
            <div className={'boss-page-wrapper'} key={'boss-page-display-wrapper'}>
                <div className="boss-information-grid">
                    <div className="boss-information-wrapper">
                        <h1>
                            {bossData.name}
                            <Icon
                                path={mdiEmoticonDevil}
                                size={1.5}
                                className="icon-with-text"
                            />
                        </h1>
                        {bossData.wikiLink &&
                            <span className="wiki-link-wrapper">
                                <a href={bossData.wikiLink} target="_blank" rel="noopener noreferrer">
                                    {t('Wiki')}
                                </a>
                            </span>
                        }
                        {bossData.details &&
                            <p className='boss-details'>
                                {t(`${bossData.normalizedName}-description`, { ns: 'bosses' })}
                            </p>
                        }
                    </div>
                    <div className="boss-icon-and-link-wrapper">
                        <img
                            alt={bossData.name}
                            loading="lazy"
                            src={bossData.imagePosterLink}
                        />
                    </div>
                </div>
                <h2 key={'boss-stats-header'}>
                    {t('Boss Stats')}
                    <Icon
                        path={mdiPoll}
                        size={1.5}
                        className="icon-with-text"
                    />
                </h2>
                <PropertyList properties={bossProperties} />

                <h2 key={'boss-loot-header'}>
                    {t('Special Boss Loot')}
                    <Icon
                        path={mdiDiamondStone}
                        size={1.5}
                        className="icon-with-text"
                    />
                </h2>
                <SmallItemTable
                    idFilter={loot.reduce((prev, current) => {
                        prev.push(current.id);
                        return prev;
                    }, [])}
                    attachmentMap={attachmentMap}
                    fleaValue
                    traderValue
                />

                {spawnStatsMsg.length > 0 && 
                <>
                    <h2 key={'boss-spawn-table-header'}>
                        {t('Spawn Locations')}
                        <Icon
                            path={mdiMapLegend}
                            size={1.5}
                            className="icon-with-text"
                        />
                    </h2>
                    <ul>
                        <Trans i18nKey="boss-spawn-table-description">
                            <li>Map: The name of the map which the boss can spawn on</li>
                            <li>Spawn Location: The exact location on the given map which the boss can spawn</li>
                            <li>Chance: If the "Spawn Chance" is activated for the map, this is the estimated chance that the boss will spawn at a given location on that map</li>
                        </Trans>
                    </ul>
                    <DataTable
                        key="boss-spawn-table"
                        columns={columnsLocations}
                        data={spawnLocations}
                        disableSortBy={false}
                        sortBy={'map'}
                        sortByDesc={true}
                        autoResetSortBy={false}
                    />
                </>}

                <h2 key={'boss-escort-table-header'}>
                    {t('Boss Escorts')}
                    <Icon
                        path={mdiAccountGroup}
                        size={1.5}
                        className="icon-with-text"
                    />
                </h2>
                {escorts.length > 0 ?
                    <DataTable
                        key="boss-escort-table"
                        columns={columnsEscorts}
                        data={escorts}
                        disableSortBy={false}
                        sortBy={'name'}
                        sortByDesc={true}
                        autoResetSortBy={false}
                    />
                    :
                    <p>{t('This boss does not have any escorts')}</p>
                }

                {/* cheeki breeki */}
                {bossData.normalizedName === 'killa' &&
                    <div className='killa-party-time'>
                        <h3 key={'killa-party-time'}>
                            {'Killa Party Time?'}
                            <Icon
                                path={mdiPartyPopper}
                                size={1.5}
                                className="icon-with-text"
                            />
                            <p className='killa-party-time-text'>Warning: LOUD</p>
                        </h3>
                        <button style={{ padding: '.2rem', borderRadius: '4px' }} onClick={handleClick}>cheeki breeki</button>
                        {isShown && (
                            <CheekiBreekiEffect />
                        )}
                    </div>
                }
                {/* end cheeki breeki */}
            </div>
        </div>
    ]
}

function Boss() {
    const { t } = useTranslation();
    
    // Get the boss name from the url
    const { bossName } = useParams();
    // Capitalize the first letter of the boss name
    const boss = capitalize(bossName);

    // Return the main react component for the individual boss page
    return [
        <SEO 
            title={`${boss} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('boss-page-description', 'This page includes information on {{bossName}} location, loot, and strategies for defeating him.', { bossName: boss })}
            url={`https://tarkov.dev/boss/${bossName}`}
            image={`${window.location.origin}${process.env.PUBLIC_URL}/images/traders/${bossName}-portrait.png`}
            card='summary_large_image'
            key="seo-wrapper"
        />,
        <Suspense fallback={<Loading />} key={`suspense-boss-page-${bossName}`}>
            <BossPage bossName={bossName} />
        </Suspense>
    ];
}

export default Boss;
