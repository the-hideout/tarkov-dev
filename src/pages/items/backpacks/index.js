import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import {mdiBagPersonal} from '@mdi/js';

import { Filter, ToggleFilter } from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';

function Backpacks() {
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [showNetPPS, setShowNetPPS] = useState(false);
    const { t } = useTranslation();

    return [
        <Helmet key={'backpacks-table'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Backpacks Chart')}</title>
            <meta
                name="description"
                content="All backpacks in Escape from Tarkov sortable by price, size etc"
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiBagPersonal} size={1.5} className="icon-with-text" /> 
                    {t('Backpacks Chart')}
                </h1>
                <Filter>
                    <ToggleFilter
                        checked={showAllItemSources}
                        label={t('Ignore settings')}
                        onChange={(e) =>
                            setShowAllItemSources(!showAllItemSources)
                        }
                        tooltipContent={
                            <>
                                {t('Shows all sources of items regardless of your settings')}
                            </>
                        }
                    />
                    <ToggleFilter
                        label={t('Net price per slot')}
                        tooltipContent={t('Show price per additional slot of storage gained from the container')}
                        onChange={(e) => setShowNetPPS(!showNetPPS)}
                        checked={showNetPPS}
                    />
                </Filter>
            </div>

            <SmallItemTable
                typeFilter={'backpack'}
                showNetPPS={showNetPPS}
                showAllSources={showAllItemSources}
                showRestrictedType={'backpack'}
                grid={1}
                innerSize={2}
                weight={3}
                cheapestPrice={4}
                pricePerSlot={5}
            />
            
            <div className="page-wrapper items-page-wrapper">
                <p>
                    {"Backpacks in the Escape from Tarkov game are various-sized containers for carrying your hard-earned riches."}
                </p>
            </div>
        </div>,
    ];
}

export default Backpacks;
