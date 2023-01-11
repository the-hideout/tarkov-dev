import { Helmet } from 'react-helmet';
import React, { Suspense } from 'react';
import Icon from '@mdi/react';
import { mdiEmoticonDevil } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/loading';

import { BossPageList } from '../../components/boss-list';

import './index.css';

function Bosses(props) {
    const { t } = useTranslation();
    return [
        <Helmet key={'bosses-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Bosses')} - {t('Escape from Tarkov')} - {t('Tarkov.dev')}</title>
            <meta
                name="description"
                content={t('bosses-page-description', 'This page includes information on the all the bosses in the game, their location, loot, escort and strategies for defeating them.')}
            />
        </Helmet>,
        <div className={'page-wrapper'} key="bosses-page-wrapper">
            <h1 className="center-title">
                <Icon
                    path={mdiEmoticonDevil}
                    size={1.5}
                    className="icon-with-text"
                />
                {t('Bosses')}
            </h1>
            <h2 className='bosses-sub-text'>Bosses are feared and deadly enemies with unique gear and traits in Escape from Tarkov</h2>
            <div className="bosses-list-wrapper">
                <Suspense fallback={<Loading />}>
                    <BossPageList />
                </Suspense>
            </div>

            <hr className='desc-line-break'></hr>

            <div className="page-wrapper bosses-page-wrapper">
                <h3>About Bosses</h3>
                <p>
                    {"In Escape from Tarkov, there are many bosses that roam the area of besieged Norvinsk. "}<br />
                    <br />
                    {"Each boss has unique behaviors, characteristics, and tactics. The bosses in Tarkov are feared by players of all levels and will often pose as a greater threat than enemy PMCs in the region."}<br />
                    <br />
                    {"However, with high risk comes high reward. Many bosses contain high tier loot items or are required to elimate for quests."}
                    {"Learning the patterns, locations, and distinct attire of a boss is often the best a player can prepare themselves when a fight begins against a boss in Tarkov."}<br />
                </p>
            </div>
        </div>,
    ];
}

export default Bosses;
