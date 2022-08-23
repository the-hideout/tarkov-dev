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
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Maps')}</title>
            <meta
                name="description"
                content="Escape from Tarkov maps and loot locations"
            />
        </Helmet>,
        <div className={'page-wrapper'} key="map-page-wrapper">
            <h1 className="center-title">
                {t('Escape from Tarkov')} 
                <Icon path={mdiMap} size={1.5} className="icon-with-text" /> 
                {t('Maps')}
            </h1>
            {rawMapData.map((mapsGroup) => {
                return (
                    <>
                        <h2>{mapsGroup.name}</h2>
                        <div className="page-wrapper map-page-wrapper">
                            {mapsGroup.description}
                        </div>
                        <div className="maps-wrapper">
                        {mapsGroup.maps.map((amap) => {
                            const { displayText, key } = amap;
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
            <div className="page-wrapper map-page-wrapper">
                <p>
                    {"There are 12 different locations on the Escape from Tarkov map, of which 8 have been released publicly so far. Although eventually all maps will be connected, they are currently all apart from one another."}
                </p>
            </div>
        </div>,
    ];
}

export default Maps;
