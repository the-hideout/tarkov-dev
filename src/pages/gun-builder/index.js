import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import TarkovGunBuilder from 'tarkov-gun-builder';

import { selectAllItems, fetchItems } from '../../features/items/itemsSlice';

import './index.css';

function GunBuilder() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const items = useSelector(selectAllItems);
    const itemStatus = useSelector((state) => {
        return state.items.status;
    });
    const [gamePresets, setGamePresets] = useState({});
    const [defaultPresets, setDefaultPresets] = useState([]);

    useEffect(() => {
        let timer = false;
        if (itemStatus === 'idle') {
            dispatch(fetchItems());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchItems());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [itemStatus, dispatch]);

    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/data/globals.min.json`)
            .then((response) => response.json())
            .then((presets) => {
                setGamePresets(presets);
            });
    });

    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/data/item_presets.min.json`)
            .then((response) => response.json())
            .then((presets) => {
                setDefaultPresets(presets);
            });
    });

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
