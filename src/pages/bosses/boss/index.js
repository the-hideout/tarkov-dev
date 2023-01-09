import { Helmet } from 'react-helmet';
import React, { Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import capitalize from '../../../modules/capitalize-first';
import formatBossData from '../../../modules/format-boss-data';
import { useMapsQuery } from '../../../features/maps/queries';
import DataTable from '../../../components/data-table';
import PropertyList from '../../../components/property-list';
import bossJson from '../../../data/boss.json';
import ErrorPage from '../../../components/error-page';
import Loading from '../../../components/loading';
import SmallItemTable from '../../../components/small-item-table';
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
                Header: t('Map'),
                accessor: 'map',
                Cell: CenterCell
            },
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

    const bossNameLower = params.bossName

    // Fetch maps
    const { data: maps } = useMapsQuery();

    // If no maps have been returned yet, return 'loading'
    if (!maps || maps.length === 0) {
        return <Loading />;
    }

    // Format the boss data
    const bossArray = formatBossData(maps);

    // Get the correct individual boss data
    var bossData = bossArray.find(boss => boss.normalizedName === bossNameLower);

    // If no boss data has been found, return the error page
    if (!bossData) {
        return <ErrorPage />;
    }

    // Get static boss data from json file
    var bossJsonData = bossJson.find(boss => boss.normalizedName === bossNameLower);

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
    bossProperties[t('map') + ' 🗺️'] = bossMaps;

    // Collect spawn stats for each map
    var spawnStatsMsg = [];

    for (const map of bossData.maps) {
        // If a specific boss override exists, use that instead of the default from the API
        const spawnChanceOverride = bossJsonData?.spawnChanceOverride?.find(override => override.map === map.normalizedName);
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
        upperBound = upperBound * 100;
        lowerBound = lowerBound * 100;
        let displayPercent = `${lowerBound}-${upperBound}`;
        if (lowerBound === upperBound || upperBound === 100) {
            displayPercent = upperBound;
        } 
        spawnStatsMsg.push(`${displayPercent}% (${map.name})`)
    }

    bossProperties['spawnChance'] = {
        value: spawnStatsMsg.join(', '),
        label: `${t('Spawn chance')} 🎲`,
        tooltip: t('Chance that the boss spawns on a given map'),
    };

    // Display health stats
    if (bossJsonData) {
        bossProperties['health'] = {
            value: bossJsonData.health,
            label: `${t('Health')} 🖤`,
            tooltip: t('Total boss health'),
        };
    }

    // Display behavior info
    if (bossJsonData) {
        bossProperties['behavior'] = {
            // t('patrol')
            // t('rush')
            // t('stalker')
            // t('hostile and accurate')
            // t('patrol and highly armored')
            // t('group patrol')
            // t('frequent healing and stim injections')
            // t('sniper')
            // t('batshit insane')
            value: bossJsonData.behavior,
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
                    chance: `${parseInt(amount.chance * 100)}%`,
                    count: amount.count
                });
            }
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

                {bossJsonData &&
                    <h2 className='item-h2' key={'boss-loot-header'}>
                        {t('Special Boss Loot')}
                        <Icon
                            path={mdiDiamondStone}
                            size={1.5}
                            className="icon-with-text"
                        />
                    </h2>
                }
                {bossJsonData &&
                    <div className='loot-table-boss'>
                        <SmallItemTable
                            idFilter={bossJsonData.loot.reduce((prev, current) => {
                                prev.push(current.id);
                                return prev;
                            }, [])}
                            fleaValue
                            traderValue
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
    const { t } = useTranslation();
    
    // Get the boss name from the url
    const { bossName } = useParams();
    // Capitalize the first letter of the boss name
    const boss = capitalize(bossName);

    // Return the main react component for the individual boss page
    return [
        <Helmet key={`boss-helmet-${bossName}`}>
            <meta key={`boss-charset-${bossName}`} charSet="utf-8" />
            <title key={`boss-title-${bossName}`}>{boss} - {t('Escape from Tarkov')} - {t('Tarkov.dev')}</title>
            <meta key={`boss-meta-${bossName}`}
                name="description"
                content={t('This page includes information on {{bossName}} location, loot, and strategies for defeating him.', { bossName: boss })}
            />
            <link
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
