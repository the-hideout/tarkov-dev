import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import {mdiTshirtCrew} from '@mdi/js';

import useStateWithLocalStorage from '../../../hooks/useStateWithLocalStorage.jsx';

import SEO from '../../../components/SEO.jsx';
import {
    Filter,
    ToggleFilter,
    InputFilter,
    RangeFilter,
} from '../../../components/filter/index.jsx';
import SmallItemTable from '../../../components/small-item-table/index.jsx';

const marks = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
};

function Armors(props) {
    const [showAllArmorSources, setShowAllArmorSources] = useState(false);
    const [useClassEffectiveDurability, setUseClassEffectiveDurability] = useStateWithLocalStorage(
        'useClassEffectiveDurability',
        false,
    );
    const [includeRigs, setIncludeRigs] = useStateWithLocalStorage(
        'includeRigs',
        true,
    );
    const [minArmorClassSoft, setMinArmorClassSoft] = useStateWithLocalStorage(
        'minArmorClassSoft',
        0,
    );
    const [maxArmorClassSoft, setMaxArmorClassSoft] = useStateWithLocalStorage(
        'maxArmorClassSoft',
        6,
    );
    const [minArmorClassPlate, setMinArmorClassPlate] = useStateWithLocalStorage(
        'minArmorClassPlate',
        0,
    );
    const [maxArmorClassPlate, setMaxArmorClassPlate] = useStateWithLocalStorage(
        'maxArmorClassPlate',
        6,
    );
    const [maxPrice, setMaxPrice] = useStateWithLocalStorage(
        'armorMaxPrice',
        '',
    );
    const { t } = useTranslation();

    const handleSoftArmorClassChange = ([min, max]) => {
        setMinArmorClassSoft(min);
        setMaxArmorClassSoft(max);
    };
    const handlePlateArmorClassChange = ([min, max]) => {
        setMinArmorClassPlate(min);
        setMaxArmorClassPlate(max);
    };

    const typeFilter = ['armor'];

    if (includeRigs) {
        typeFilter.push('rig');
    }

    return [
        <SEO 
            title={`${t('Armors')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('armors-page-description', 'This page includes a sortable table with information on the different types of armor available in the game, including their price, repairability, armor class, and other characteristics.')}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    <Icon path={mdiTshirtCrew} size={1.5} className="icon-with-text" /> 
                    {t('Armors')}
                </h1>
                <Filter center>
                    <ToggleFilter
                        checked={showAllArmorSources}
                        label={t('Ignore settings')}
                        onChange={(e) =>
                            setShowAllArmorSources(!showAllArmorSources)
                        }
                        tooltipContent={
                            <>
                                {t('Shows all sources of items regardless of your settings')}
                            </>
                        }
                    />
                    <ToggleFilter
                        label={t('Class effective durability')}
                        onChange={(e) => setUseClassEffectiveDurability(!useClassEffectiveDurability)}
                        checked={useClassEffectiveDurability}
                    />
                    <ToggleFilter
                        label={t('Include rigs')}
                        onChange={(e) => setIncludeRigs(!includeRigs)}
                        checked={includeRigs}
                    />
                    <InputFilter
                        defaultValue={maxPrice || ''}
                        label={t('Max price')}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        placeholder={t('max price')}
                        type="number"
                    />
                    <RangeFilter
                        defaultValue={[minArmorClassSoft, maxArmorClassSoft]}
                        label={t('Soft armor class')}
                        min={0}
                        max={6}
                        marks={marks}
                        onChange={(event, values) => {
                            handleSoftArmorClassChange(values);
                        }}
                    />
                    <RangeFilter
                        defaultValue={[minArmorClassPlate, maxArmorClassPlate]}
                        label={t('Plate armor class')}
                        min={0}
                        max={6}
                        marks={marks}
                        onChange={(event, values) => {
                            handlePlateArmorClassChange(values);
                        }}
                    />
                </Filter>
            </div>

            <SmallItemTable
                typeFilter={'armor'}
                excludeTypeFilter={includeRigs ? false : 'rig'}
                softArmorFilter={[minArmorClassSoft, maxArmorClassSoft]}
                plateArmorFilter={[minArmorClassPlate, maxArmorClassPlate]}
                maxPrice={maxPrice}
                useClassEffectiveDurability={useClassEffectiveDurability}
                armorClass
                armorZones
                cheapestPrice={1}
                maxDurability
                effectiveDurability
                repairability
                weight
                stats
                showAllSources={showAllArmorSources}
                sortBy='armorClass'
            />
            
            <div className="page-wrapper armors-page-wrapper">
                {/* prettier-ignore */}
                <Trans i18nKey={'armors-page-p'}>
                    <p>
                        {"In the video game Escape from Tarkov, armor vests are worn to lessen bullet damage. Helmets are typically used in addition to them."}
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Armors;
