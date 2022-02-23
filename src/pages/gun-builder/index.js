import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import TarkovGunBuilder from 'tarkov-gun-builder';

import { useItemsQuery } from '../../features/items/queries';

import './index.css';

function GunBuilder() {
    const { t } = useTranslation();
    const [gamePresets, setGamePresets] = useState({});
    const [defaultPresets, setDefaultPresets] = useState([]);
    const { data: items } = useItemsQuery();

    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/data/globals.min.json`)
            .then((response) => response.json())
            .then((presets) => {
                setGamePresets(presets);
            });
    }, []);

    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/data/item_presets.min.json`)
            .then((response) => response.json())
            .then((presets) => {
                setDefaultPresets(presets);
            });
    }, []);

    return [
        <Helmet key={'gun-builder-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov Gun Builder')}</title>
            <meta
                name="description"
                content={`Build any gun in escape from tarkov`}
            />
        </Helmet>,
        <div className="page-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>{t('Escape from Tarkov Gun Builder')}</h1>
            </div>
            <TarkovGunBuilder
                items={items}
                presets={gamePresets.ItemPresets}
                defaultPresets={defaultPresets}
                // defaultConfiguration={defaultConfiguration}
                callback={(data) => {
                    console.log(data);
                    // called every time the configuration changes
                }}
            />
            {/* <pre>{JSON.stringify(items)}</pre> */}
        </div>,
    ];
}

export default GunBuilder;
