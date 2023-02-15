import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import { mdiMap } from '@mdi/js';

import SEO from '../../components/SEO';

import { useMapsQuery, useMapImages } from '../../features/maps/queries';

import './index.css';

function Maps() {
    const { t } = useTranslation();
    const {data: maps} = useMapsQuery();
    const mapImages = useMapImages();
    const uniqueMaps = Object.values(mapImages).reduce((maps, current) => {
        if (!maps.some(storedMap => storedMap.normalizedName === current.normalizedName)) {
            maps.push({
                name: current.name,
                normalizedName: current.normalizedName,
                description: current.description,
            });
        }
        return maps;
    }, []);
    uniqueMaps.sort((a, b) => { 
        if (a.normalizedName === 'openworld')
            return 1;
        if (b.normalizedName === 'openworld')
            return -1;
        return a.name.localeCompare(b.name);
    });
    return [
        <SEO 
            title={`${t('Maps')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('maps-page-description', 'Get the latest information on all maps in Escape from Tarkov, including extract points and loot locations. Find out where to find the best gear and resources in the game')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'} key="map-page-wrapper">
            <h1 className="center-title">
                {t('Escape from Tarkov')} 
                <Icon path={mdiMap} size={1.5} className="icon-with-text" /> 
                {t('Maps')}
            </h1>
            <div className="page-wrapper map-page-wrapper">
                <Trans i18nKey={'maps-page-p'}>
                    <p>
                        There are 12 different locations on the Escape from Tarkov map, of which 9 have been released publicly so far. Although eventually all maps will be connected, they are currently all apart from one another.
                    </p>
                </Trans>
            </div>
            {uniqueMaps.map((mapsGroup) => {
                return (
                    <div key={mapsGroup.normalizedName}>
                        <h2>
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
                                maps.some(m => m.normalizedName === mapsGroup.normalizedName) ? mapsGroup.name : t(mapsGroup.name)
                            }
                            </h2>
                        <div className="page-wrapper map-page-wrapper">
                            {mapsGroup.description}
                        </div>
                        <div className="maps-wrapper">
                        {Object.values(mapImages)
                        .filter(map => map.normalizedName === mapsGroup.normalizedName)
                        .map((map) => {
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
                    </div>
                );
            })}
        </div>,
    ];
}

export default Maps;
