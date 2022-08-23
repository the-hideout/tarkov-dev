import { Helmet } from 'react-helmet';
import React, { Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import capitalize from '../../../modules/capitalize-first';
import formatBossData from '../../../modules/format-boss-data';
import ItemNameCell from '../../../components/item-name-cell';
import { useBossesQuery } from '../../../components/boss-list';
import DataTable from '../../../components/data-table';
import PropertyList from '../../../components/property-list';
import bossJson from '../../../data/boss.json';
import ErrorPage from '../../../components/error-page';
import Loading from '../../../components/loading';
import Icon from '@mdi/react';
import CheekiBreekiEffect from '../../../components/cheeki-breeki-effect';
import { mdiEmoticonDevil, mdiPoll, mdiDiamondStone, mdiMapLegend, mdiAccountGroup, mdiPartyPopper } from '@mdi/js';

import './index.css';
import CenterCell from '../../../components/center-cell';

function BossPage(params) {
    const { t } = useTranslation();

    // cheeki breeki
    const [isShown, setIsShown] = useState(false);

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
                Header: t('Name'),
                accessor: 'name',
                Cell: CenterCell
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
    }, [t]);

    // Format the boss table columns for locations
    const columnsLoot = useMemo(() => {
        return [
            {
                Header: t('Name'),
                accessor: 'name',
                Cell: ItemNameCell
            }
        ];
    }, [t]);

    const bossNameLower = params.bossName

    // Fetch bosses
    const { data: bosses } = useBossesQuery();

    // If no bosses have been returned yet, return 'loading'
    if (!bosses || bosses.length === 0) {
        return <Loading />;
    }

    // Format the boss data
    const bossArray = formatBossData(bosses);

    // Get the correct individual boss data
    var bossData = null;
    for (const boss of bossArray) {
        if (boss.normalizedName === bossNameLower) {
            bossData = boss;
            break;
        }
    }

    // If no boss data has been found, return the error page
    if (!bossData) {
        return <ErrorPage />;
    }

    // Get static boss data from json file
    var bossJsonData = null;
    for (const boss of bossJson) {
        if (boss.normalizedName === bossNameLower) {
            bossJsonData = boss;
        }
    }

    // Collect a list of all maps without duplicates
    var maps = [];
    for (const map of bossData.spawnChance) {
        if (maps.includes(map.map)) {
            continue;
        }
        maps.push(map.map);
    }

    // Format the bossProperties data for the 'stats' section
    var bossProperties = {}
    bossProperties[t('map') + ' 🗺️'] = maps;

    // Collect spawn stats for each map
    var spawnStatsMsg = [];

    // If a specific boss override exists, use that instead of the default from the API
    if (bossJsonData && bossJsonData.spawnChanceOverride) {
        for (const spawn of bossJsonData.spawnChanceOverride) {
            if (bossJsonData.spawnChanceOverrideString === true) {
                spawnStatsMsg.push(`${spawn.chance} (${spawn.map})`)
            } else {
                spawnStatsMsg.push(`${spawn.chance * 100}% (${spawn.map})`);
            }

        }
    } else {
        for (const spawn of bossData.spawnChance) {
            spawnStatsMsg.push(`${spawn.chance * 100}% (${spawn.map})`)
        }
    }

    bossProperties[t('spawnChance') + ` 🎲`] = spawnStatsMsg.join(', ');

    // Display health stats
    if (bossJsonData) {
        bossProperties[t('health') + ' 🖤'] = bossJsonData.health;
    }

    // Display behavior info
    if (bossJsonData) {
        bossProperties[t('behavior') + ' 💡'] = bossJsonData.behavior;
    }

    // Format the boss table spawnLocation data
    const spawnLocations = []
    for (const spawnLocation of bossData.spawnLocations) {
        spawnLocations.push({
            spawnLocations: spawnLocation.name,
            chance: `${parseInt(spawnLocation.chance * 100)}%`,
            map: spawnLocation.map
        });
    }

    // Format the boss table escorts data
    const escorts = []
    for (const escort of bossData.escorts) {
        for (const amount of escort.amount) {
            escorts.push({
                name: escort.name,
                chance: `${parseInt(amount.chance * 100)}%`,
                count: amount.count
            });
        }
    }

    // Return the main react component for the boss page
    return [
        <div className="display-wrapper" key={'boss-display-wrapper'}>
            <div className={'item-page-wrapper'} key={'boss-page-display-wrapper'}>
                <div className="main-information-grid">
                    <div className="item-information-wrapper">
                        <h1 className='h1-boss-name'>
                            {bossData.name}
                            <Icon
                                path={mdiEmoticonDevil}
                                size={1.5}
                                className="icon-with-text"
                            />
                        </h1>
                        {bossJsonData &&
                            <span className="wiki-link-wrapper">
                                <a href={bossJsonData.wikiLink}>
                                    {t('Wiki')}
                                </a>
                            </span>
                        }
                        {bossJsonData &&
                            <p className='boss-details'>{bossJsonData.details}</p>
                        }
                    </div>
                    <div className="icon-and-link-wrapper">
                        <img
                            alt={bossData.name}
                            className={'item-image'}
                            loading="lazy"
                            src={`https://assets.tarkov.dev/${bossData.normalizedName}.jpg`}
                        />
                    </div>
                </div>
                <h2 className='item-h2' key={'boss-stats-header'}>
                    {t('Boss Stats')}
                    <Icon
                        path={mdiPoll}
                        size={1.5}
                        className="icon-with-text"
                    />
                </h2>
                <PropertyList properties={bossProperties} />
                <p>Key:</p>
                <ul>
                    <li>Behavior: The general AI behavior of the given boss</li>
                    <li>Health: Total boss health</li>
                    <li>Spawn Chance: A percentage chance that the boss spawns on a given map</li>
                </ul>

                {bossJsonData &&
                    <h2 className='item-h2' key={'boss-loot-header'}>
                        {t('Unique Boss Loot')}
                        <Icon
                            path={mdiDiamondStone}
                            size={1.5}
                            className="icon-with-text"
                        />
                    </h2>
                }
                {bossJsonData &&
                    <div className='loot-table-boss'>
                        <DataTable
                            columns={columnsLoot}
                            data={bossJsonData.loot}
                            disableSortBy={false}
                            key={'boss-loot-table'}
                            sortBy={'name'}
                            sortByDesc={true}
                            autoResetSortBy={false}
                        />
                    </div>
                }

                <h2 className='item-h2' key={'boss-spawn-table-header'}>
                    {t('Spawn Locations')}
                    <Icon
                        path={mdiMapLegend}
                        size={1.5}
                        className="icon-with-text"
                    />
                </h2>
                <ul>
                    <li>Map: The name of the map which the boss can spawn on</li>
                    <li>Spawn Location: The exact location on the given map which the boss can spawn</li>
                    <li>Chance: If the "Spawn Chance" is activated for the map, this is the estimated chance that the boss will spawn at a given location on that map</li>
                </ul>
                <DataTable
                    columns={columnsLocations}
                    data={spawnLocations}
                    disableSortBy={false}
                    key={'boss-spawn-table'}
                    sortBy={'map'}
                    sortByDesc={true}
                    autoResetSortBy={false}
                />

                <h2 className='item-h2' key={'boss-escort-table-header'}>
                    {t('Boss Escorts')}
                    <Icon
                        path={mdiAccountGroup}
                        size={1.5}
                        className="icon-with-text"
                    />
                </h2>
                {escorts.length > 0 &&
                    <DataTable
                        columns={columnsEscorts}
                        data={escorts}
                        disableSortBy={false}
                        key={'boss-escort-table'}
                        sortBy={'name'}
                        sortByDesc={true}
                        autoResetSortBy={false}
                    />
                }
                {escorts.length === 0 &&
                    <p>This boss does not have any escorts</p>
                }

                {/* cheeki breeki */}
                {bossData.normalizedName === 'killa' &&
                    <div className='killa-party-time'>
                        <h3 className='item-h2' key={'killa-party-time'}>
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
    // Get the boss name from the url
    const { bossName } = useParams();
    // Capitalize the first letter of the boss name
    const boss = capitalize(bossName);

    // Return the main react component for the individual boss page
    return [
        <Helmet key={`boss-helmet-${bossName}`}>
            <meta key={`boss-charset-${bossName}`} charSet="utf-8" />
            <title key={`boss-title-${bossName}`}>{`${boss} - Escape from Tarkov`}</title>
            <meta key={`boss-meta-${bossName}`}
                name="description"
                content={`All the relevant information about ${boss} (boss) in Escape from Tarkov`}
            />
            <link
                key={`boss-canonical-${bossName}`}
                rel="canonical"
                href={`https://tarkov.dev/boss/${bossName}`}
            />
        </Helmet>,
        <Suspense fallback={<Loading />} key={`suspense-boss-page-${bossName}`}>
            <BossPage bossName={bossName} />
        </Suspense>
    ];
}

export default Boss;
