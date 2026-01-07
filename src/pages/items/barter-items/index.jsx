import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import {mdiPliers} from '@mdi/js';

import SEO from '../../../components/SEO.jsx';
import { Filter, InputFilter } from '../../../components/filter/index.jsx';
import SmallItemTable from '../../../components/small-item-table/index.jsx';

import QueueBrowserTask from '../../../modules/queue-browser-task.js';

function BarterItems() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
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
            title={`${t('Barter Items')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={"This page includes a sortable table with information on the different types of barter items available in the game, including their price, rarity, and other characteristics."}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiPliers} size={1.5} className="icon-with-text" /> 
                    {t('Barter Items')}
                </h1>
                <Filter center>
                    <InputFilter
                        defaultValue={nameFilter}
                        onChange={handleNameFilterChange}
                        placeholder={t('filter on item')}
                    />
                </Filter>
            </div>

            <SmallItemTable
                nameFilter={nameFilter}
                typeFilter="barter"
                fleaValue
                traderValue={1}
                maxItems={50}
                autoScroll
            />
            
            <div className="page-wrapper barter-items-page-wrapper">
                {/* prettier-ignore */}
                <Trans i18nKey={'barter-items-page-p'}>
                    <p>
                        {"This table of barter items from Escape from Tarkov will make it simple for you to determine how much each one is worth. It can be challenging to determine which products are valuable enough to take because there are over 150 barter items in the game, and flea market pricing can fluctuate suddenly. You may optimize your loot with the aid of this interactive table."}
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default BarterItems;
