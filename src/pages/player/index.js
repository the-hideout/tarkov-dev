import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { mdiAccountDetails } from '@mdi/js';

import SEO from '../../components/SEO.jsx';

import useMetaData from '../../features/meta/index.js';
import useAchievementsData from '../../features/achievements/index.js';

//import './index.css';

function Player() {
    const { t } = useTranslation();
    const params = useParams();

    const [accountId, setAccountId] = useState(params.accountId);

    const [playerData, setPlayerData] = useState({
        aid: 0,
        info: {
            nickname: t('Loading'),
            experience: 0,
            side: t('Loading'),
        },
        achievements: {},
    });
    const [profileError, setProfileError] = useState(false);
    console.log(playerData);
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
        for (let i = 0; i < metaData.playerLevels.length; i++) {
            const levelData = metaData.playerLevels[i];
            if (levelData.exp ===  playerData.info.experience) {
                return levelData.level;
            }
            if (levelData.exp > playerData.info.experience) {
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
                    <p>{`${t('Initialization date')}: ${new Date(playerData.info.registrationDate * 1000).toLocaleString()}`}</p>
                )}
                {playerData.info.bannedState && (
                    <p>{t('Banned')}</p>
                )}
                <h2>{t('Achievements')}</h2>
                {Object.keys(playerData.achievements).length ?
                    <ul>
                        {Object.keys(playerData.achievements).map(id => {
                            const ach = achievements.find(a => a.id === id);
                            if (!ach) {
                                return false;
                            }
                            return (
                                <li key={`achievement-${id}`}>
                                    {`${ach.name} ${new Date(playerData.achievements[id] * 1000).toLocaleString()}`}
                                </li>
                            );
                        }).filter(Boolean)}
                    </ul>
                 : <p>{t('None')}</p>}
            </div>
        </div>,
    ];
}

export default Player;
