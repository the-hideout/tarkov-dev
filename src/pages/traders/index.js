import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '@mdi/react';
import { mdiAccountGroup } from '@mdi/js';
import { useTranslation } from 'react-i18next';

import TraderResetTime from '../../components/trader-reset-time';

import './index.css';

function Traders(props) {
    const { t } = useTranslation();
    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>Escape from Tarkov Traders</title>
            <meta
                name="description"
                content="Escape from Tarkov Trader items, barters, unlocks and spending guides"
            />
        </Helmet>,
        <div className={'page-wrapper'} key="traders-page-wrapper">
            <h1 className="center-title">
                <Icon
                    path={mdiAccountGroup}
                    size={1.5}
                    className="icon-with-text"
                />
                {t('Traders')}
            </h1>
            <div className="traders-list-wrapper">
                <Link to={`/traders/prapor`} className="screen-link">
                    <h2 className="center-title">{t('Prapor')}</h2>
                    <img
                        alt={'Prapor'}
                        loading="lazy"
                        src={`${process.env.PUBLIC_URL}/images/prapor-icon.jpg`}
                    />
                    <TraderResetTime center trader="prapor" />
                </Link>
                <Link to={`/traders/therapist`} className="screen-link">
                    <h2 className="center-title">{t('Therapist')}</h2>
                    <img
                        alt={'Therapist'}
                        loading="lazy"
                        src={`${process.env.PUBLIC_URL}/images/therapist-icon.jpg`}
                    />
                    <TraderResetTime center trader="therapist" />
                </Link>
                <Link to={`/traders/skier`} className="screen-link">
                    <h2 className="center-title">{t('Skier')}</h2>
                    <img
                        alt={'Skier'}
                        loading="lazy"
                        src={`${process.env.PUBLIC_URL}/images/skier-icon.jpg`}
                    />
                    <TraderResetTime center trader="skier" />
                </Link>
                <Link to={`/traders/peacekeeper`} className="screen-link">
                    <h2 className="center-title">{t('Peacekeeper')}</h2>
                    <img
                        alt={'Peacekeeper'}
                        loading="lazy"
                        src={`${process.env.PUBLIC_URL}/images/peacekeeper-icon.jpg`}
                    />
                    <TraderResetTime center trader="peacekeeper" />
                </Link>
                <Link to={`/traders/mechanic`} className="screen-link">
                    <h2 className="center-title">{t('Mechanic')}</h2>
                    <img
                        alt={'Mechanic'}
                        loading="lazy"
                        src={`${process.env.PUBLIC_URL}/images/mechanic-icon.jpg`}
                    />
                    <TraderResetTime center trader="mechanic" />
                </Link>
                <Link to={`/traders/ragman`} className="screen-link">
                    <h2 className="center-title">{t('Ragman')}</h2>
                    <img
                        alt={'Ragman'}
                        loading="lazy"
                        src={`${process.env.PUBLIC_URL}/images/ragman-icon.jpg`}
                    />
                    <TraderResetTime center trader="ragman" />
                </Link>
                <Link to={`/traders/jaeger`} className="screen-link">
                    <h2 className="center-title">{t('Jaeger')}</h2>
                    <img
                        alt={'Jaeger'}
                        loading="lazy"
                        src={`${process.env.PUBLIC_URL}/images/jaeger-icon.jpg`}
                    />
                    <TraderResetTime center trader="jaeger" />
                </Link>
            </div>

            <div className="page-wrapper trader-page-wrapper">
                <p>
                    {"The backbones of trade in the destroyed, besieged Norvinsk. In Escape from Tarkov, each merchant specialized in a particular kind of products, such as medical supplies, weaponry, or military equipment. Although their prices are typically high, you get what you pay for."}<br/>
                    <br/>
                    {"More importantly, you can develop a reputation with each trader through Quests, which will enable you to receive better offers generally and reduce the commission they receive (an additional markup you pay on sales and purchases), among other benefits."}<br/>
                    <br/>
                    {"Additionally, traders provide other services like insurance and repairs (allowing you to recover your gear in case of death during a raid)."}
                </p>
            </div>
        </div>,
    ];
}

export default Traders;
