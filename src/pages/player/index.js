import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { mdiAccountDetails, mdiChevronUp, mdiChevronDown, mdiTrophy, mdiChartLine, mdiBagPersonal, mdiArmFlex, mdiStarBox } from '@mdi/js';
import { TreeView, TreeItem } from '@mui/x-tree-view';

import SEO from '../../components/SEO.jsx';
import DataTable from '../../components/data-table/index.js';
import ItemImage from '../../components/item-image/index.js';

import useItemsData from '../../features/items/index.js';
import useMetaData from '../../features/meta/index.js';
import useAchievementsData from '../../features/achievements/index.js';

import './index.css';

function getDHMS(seconds) {
    // calculate (and subtract) whole days
    const secondsPerDay = 24 * 60 * 60;
    const days = Math.floor(seconds / secondsPerDay);
    seconds -= (days * secondsPerDay);

    // calculate (and subtract) whole hours
    const secondsPerHour = secondsPerDay / 24;
    const hours = Math.floor(seconds / secondsPerHour) % 24;
    seconds -= (hours * secondsPerHour);

    // calculate (and subtract) whole minutes
    const minutes = Math.floor(seconds / 60) % 60;
    seconds -= (minutes * 60);

    return {
        days,
        hours,
        minutes,
        seconds,
    }
}

function Player() {
    const { t } = useTranslation();
    const params = useParams();

    const [accountId, setAccountId] = useState(params.accountId);

    useEffect(() => {
        setAccountId(params.accountId);
    }, [params, setAccountId]);

    const [playerData, setPlayerData] = useState({
        aid: 0,
        info: {
            nickname: t('Loading'),
            side: t('Loading'),
            experience: 0,
            memberCategory: 0,
            bannedState: false,
            bannedUntil: 0,
            registrationDate: 0,
        },
        customization: {},
        skills: {},
        equipment: {},
        achievements: {},
        favoriteItems: [],
        pmcStats: {},
        scavStats: {},
    });
    const [profileError, setProfileError] = useState(false);
    console.log(playerData);
    const { data: items } = useItemsData();
    const { data: metaData } = useMetaData();
    const { data: achievements } = useAchievementsData();

    useEffect(() => {
        async function fetchProfile() {
            if (!accountId) {
                return;
            }
            if (isNaN(accountId)) {
                try {
                    const response = await fetch('https://player.tarkov.dev/name/'+accountId);
                    if (response.status !== 200) {
                        return;
                    }
                    const searchResponse = await response.json();
                    if (searchResponse.err) {
                        setProfileError(`Error searching for profile ${accountId}: ${searchResponse.errmsg}`);
                        return;
                    }
                    for (const result of searchResponse) {
                        if (result.name.toLowerCase() === accountId.toLowerCase()) {
                            setAccountId(result.aid);
                            break;
                        }
                    }
                    return;
                } catch (error) {
                    console.log('Error retrieving player profile', error);
                }
            }
            try {
                const response = await fetch('https://player.tarkov.dev/account/'+accountId);
                if (response.status !== 200) {
                    return;
                }
                const profileResponse = await response.json();
                if (profileResponse.err) {
                    setProfileError(profileResponse.errmsg);
                    return;
                }
                setPlayerData(profileResponse);
            } catch (error) {
                console.log('Error retrieving player profile', error);
            }
        }
        fetchProfile();
    }, [accountId, setPlayerData, setProfileError]);

    const playerLevel = useMemo(() => {
        if (playerData.info.experience === 0) {
            return 0;
        }
        let expTotal = 0;
        for (let i = 0; i < metaData.playerLevels.length; i++) {
            const levelData = metaData.playerLevels[i];
            expTotal += levelData.exp;
            if (expTotal === playerData.info.experience) {
                return levelData.level;
            }
            if (expTotal > playerData.info.experience) {
                return metaData.playerLevels[i - 1].level;
            }
            
        }
        return metaData.playerLevels[metaData.playerLevels.length-1].level;
    }, [playerData, metaData]);

    const pageTitle = useMemo(() => {
        if (!playerData.aid) {
            return t('Loading...');
        }
        return t('{{playerName}} - level {{playerLevel}} {{playerSide}}', {
            playerName: playerData.info.nickname,
            playerLevel,
            playerSide: playerData.info.side,
        });
    }, [playerData, playerLevel, t]);

    const achievementColumns = useMemo(
        () => [
            {
                Header: () => (
                    <div
                      style={{
                        textAlign:'left'
                      }}
                    >{t('Name')}</div>),
                id: 'name',
                accessor: 'name',
            },
            {
                Header: () => (
                    <div
                      style={{
                        textAlign:'left'
                      }}
                    >{t('Description')}</div>),
                id: 'description',
                accessor: 'description',
            },
            {
                Header: t('Player %'),
                id: 'playersCompletedPercent',
                accessor: 'playersCompletedPercent',
                Cell: (props) => {
                    return (
                        <div className="center-content">
                            {props.value}%
                        </div>
                    );
                },
            },
            {
                Header: t('Completed'),
                id: 'completionDate',
                accessor: 'completionDate',
                Cell: (props) => {
                    return (
                        <div className="center-content">
                            {new Date(props.value * 1000).toLocaleString()}
                        </div>
                    );
                },
            },
        ],
        [t],
    );

    const achievementsData = useMemo(() => {
        return achievements?.map(a => {
            if (!playerData.achievements[a.id]) {
                return false;
            }
            return {
                ...a,
                completionDate: playerData.achievements[a.id],
            }
        }).filter(Boolean) || [];
    }, [achievements, playerData]);

    const raidsColumns = useMemo(
        () => [
            {
                Header: (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('Side')}
                    </div>
                ),
                id: 'side',
                accessor: 'side',
                Cell: (props) => {
                    return t(props.value);
                },
            },
            {
                Header: (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('Raids')}
                    </div>
                ),
                id: 'raids',
                accessor: 'raids',
            },
            {
                Header: (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('Survived')}
                    </div>
                ),
                id: 'survived',
                accessor: 'survived',
            },
            {
                Header: (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('Runthrough')}
                    </div>
                ),
                id: 'runthrough',
                accessor: 'runthrough',
                Cell: (props) => {
                    return props.value;
                },
            },
            {
                Header: (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('MIA')}
                    </div>
                ),
                id: 'mia',
                accessor: 'mia',
                Cell: (props) => {
                    return props.value;
                },
            },
            {
                Header: (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('KIA')}
                    </div>
                ),
                id: 'kia',
                accessor: 'kia',
                Cell: (props) => {
                    return props.value;
                },
            },
            {
                Header: (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('Kills')}
                    </div>
                ),
                id: 'kills',
                accessor: 'kills',
                Cell: (props) => {
                    return props.value;
                },
            },
            {
                Header: (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('K:D', {nsSeparator: '|'})}
                    </div>
                ),
                id: 'kdr',
                accessor: 'kills',
                Cell: (props) => {
                    return (props.value / props.row.original.kia).toFixed(2);
                },
            },
        ],
        [t],
    );

    const raidsData = useMemo(() => {
        if (!playerData.pmcStats?.eft) {
            return [];
        }
        const statSides = {'pmcStats': 'PMC', 'scavStats': 'Scav'};
        const statTypes = [
            {
                name: 'raids',
                key: ['Sessions'],
            },
            {
                name: 'survived',
                key: ['ExitStatus', 'Survived'],
            },
            {
                name: 'runthrough',
                key: ['ExitStatus', 'Runner'],
            },
            {
                name: 'mia',
                key: ['ExitStatus', 'Left'],
            },
            {
                name: 'kia',
                key: ['ExitStatus', 'Killed'],
            },
            {
                name: 'kills',
                key: ['Kills'],
            },
        ];
        const getStats = (side) => {
            return {
                side,
                ...statTypes.reduce((all, s) => {
                    all[s.name] = 0;
                    return all;
                }, {})
            };
        };
        const totalStats = getStats('Total');
        const statsData = [totalStats];
        for (const sideKey in statSides) {
            const sideLabel = statSides[sideKey];
            const stats = playerData[sideKey].eft.overAllCounters.Items;
            const currentData = getStats(sideLabel);
            for (const st of statTypes) {
                const foundStat = stats.find(s => !st.key.some(keyPart => !s.Key.includes(keyPart)));
                //console.log(sideKey, st, foundStat);
                currentData[st.name] = foundStat?.Value || 0;
                totalStats[st.name] += currentData[st.name];
            }
            statsData.push(currentData);
        }
        //console.log(statsData);
        return statsData;
    }, [playerData]);

    const skillsColumns = useMemo(
        () => [
            {
                Header: (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('Skill')}
                    </div>
                ),
                id: 'skill',
                accessor: 'skill',
                Cell: (props) => {
                    return t(props.value);
                },
            },
            {
                Header: (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('Level')}
                    </div>
                ),
                id: 'progress',
                accessor: 'progress',
                Cell: (props) => {
                    return (props.value / 100).toFixed(2);
                },
            },
            {
                Header: (
                    <div style={{textAlign:'left', paddingLeft:'10px'}}>
                        {t('Last Access')}
                    </div>
                ),
                id: 'lastAccess',
                accessor: 'lastAccess',
                Cell: (props) => {
                    return new Date(props.value * 1000).toLocaleString();
                },
            },
        ],
        [t],
    );

    const skillsData = useMemo(() => {
        return playerData.skills?.Common?.map(s => {
            if (!s.Progress || s.LastAccess <= 0) {
                return false;
            }
            return {
                skill: s.Id,
                progress: s.Progress,
                lastAccess: s.LastAccess,
            }
        }).filter(Boolean) || [];
    }, [playerData]);

    const totalSecondsInGame = useMemo(() => {
        return playerData.pmcStats?.eft?.totalInGameTime || 0;
    }, [playerData]);

    const getLoadoutContents = useCallback((parentItem) => {
        return playerData?.equipment?.Items.reduce((contents, loadoutItem) => {
            if (loadoutItem.parentId !== parentItem._id) {
                return contents;
            }
            let item = items.find(i => i.id === loadoutItem._tpl);
            if (!item) {
                return contents;
            }
            if (item.properties?.defaultPreset) {
                const preset = items.find(i => i.id === item.properties.defaultPreset.id);
                item = {
                    ...item,
                    width: preset.width,
                    height: preset.height,
                    baseImageLink: preset.baseImageLink,
                };
            }
            let countLabel;

            let label = '';
            if (loadoutItem.upd?.StackObjectsCount > 1) {
                countLabel = loadoutItem.upd?.StackObjectsCount;
            }
            if (loadoutItem.upd?.Dogtag) {
                const tag = loadoutItem.upd.Dogtag;
                const weapon = items.find(i => i.id === tag.WeaponName?.split(' ')[0]);
                countLabel = tag.Level;
                label = (
                    <span>
                        <Link to={`/player/${tag.AccountId}`}>{tag.Nickname}</Link>
                        <span>{` ${t(tag.Status)} `}</span>
                        <Link to={`/player/${tag.KillerAccountId || tag.KillerName}`}>{tag.KillerName}</Link>
                        {weapon !== undefined && [
                            <span key={'weapon-using-label'}>{` ${t('using')} `}</span>,
                            <Link key={`weapon-using ${weapon.id}`} to={`/item/${weapon.normalizedName}`}>{weapon.name}</Link>
                        ]}
                        <span>{` ${new Date(tag.Time).toLocaleString()}`}</span>
                    </span>
                );
            }
            if (loadoutItem.upd?.Key) {
                const key = items.find(i => i.id === loadoutItem._tpl);
                if (key) {
                    countLabel = `${key.properties.uses-loadoutItem.upd.Key.NumberOfUsages}/${key.properties.uses}`;
                }
            }
            if (loadoutItem.upd?.Repairable) {
                countLabel = `${loadoutItem.upd.Repairable.Durability}/${loadoutItem.upd.Repairable.MaxDurability}`
            }
            if (loadoutItem.upd?.MedKit) {
                const item = items.find(i => i.id === loadoutItem._tpl);
                if (item?.properties?.uses || item?.properties?.hitpoints) {
                    countLabel = `${loadoutItem.upd.MedKit.HpResource}/${item.properties?.uses || item.properties?.hitpoints}`;
                }
            }

            const itemImage = (
                <ItemImage
                    item={item}
                    imageField="baseImageLink"
                    linkToItem={false}
                    count={countLabel}
                />
            );
            contents.push((
                <TreeItem key={`loadout-item-${loadoutItem._id}`} nodeId={loadoutItem._id} icon={itemImage} label={label}>
                    {getLoadoutContents(loadoutItem)}
                </TreeItem>
            ));
            return contents;
        }, []);
    }, [items, playerData, t]);

    return [
        <SEO 
            title={`${t('Player Profile')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('player-page-description', 'View player profile.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'} key="player-page-wrapper">
            <div className="player-headline-wrapper" key="player-headline">
                <h1 className="player-page-title">
                    <Icon path={mdiAccountDetails} size={1.5} className="icon-with-text"/>
                    {pageTitle}
                </h1>
            </div>
            <div>
                {profileError && (
                    <p>{profileError}</p>
                )}
                {playerData.info.registrationDate && (
                    <p>{`${t('Started current wipe')}: ${new Date(playerData.info.registrationDate * 1000).toLocaleString()}`}</p>
                )}
                {playerData.info.bannedState && (
                    <p>{t('Banned')}</p>
                )}
                {totalSecondsInGame > 0 && (
                    <p>{`${t('Total account time in game')}: ${(() => {
                        const { days, hours, minutes, seconds } = getDHMS(totalSecondsInGame);

                        return t('{{days}} days, {{hours}} h, {{minutes}} m, {{seconds}} s', {
                            days,
                            hours,
                            minutes,
                            seconds
                        });
                    })()}`}</p>
                )}
                <h2><Icon path={mdiChartLine} size={1.5} className="icon-with-text"/>{t('Raid Stats')}</h2>
                {Object.keys(playerData.pmcStats).length > 0 ?
                    <DataTable
                        key="raids-table"
                        columns={raidsColumns}
                        data={raidsData}
                    />
                : <p>{t('None')}</p>}
                <h2><Icon path={mdiTrophy} size={1.5} className="icon-with-text"/>{t('Achievements')}</h2>
                {Object.keys(playerData.achievements).length > 0 ?
                    <DataTable
                        key="achievements-table"
                        columns={achievementColumns}
                        data={achievementsData}
                    />
                 : <p>{t('None')}</p>}
                <h2><Icon path={mdiBagPersonal} size={1.5} className="icon-with-text"/>{t('Loadout')}</h2>
                {playerData?.equipment?.Id !== undefined && (
                    <TreeView
                        defaultExpandIcon={<Icon path={mdiChevronDown} size={1.5} className="icon-with-text"/>}
                        defaultCollapseIcon={<Icon path={mdiChevronUp} size={1.5} className="icon-with-text"/>}
                        defaultParentIcon={<span>***</span>}
                    >
                        {getLoadoutContents(playerData.equipment.Items.find(i => i._id === playerData.equipment.Id))}
                    </TreeView>
                )}
                <h2><Icon path={mdiArmFlex} size={1.5} className="icon-with-text"/>{t('Skills')}</h2>
                {playerData.skills?.Common?.length > 0 &&  (
                    <DataTable
                        key="skills-table"
                        columns={skillsColumns}
                        data={skillsData}
                    />
                )}
                <h2><Icon path={mdiStarBox} size={1.5} className="icon-with-text"/>{t('Mastering')}</h2>
                {playerData.skills?.Mastering?.length > 0 &&  (
                    <ul>
                        {playerData.skills.Mastering.map(skillData => {
                            if (skillData.Progress <= 1) {
                                return false;
                            }
                            return (
                                <li key={`skill-${skillData.Id}`}>{`${t(skillData.Id)}: ${skillData.Progress}`}</li>
                            );
                        }).filter(Boolean)}
                    </ul>
                )}
            </div>
        </div>,
    ];
}

export default Player;
