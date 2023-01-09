import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import {mdiHandPointingLeft} from '@mdi/js';

import { Filter, ToggleFilter, SelectItemFilter } from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';
import {
    useItemsQuery,
} from '../../../features/items/queries';

function PistolGrips() {
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [selectedGun, setSelectedGun] = useState(false);

    const { data: items } = useItemsQuery();

    const { t } = useTranslation();

    const activeGuns = useMemo(() => {
        return items.filter(item => item.types.includes('gun')).sort((a, b) => a.name.localeCompare(b.name));
    }, [items]);

    return [
        <Helmet key={'pistol-grips-table'}>
            <meta charSet="utf-8" />
            <title>{t('Pistol Grips')} - {t('Escape from Tarkov')} - {t('Tarkov.dev')}</title>
            <meta
                name="description"
                content={t("This page includes a sortable table with information on the different types of pistol grips available in the game, including their price, ergonomics, compatibility, and other characteristics.")}
            />
        </Helmet>,
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
            />

            <div className="page-wrapper items-page-wrapper">
                <p>
                    {"In Escape from Tarkov a pistol grip is a vital part of a weapon."}
                </p>
            </div>
        </div>,
    ];
}

export default PistolGrips;
