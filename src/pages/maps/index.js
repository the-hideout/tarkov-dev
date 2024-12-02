import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { mdiMap } from '@mdi/js';

import SEO from '../../components/SEO.jsx';

import { mapIcons, useMapImagesSortedArray } from '../../features/maps/index.js';

import './index.css';
import { HashLink } from 'react-router-hash-link';

function Maps() {
    const { t } = useTranslation();
    const mapImagesSortedArray = useMapImagesSortedArray();
    const uniqueMaps = mapImagesSortedArray.reduce((maps, current) => {
        if (!maps.some(storedMap => storedMap.normalizedName === current.normalizedName)) {
            maps.push({
                name: current.name,
                normalizedName: current.normalizedName,
                description: current.description,
            });
        }
        return maps;
    }, []);
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
                        There are 11 different locations on the Escape from Tarkov map, of which 10 have been released publicly so far.
                        Although eventually all maps will be connected, they are currently all apart from one another.
                    </p>
                </Trans>

                <nav>
                  {uniqueMaps.map((map) => (
                      <div key={`map-link-${map.normalizedName}`}>
                            <HashLink to={`/maps#${map.normalizedName}`}>
                                <Icon 
                                    path={mapIcons[map.normalizedName]} 
                                    size={1}
                                    className="icon-with-text"
                                />
                                {map.name}
                            </HashLink>
                      </div>
                    ))}
                </nav>

            </div>
            {uniqueMaps.map((mapsGroup) => {
                return (
                    <div key={mapsGroup.normalizedName} id={mapsGroup.normalizedName}>
                        <h2>
                            {
                                // t('Streets of Tarkov')
                                // t('Ground Zero')
                                // t('Customs')
                                // t('Factory')
                                // t('Interchange')
                                // t('The Lab')
                                // t('Lighthouse')
                                // t('Reserve')
                                // t('Shoreline')
                                // t('Woods')
                                // t('Openworld')
                                mapsGroup.name
                            }
                            <Icon 
                                path={mapIcons[mapsGroup.normalizedName]} 
                                size={1}
                                className="icon-with-text"
                            />
                        </h2>
                        <div className="page-wrapper map-page-wrapper">
                            {mapsGroup.description}
                        </div>
                        <div className="maps-wrapper">
                        {mapImagesSortedArray
                        .filter(map => map.normalizedName === mapsGroup.normalizedName)
                        .map((map) => {
                            const { displayText, key, imageThumb } = map;
                            let mapImageLink = `${process.env.PUBLIC_URL}${imageThumb}`;
                            if (map.projection === 'interactive') {
                                let path = map.svgPath || map.tilePath || `https://assets.tarkov.dev/maps/${map.normalizedName}/{z}/{x}/{y}.png`;
                                mapImageLink = path.replace(/{[xyz]}/g, '0');
                            }
                            return (
                                <div className="map-wrapper" key={`map-wrapper-${key}`}>
                                    <h3>{displayText}</h3>
                                    <Link to={`/map/${key}`}>
                                        <img
                                            alt={t('Map of {{mapName}}', {mapName: displayText})}
                                            className="map-image"
                                            loading="lazy"
                                            title={t('Map of {{mapName}}', {mapName: displayText})}
                                            src={mapImageLink}
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
