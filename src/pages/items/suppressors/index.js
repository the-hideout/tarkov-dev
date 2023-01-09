import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import {mdiBottleWine} from '@mdi/js';

import { Filter, ToggleFilter, SelectItemFilter } from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';
import { useItemsQuery } from '../../../features/items/queries';

function Suppressors() {
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [selectedGun, setSelectedGun] = useState(false);
    const { data: items } = useItemsQuery();

    const { t } = useTranslation();

    const activeGuns = useMemo(() => {
        return items.filter(item => item.types.includes('gun')).sort((a, b) => a.name.localeCompare(b.name));
    }, [items]);

    return [
        <Helmet key={'suppressors-table'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Suppressors')} - {t('Tarkov.dev')}</title>
            <meta
                name="description"
                content={t('This page includes a sortable table with information on the different types of suppressors available in the game, including their ergonomics, recoil, and cheapest price.')}
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiBottleWine} size={1.5} className="icon-with-text" /> 
                    {t('Suppressors')}
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
                typeFilter="suppressor"
                showAllSources={showAllItemSources}
                attachesToItemFilter={selectedGun}
                showAttachTo
                ergonomics={1}
                recoilModifier={2}
                cheapestPrice={3}
            />

            <div className="page-wrapper items-page-wrapper">
                <p>
                    {"In Escape from Tarkov, a suppressor is a muzzle device (a functional mod) and can be installed on a weapon to muffle gunshot sound."}
                </p>
            </div>
        </div>,
    ];
}

export default Suppressors;
