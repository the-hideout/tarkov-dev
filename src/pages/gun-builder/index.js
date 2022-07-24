import { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import TarkovGunBuilder from 'tarkov-gun-builder';

import { useItemsQuery } from '../../features/items/queries';
import { Filter, ToggleFilter } from '../../components/filter';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

import './index.css';

function GunBuilder() {
    const { t } = useTranslation();
    const [gamePresets, setGamePresets] = useState({});
    const [defaultPresets, setDefaultPresets] = useState([]);
    const { data: items } = useItemsQuery();
    const [showOnlyTrader, setShowOnlyTrader] = useStateWithLocalStorage(
        'showOnlyTraderModsInBuilder',
        false,
    );

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

    const availableItemIds = useMemo(() => {
        return items
            .filter((item) => {
                return item.buyFor.length > 0;
            })
            .filter((item) => {
                if (!showOnlyTrader) {
                    return true;
                }

                // At least one trader price
                if (item.buyFor.length > 1) {
                    return true;
                }

                // One price that's not from flea market
                if (item.buyFor[0].source !== 'flea-market') {
                    return true;
                }

                return false;
            })
            .map((item) => {
                return item.id;
            });
    }, [items, showOnlyTrader]);

    return [
        <Helmet key={'gun-builder-helmet'}>
            <meta charSet="utf-8" />
            <title>
                {t('Escape from Tarkov')} - {t('Gun Builder')}
            </title>
            <meta
                name="description"
                content={`Build any gun in escape from tarkov`}
            />
        </Helmet>,
        <div className="page-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')} - {t('Gun Builder')}
                </h1>
                <Filter>
                    <ToggleFilter
                        checked={showOnlyTrader}
                        label={t('Show only items available from traders')}
                        onChange={(e) => setShowOnlyTrader(!showOnlyTrader)}
                        // tooltipContent={
                        //     <div>
                        //         {t(
                        //             'Dogtags are very hard to calulcate values for as they depend on level. Most calculations with them are wrong',
                        //         )}
                        //     </div>
                        // }
                    />
                </Filter>
            </div>
            <TarkovGunBuilder
                avialableItemIds={availableItemIds}
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
