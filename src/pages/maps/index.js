import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import Icon from '@mdi/react';
import { mdiMap } from '@mdi/js';

import './index.css';

import rawMapData from '../../data/maps.json';

function Maps() {
    const { t } = useTranslation();
    return [
        <Helmet key={'maps-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Maps')} - {t('Escape from Tarkov')} - {t('Tarkov.dev')}</title>
            <meta
                name="description"
                content={t('maps-page-description', 'Get the latest information on all maps in Escape from Tarkov, including extract points and loot locations. Find out where to find the best gear and resources in the game')}
            />
        </Helmet>,
        <div className={'page-wrapper'} key="map-page-wrapper">
            <h1 className="center-title">
                {t('Escape from Tarkov')} 
                <Icon path={mdiMap} size={1.5} className="icon-with-text" /> 
                {t('Maps')}
            </h1>
            <div className="page-wrapper map-page-wrapper">
                <p>
                    {"There are 12 different locations on the Escape from Tarkov map, of which 9 have been released publicly so far. Although eventually all maps will be connected, they are currently all apart from one another."}
                </p>
            </div>
            {rawMapData.map((mapsGroup) => {
                return (
                    <>
                        {
                        // t('Streets of Tarkov')
                        // t('Customs')
                        // t('Factory')
                        // t('Interchange')
                        // t('The Lab')
                        // t('Lighthouse')
                        // t('Reserve')
                        // t('Shoreline')
                        // t('Woods')
                        // t('Openworld')
                        }
                        <h2>{t(mapsGroup.name)}</h2>
                        <div className="page-wrapper map-page-wrapper">
                            {mapsGroup.description}
                        </div>
                        <div className="maps-wrapper">
                        {mapsGroup.maps.map((map) => {
                            const { displayText, key } = map;
                            return (
                                <div className="map-wrapper" key={`map-wrapper-${key}`}>
                                    <h3>{displayText}</h3>
                                    <Link to={`/map/${key}`}>
                                        <img
                                            alt={`Map of ${displayText}`}
                                            className="map-image"
                                            loading="lazy"
                                            title={`Map of ${displayText}`}
                                            src={`${process.env.PUBLIC_URL}/maps/${key}_thumb.jpg`}
                                        />
                                    </Link>
                                </div>
                            );
                        })}
                        </div>
                    </>
                );
            })}
        </div>,
    ];
}

export default Maps;
