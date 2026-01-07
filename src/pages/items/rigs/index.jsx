import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import {mdiTshirtCrewOutline} from '@mdi/js';

import SEO from '../../../components/SEO.jsx';
import { Filter, ToggleFilter, SliderFilter } from '../../../components/filter/index.jsx';
import SmallItemTable from '../../../components/small-item-table/index.jsx';

import useStateWithLocalStorage from '../../../hooks/useStateWithLocalStorage.jsx';

import useItemsData from '../../../features/items/index.js';

const marks = {
    0: 25,
    5: 20,
    10: 15,
    15: 10,
    20: 5,
    25: 0,
};

function Rigs() {
    const { data: items } = useItemsData();

    const [includeArmoredRigs, setIncludeArmoredRigs] =
        useStateWithLocalStorage('includeArmoredRigs', true);
    const [minSlots, setMinSlots] = useStateWithLocalStorage('minSlots', 0);
    const [has3Slot, setHas3Slot] = useState(false);
    const [has4Slot, setHas4Slot] = useState(false);
    const [showNetPPS, setShowNetPPS] = useState(false);
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const { t } = useTranslation();

    const displayItems = useMemo(
        () => items.filter((item) => item.types.includes('rig')),
        [items],
    );

    let maxSlots = Math.max(
        ...displayItems.map(
            (displayItem) => displayItem.properties.capacity || 0,
        ),
    );
    if (maxSlots === Infinity) {
        maxSlots = 1;
    }

    const handleMinSlotsChange = (newValueLabel) => {
        setMinSlots(maxSlots - newValueLabel);
    };

    return [
        <SEO 
            title={`${t('Rigs')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('rigs-page-description', 'This page includes a sortable table with information on the different types of rigs available in the game, including their price, inside and outside size, weight, compression, and other characteristics.')}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    <Icon path={mdiTshirtCrewOutline} size={1.5} className="icon-with-text" /> 
                    {t('Rigs')}
                </h1>
                <Filter center>
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
                        label={t('Armored rigs?')}
                        onChange={(e) =>
                            setIncludeArmoredRigs(!includeArmoredRigs)
                        }
                        checked={includeArmoredRigs}
                    />
                    <SliderFilter
                        defaultValue={25 - minSlots}
                        label={t('Min slots')}
                        min={0}
                        max={25}
                        marks={marks}
                        reverse
                        onChange={handleMinSlotsChange}
                    />
                    <ToggleFilter
                        label={t('3-slot')}
                        onChange={(e) => setHas3Slot(!has3Slot)}
                        checked={has3Slot}
                    />
                    <ToggleFilter
                        label={t('4-slot')}
                        onChange={(e) => setHas4Slot(!has4Slot)}
                        checked={has4Slot}
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
                typeFilter={'rig'}
                showNetPPS={showNetPPS}
                showAllSources={showAllItemSources}
                excludeArmor={!includeArmoredRigs}
                minSlots={minSlots}
                has3Slot={has3Slot}
                has4Slot={has4Slot}
                grid={1}
                gridSlots={2}
                innerSize={3}
                weight={4}
                slotRatio={5}
                cheapestPrice={6}
                pricePerSlot={7}
            />

            <div className="page-wrapper rigs-page-wrapper">
                {/* prettier-ignore */}
                <Trans i18nKey={'rigs-page-p'}>
                    <p>
                        {"When it comes to carrying and storing ammunition and magazines during your excursions in Escape from Tarkov, chest rigs are crucial. Some even provide you with additional security."}
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Rigs;
