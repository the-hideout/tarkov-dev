import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import {mdiPistol} from '@mdi/js';

import SEO from '../../../components/SEO.jsx';
import { Filter, InputFilter, ToggleFilter } from '../../../components/filter/index.jsx';
import SmallItemTable from '../../../components/small-item-table/index.jsx';

import QueueBrowserTask from '../../../modules/queue-browser-task.js';

function Guns() {
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
        <SEO 
            title={`${t('Guns')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('guns-page-description', 'This page includes a sortable table with information on the different types of guns available in the game, including their price, damage, accuracy, and other characteristics.')}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiPistol} size={1.5} className="icon-with-text" /> 
                    {t('Guns')}
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
                typeFilter="gun"
                showAllSources={showAllItemSources}
                showPresets
                maxItems={50}
                autoScroll
                traderValue={1}
                fleaValue={2}
                cheapestPrice={3}
            />

            <div className="page-wrapper guns-page-wrapper">
                <Trans i18nKey={'guns-page-p'}>
                    <p>
                        {"Your main tool for survival is a weapon. Almost all weapons are completely modular, allowing them to be customized for various scenarios. All of the weaponry used in Escape from Tarkov are listed on this page."}
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Guns;
