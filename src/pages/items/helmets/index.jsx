import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import {mdiRacingHelmet} from '@mdi/js';

import useStateWithLocalStorage from '../../../hooks/useStateWithLocalStorage.jsx';

import SEO from '../../../components/SEO.jsx';
import SmallItemTable from '../../../components/small-item-table/index.jsx';
import {
    Filter,
    ToggleFilter,
    RangeFilter,
    InputFilter,
} from '../../../components/filter/index.jsx';

const marks = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
};

function Helmets() {
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [includeBlockingHeadset, setIncludeBlockingHeadset] =
        useStateWithLocalStorage('includeBlockingHeadset', true);
    const [minArmorClass, setMinArmorClass] = useStateWithLocalStorage(
        'minHelmetArmorClass',
        1,
    );
    const [maxArmorClass, setMaxArmorClass] = useStateWithLocalStorage(
        'maxHelmetArmorClass',
        6,
    );
    const [maxPrice, setMaxPrice] = useStateWithLocalStorage(
        'helmetMaxPrice',
        '',
    );

    const handleArmorClassChange = ([min, max]) => {
        setMinArmorClass(min);
        setMaxArmorClass(max);
    };

    const { t } = useTranslation();

    return [
        <SEO 
            title={`${t('Helmets')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('helmet-page-description', 'This page includes a sortable table with information on the different types of helmet available in the game, including their price, armor class, and other characteristics.')}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    <Icon path={mdiRacingHelmet} size={1.5} className="icon-with-text" /> 
                    {t('Helmets')}
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
                        label={t('Show blocking headset')}
                        onChange={(e) =>
                            setIncludeBlockingHeadset(!includeBlockingHeadset)
                        }
                        checked={includeBlockingHeadset}
                    />
                    <RangeFilter
                        defaultValue={[minArmorClass, maxArmorClass]}
                        label={t('Min armor class')}
                        min={1}
                        max={6}
                        marks={marks}
                        onChange={(event ,values) => {
                            handleArmorClassChange(values);
                        }}
                    />
                    <InputFilter
                        defaultValue={maxPrice || ''}
                        label={t('Max price')}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        placeholder={t('max price')}
                        type="number"
                    />
                </Filter>
            </div>

            <SmallItemTable
                bsgCategoryFilter={['5a341c4686f77469e155819e', '5a341c4086f77401f2541505']}
                showAllSources={showAllItemSources}
                minPropertyFilter={{
                    property: 'class',
                    value: minArmorClass,
                }}
                maxPropertyFilter={{
                    property: 'class',
                    value: maxArmorClass,
                }}
                includeBlockingHeadset={includeBlockingHeadset}
                maxPrice={maxPrice}
                showAttachments
                requireArmor
                armorClass={1}
                armorZones={2}
                soundSuppression={3}
                blocksHeadset={4}
                maxDurability={5}
                stats={6}
                cheapestPrice={7}
                sortBy='armorClass'
            />

            <div className="page-wrapper helmets-page-wrapper">
                <Trans i18nKey={'helmets-page-p'}>
                    <p>
                        {"In Escape from Tarkov, headgear serves a variety of functions."}
                        <br/>
                        {"There are useful objects, vanity items, and safety headgear. Before entering combat, choosing a helmet that will protect different parts of the head becomes crucial."}
                        <br/>
                        {"The impact that different helmets will have on how much sound they suppress is another crucial factor to take into account. Escape from Tarkov's gameplay heavily relies on sound."}
                        <br/>
                        {"Modular helmets, which have an assortment of different components, are another aspect of Escape from Tarkov. These helmets may modify the number of segments they protect. Top, Nape, Ears, Eyes, and Jaws are the segments."}
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Helmets;
