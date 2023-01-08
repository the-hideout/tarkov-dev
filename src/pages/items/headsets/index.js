import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import {mdiHeadset} from '@mdi/js';

import { Filter, InputFilter, ToggleFilter } from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';
import QueueBrowserTask from '../../../modules/queue-browser-task';

function Headsets() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [showAllItemSources, setShowAllItemSources] = useState(false);
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
        <Helmet key={'barter-items-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Headsets')} - {t('Escape from Tarkov')} - {t('Tarkov.dev')}</title>
            <meta
                name="description"
                content={t("This page includes a sortable table with information on the different types of headsets available in the game, including their price, aviability, and other characteristics.")}
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiHeadset} size={1.5} className="icon-with-text" /> 
                    {t('Headsets')}
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
                typeFilter="headphones"
                showAllSources={showAllItemSources}
                weight={1}
                traderValue={2}
                fleaValue={3}
                cheapestPrice={4}
            />

            <div className="page-wrapper items-page-wrapper">
                <p>
                    {"In Escape from Tarkov, headsets magnify low-frequency noises like footsteps while muzzling impulsive stimuli like gunshots. Different audio profiles are offered by the various models."}
                </p>
            </div>
        </div>,
    ];
}

export default Headsets;
