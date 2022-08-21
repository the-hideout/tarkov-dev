import { Helmet } from 'react-helmet';
import React, { Suspense } from 'react';
import Icon from '@mdi/react';
import { mdiEmoticonDevil } from '@mdi/js';
import { useTranslation } from 'react-i18next';

import { BossPageList } from '../../components/boss-list';

import './index.css';

const renderLoader = () => <p>Loading...</p>;

function Bosses(props) {
    const { t } = useTranslation();
    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>Escape from Tarkov Bosses</title>
            <meta
                name="description"
                content="Escape from Tarkov Bosses, boss details, and more"
            />
        </Helmet>,
        <div className={'page-wrapper'} key="boss-page-wrapper">
            <h1 className="center-title">
                <Icon
                    path={mdiEmoticonDevil}
                    size={1.5}
                    className="icon-with-text"
                />
                {t('Bosses')}
            </h1>
            <div className="boss-list-wrapper">
                <Suspense fallback={renderLoader()}>
                    <BossPageList />
                </Suspense>
            </div>

            <div className="page-wrapper boss-page-wrapper">
                <p>
                    {"The backbones of trade in the destroyed, besieged Norvinsk. In Escape from Tarkov, each merchant specialized in a particular kind of products, such as medical supplies, weaponry, or military equipment. Although their prices are typically high, you get what you pay for."}<br />
                    <br />
                    {"More importantly, you can develop a reputation with each trader through Quests, which will enable you to receive better offers generally and reduce the commission they receive (an additional markup you pay on sales and purchases), among other benefits."}<br />
                    <br />
                    {"Additionally, traders provide other services like insurance and repairs (allowing you to recover your gear in case of death during a raid)."}
                </p>
            </div>
        </div>,
    ];
}

export default Bosses;
