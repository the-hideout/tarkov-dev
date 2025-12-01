import { Trans, useTranslation } from 'react-i18next';
import { useState } from 'react';

import { Icon } from '@mdi/react';
import {mdiArchive} from '@mdi/js';

import SEO from '../../../components/SEO.jsx';
import SmallItemTable from '../../../components/small-item-table/index.jsx';
import { Filter, ToggleFilter } from '../../../components/filter/index.jsx';

function Containers(props) {
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [showNetPPS, setShowNetPPS] = useState(false);
    const { t } = useTranslation();
    return [
        <SEO 
            title={`${t('Containers')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description="This page includes a sortable table with information on the different types of containers available in the game, including their price, slot-ratio, size, and other characteristics."
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiArchive} size={1.5} className="icon-with-text" /> 
                    {t('Containers')}
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
                        onChange={(e) => {setShowNetPPS(!showNetPPS)}}
                        checked={showNetPPS}
                    />
                </Filter>
            </div>

            <SmallItemTable
                typeFilter="container"
                cheapestPrice={1}
                gridSlots
                innerSize
                slotRatio
                pricePerSlot
                showContainedItems
                showNetPPS={showNetPPS}
                showAllSources={showAllItemSources}
                sortBy='pricePerSlot'
            />

            <div className="page-wrapper containers-page-wrapper">
                <Trans i18nKey={'containers-page-p'}>
                    <p>
                        {"As their name implies, containers in Escape from Tarkov are items used to hold other things. Some of these items are used to clear up inventory space by acting as storage and taking up less inventory slots however some of them cannot be equipped on the character."}
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Containers;
