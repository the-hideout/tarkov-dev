import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import {mdiTshirtCrew} from '@mdi/js';

import useStateWithLocalStorage from '../../../hooks/useStateWithLocalStorage';
import {
    Filter,
    ToggleFilter,
    InputFilter,
    RangeFilter,
} from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';

const marks = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
};

function Armor(props) {
    const [showAllArmorSources, setShowAllArmorSources] = useState(false);
    const [useClassEffectiveDurability, setUseClassEffectiveDurability] = useStateWithLocalStorage(
        'useClassEffectiveDurability',
        false,
    );
    const [includeRigs, setIncludeRigs] = useStateWithLocalStorage(
        'includeRigs',
        true,
    );
    const [minArmorClass, setMinArmorClass] = useStateWithLocalStorage(
        'minArmorClass',
        1,
    );
    const [maxArmorClass, setMaxArmorClass] = useStateWithLocalStorage(
        'maxArmorClass',
        6,
    );
    const [maxPrice, setMaxPrice] = useStateWithLocalStorage(
        'armorMaxPrice',
        '',
    );
    const { t } = useTranslation();

    const handleArmorClassChange = ([min, max]) => {
        setMinArmorClass(min);
        setMaxArmorClass(max);
    };

    const typeFilter = ['armor'];

    if (includeRigs) {
        typeFilter.push('rig');
    }

    return [
        <Helmet key={'armor-table'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Armors')}</title>
            <meta
                name="description"
                content="All armor in Escape from Tarkov sortable by price, repairability, armor class etc"
            />
        </Helmet>,
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
                    <RangeFilter
                        defaultValue={[minArmorClass, maxArmorClass]}
                        label={t('Min armor class')}
                        min={1}
                        max={6}
                        marks={marks}
                        onChange={handleArmorClassChange}
                    />
                    <InputFilter
                        defaultValue={maxPrice || ''}
                        label={t('Max price')}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        placeholder={t('Max price')}
                        type="number"
                    />
                </Filter>
            </div>

            <SmallItemTable
                typeFilter={'armor'}
                excludeTypeFilter={includeRigs ? false : 'rig'}
                minPropertyFilter={{
                    property: 'class',
                    value: minArmorClass,
                }}
                maxPropertyFilter={{
                    property: 'class',
                    value: maxArmorClass,
                }}
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
            />
            
            <div className="page-wrapper items-page-wrapper">
                <p>
                    {"In the video game Escape from Tarkov, armor vests are worn to lessen bullet damage. Helmets are typically used in addition to them."}
                </p>
            </div>
        </div>,
    ];
}

export default Armor;
