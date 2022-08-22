import { Helmet } from 'react-helmet';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import capitalize from '../../../modules/capitalize-first';
import formatBossData from '../../../modules/format-boss-data';
import { useBossesQuery } from '../../../components/boss-list';
import PropertyList from '../../../components/property-list';
import bossJson from '../../../data/boss.json';

import './index.css';

const renderLoader = () => <p>Loading...</p>;

function BossPage(bossName) {
    const { t } = useTranslation();

    const bossNameLower = bossName.bossName

    // Fetch bosses
    const { data: bosses } = useBossesQuery();

    // If no bosses have been returned yet, return 'loading'
    if (!bosses || bosses.length === 0) {
        return 'Loading...';
    }

    // Format the boss data
    const bossArray = formatBossData(bosses);

    // Get the correct individual boss data
    var bossData;
    for (const boss of bossArray) {
        if (boss.name.toLowerCase().replace(/ /g, '-') === bossNameLower) {
            bossData = boss;
            break;
        }
    }

    // Get static boss data from json file
    var bossJsonData;
    for (const boss of bossJson) {
        if (boss.name.toLowerCase().replace(/ /g, '-') === bossNameLower) {
            bossJsonData = boss;
        }
    }

    // Format the bossProperties data for the 'stats' section
    var bossProperties = {}
    bossProperties['map 🗺️'] = Array.from(bossData.map);
    bossProperties['spawnChance 🎲'] = `${bossData.spawnChance * 100}%`;
    bossProperties['health 🖤'] = bossJsonData.health;

    // Return the main react component for the boss page
    return [
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className={'item-page-wrapper'}>
                <div className="main-information-grid">
                    <div className="item-information-wrapper">
                        <h1>
                            {bossData.name}
                        </h1>
                        <span className="wiki-link-wrapper">
                            <a href={`https://escapefromtarkov.fandom.com/wiki/${bossData.name}`}>
                                {t('Wiki')}
                            </a>
                        </span>
                        <p className='boss-details'>{bossJsonData.details}</p>
                    </div>
                    <div className="icon-and-link-wrapper">
                        <img
                            alt={bossData.name}
                            className={'item-image'}
                            loading="lazy"
                            src={`https://assets.tarkov.dev/${bossNameLower}.jpg`}
                        />
                    </div>
                </div>
                <h2 className='item-h2'>{t('Boss Stats')}</h2>
                <PropertyList properties={bossProperties} />
            </div>
        </div>
    ]
}

function Boss() {
    const { bossName } = useParams();
    const boss = capitalize(bossName);

    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{`${boss} - Escape from Tarkov`}</title>
            <meta
                name="description"
                content={`All the relevant information about ${boss} (boss) in Escape from Tarkov`}
            />
            <link
                rel="canonical"
                href={`https://tarkov.dev/boss/${bossName}`}
            />
        </Helmet>,
        <Suspense fallback={renderLoader()}>
            <BossPage bossName={bossName} />
        </Suspense>
    ];
}

export default Boss;
