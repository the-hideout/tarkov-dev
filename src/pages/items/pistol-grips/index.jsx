import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import {mdiHandPointingLeft} from '@mdi/js';

import SEO from '../../../components/SEO.jsx';
import { Filter, ToggleFilter, SelectItemFilter } from '../../../components/filter/index.jsx';
import SmallItemTable from '../../../components/small-item-table/index.jsx';

import useItemsData from '../../../features/items/index.js';

function PistolGrips() {
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [selectedGun, setSelectedGun] = useState(false);

    const { data: items } = useItemsData();

    const { t } = useTranslation();

    const activeGuns = useMemo(() => {
        return items.filter(item => item.types.includes('gun')).sort((a, b) => a.name.localeCompare(b.name)).map(item => {
            let iconLink = item.iconLink;
            if (item.properties?.defaultPreset) {
                const preset = items.find(i => i.id === item.properties.defaultPreset.id);
                if (preset) {
                    iconLink = preset.iconLink;
                }
            }
            return {
                ...item,
                iconLink,
            };
        });
    }, [items]);

    return [
        <SEO 
            title={`${t('Pistol Grips')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('pistol-page-description', 'This page includes a sortable table with information on the different types of pistol grips available in the game, including their price, ergonomics, compatibility, and other characteristics.')}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    <Icon path={mdiHandPointingLeft} size={1.5} className="icon-with-text" /> 
                    {t('Pistol Grips')}
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
                    <SelectItemFilter
                        label={t('Filter by gun')}
                        placeholder={t('select a gun')}
                        items={activeGuns}
                        onChange={(event) => {
                            if (!event) {
                                return true;
                            }

                            if (!event.value) {
                                setSelectedGun(undefined);
                            }

                            setSelectedGun(
                                activeGuns.find(
                                    (activeGun) => activeGun.id === event.value,
                                ),
                            );
                        }}
                        wide
                    />
                </Filter>
            </div>

            <SmallItemTable
                typeFilter="pistolGrip"
                showAllSources={showAllItemSources}
                attachesToItemFilter={selectedGun}
                showAttachTo
                ergonomics={1}
                cheapestPrice={2}
                ergoCost={2}
                sortBy='ergonomics'
                sortByDesc={true}
            />

            <div className="page-wrapper pistol-grips-page-wrapper">
                <Trans i18nKey={'pistol-grips-page-p'}>
                    <p>
                        {"In Escape from Tarkov a pistol grips and stocks are vital parts of a weapon."}
                    </p>
                    <p>
                        {"On this page you can sort them buy ergonomics improvement or their cost and see on which weapon they can be mounted."}
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default PistolGrips;
