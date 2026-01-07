import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import {mdiFoodForkDrink} from '@mdi/js';

import SEO from '../../../components/SEO.jsx';
import { Filter, InputFilter, ToggleFilter } from '../../../components/filter/index.jsx';
import SmallItemTable from '../../../components/small-item-table/index.jsx';

import QueueBrowserTask from '../../../modules/queue-browser-task.js';

function Provisions() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [useTotalEnergyCost, setUseTotalEnergyCost] = useState(true);
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
            title={`${t('Provisions')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('provisions-page-description', 'This page includes a sortable table with information on the different types of provisions available in the game, including their hydration, energy, cheapest price and traders or flea market value.')}
            key="seo-wrapper"
        />,
        <div className="page-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiFoodForkDrink} size={1.5} className="icon-with-text" />
                    {t('Provisions')}
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
                        checked={useTotalEnergyCost}
                        label={t('Total energy cost')}
                        onChange={(e) =>
                            setUseTotalEnergyCost(!useTotalEnergyCost)
                        }
                        tooltipContent={
                            <>
                                {t('Include the cost of lost hydration in the cost of energy')}
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
                bsgCategoryFilter="543be6674bdc2df1348b4569"
                showAllSources={showAllItemSources}
                totalEnergyCost={useTotalEnergyCost}
                hydration={1}
                energy={2}
                traderValue={3}
                fleaValue={4}
                cheapestPrice={5}
                hydrationCost={6}
                energyCost={7}
                provisionValue={8}
                sortBy='provisionValue'
            />

            <div className="page-wrapper provisions-page-wrapper">
                {/* prettier-ignore */}
                <Trans i18nKey={'provisions-page-p'}>
                    <p>
                        {"In Escape from Tarkov, provisions are utilized to replenish energy and hydration."}
                        <br/>
                        {"Your Metabolism skill level will determine how effective they are."}
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Provisions;
