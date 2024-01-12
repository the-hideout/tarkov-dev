import React, { Suspense } from 'react';
import { Icon } from '@mdi/react';
import { Trans, useTranslation } from 'react-i18next';

import { mdiEmoticonDevil } from '@mdi/js';

import SEO from '../../components/SEO.jsx';
import Loading from '../../components/loading/index.js';
import { BossPageList } from '../../components/boss-list/index.js';

import './index.css';

function Bosses(props) {
    const { t } = useTranslation();
    return [
        <SEO 
            title={`${t('Bosses')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('bosses-page-description', 'This page includes information on the all the bosses in the game, their location, loot, escort and strategies for defeating them.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'} key="bosses-page-wrapper">
            <h1 className="center-title">
                <Icon
                    path={mdiEmoticonDevil}
                    size={1.5}
                    className="icon-with-text"
                />
                {t('Bosses')}
            </h1>
            <h2 className='boss-sub-text'>{t('Bosses are feared and deadly enemies with unique gear and traits in Escape from Tarkov')}</h2>
            <div className="boss-list-wrapper">
                <Suspense fallback={<Loading />}>
                    <BossPageList />
                </Suspense>
            </div>
            <hr className='desc-line-break' />
            <div className="bosses-page-wrapper">
                <h3>{t('About Bosses')}</h3>
                <Trans i18nKey={'bosses-page-p'}>
                    <p>
                        In Escape from Tarkov, there are many bosses that roam the area of besieged Norvinsk.
                    </p>
                    <p>
                        Each boss has unique behaviors, characteristics, and tactics. The bosses in Tarkov are feared by players of all levels and will often pose as a greater threat than enemy PMCs in the region.
                    </p>
                    <p>
                        However, with high risk comes high reward. Many bosses contain high tier loot items or are required to elimate for quests.
                        Learning the patterns, locations, and distinct attire of a boss is often the best a player can prepare themselves when a fight begins against a boss in Tarkov.
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Bosses;
