import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import {mdiMagazineRifle} from '@mdi/js';

import { Filter, InputFilter, ToggleFilter } from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';
import QueueBrowserTask from '../../../modules/queue-browser-task';

function Mods() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const { t } = useTranslation();

    const handleNameFilterChange = useCallback(
        (e) => {
            if (typeof window !== 'undefined') {
                const name = e.target.value.toLowerCase();

                // schedule this for the next loop so that the UI
                // has time to update but we do the filtering as soon as possible
                QueueBrowserTask.task(() => {
                    setNameFilter(name);
                });
            }
        },
        [setNameFilter],
    );

    return [
        <Helmet key={'mods-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Mods')} - {t('Escape from Tarkov')} - {t('Tarkov.dev')}</title>
            <meta
                name="description"
                content={t('mods-page-description', 'This page includes a sortable table with information on the different types of gun mods available in the game, including their price, compatibility, and other characteristics.')}
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiMagazineRifle} size={1.5} className="icon-with-text" /> 
                    {t('Mods')}
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
                    <InputFilter
                        defaultValue={nameFilter}
                        onChange={handleNameFilterChange}
                        placeholder={t('filter on item')}
                    />
                </Filter>
            </div>

            <SmallItemTable
                nameFilter={nameFilter}
                typeFilter="mods"
                showAllSources={showAllItemSources}
                autoScroll
                maxItems={50}
                traderValue={1}
                fleaValue={2}
                cheapestPrice={3}
            />

            <div className="page-wrapper items-page-wrapper">
                <p>
                    {"In Escape from Tarkov, the performance and functioning of a weapon are controlled by elaborate mechanisms organized into five categories:"}
                </p>
                <ul>
                    <li>{"Functional Mods"}</li>
                    <li>{"Muzzle devices (Functional Mods)"}</li>
                    <li>{"Sights (Functional Mods)"}</li>
                    <li>{"Gear Mods"}</li>
                    <li>{"Vital parts"}</li>
                </ul>
            </div>
        </div>,
    ];
}

export default Mods;
