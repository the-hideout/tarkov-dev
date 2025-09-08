import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import {mdiBagPersonal} from '@mdi/js';

import SEO from '../../../components/SEO.jsx';
import { Filter, ToggleFilter } from '../../../components/filter/index.js';
import SmallItemTable from '../../../components/small-item-table/index.js';

function Backpacks() {
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [showNetPPS, setShowNetPPS] = useState(false);
    const { t } = useTranslation();

    return [
        <SEO 
            title={`${t('Backpacks')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('backpacks-page-description', 'This page includes a sortable table with information on the different types of backpacks available in the game, including their price, size, capacity, and other characteristics.')}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiBagPersonal} size={1.5} className="icon-with-text" /> 
                    {t('Backpacks')}
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
                slotsPerWeight={4}
                cheapestPrice={5}
                pricePerSlot={6}
                sortBy='pricePerSlot'
            />
            
            <div className="page-wrapper backpacks-page-wrapper">
                <Trans i18nKey={'backpacks-page-p'}>
                    <p>
                        {"Backpacks in the Escape from Tarkov game are various-sized containers for carrying your hard-earned riches."}
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Backpacks;
