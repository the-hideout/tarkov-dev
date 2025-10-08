import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { 
    mdiTrophyAward,
    mdiTrendingUp,
} from '@mdi/js';

import SEO from '../../components/SEO.jsx';

import { usePrestigeData } from '../../features/quests/index.js';

import './index.css';

function Prestiges() {
    const { data: prestiges } = usePrestigeData();
    const { t } = useTranslation();

    return [
        <SEO 
            title={`${t('Prestige')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('tasks-page-description', 'Find out everything you need to know about prestige in Escape from Tarkov. Learn complete them and the rewards you can earn.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'} key="quests-page-wrapper">
            <div className="quests-headline-wrapper" key="quests-headline">
                <h1 className="quests-page-title">
                    <Icon path={mdiTrophyAward} size={1.5} className="icon-with-text"/>
                    {t('Prestige')}
                </h1>
            </div>
            <div className="information-section prestige-block">
            <h2>
                <span className="icon">
                    <Icon 
                    path={mdiTrendingUp} 
                    size={1}
                    className="icon-with-text"
                    />
                </span>
                {t('Levels')}
            </h2>
            <div className="page-wrapper prestige-page-wrapper"></div>
            <div className="prestiges-wrapper">
            {prestiges.map((prestige) => {
                return (
                    <div className="prestige-wrapper" key={`prestige-wrapper-${prestige.id}`}>
                        <Link to={`/prestige/${prestige.prestigeLevel}`}>
                            <img
                                alt={prestige.name}
                                className="prestige-image"
                                loading="lazy"
                                src={prestige.iconLink}
                            />
                            <h3>{prestige.name}</h3>
                        </Link>
                    </div>
                );
            })}
            </div>
        </div>
            <div>
                <Trans i18nKey={'prestige-page-p'}>
                    <p>
                        Prestige in Escape from Tarkov provides access to a number of unique cosmetic items.
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Prestiges;
