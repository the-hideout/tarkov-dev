import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import SEO from '../../../components/SEO.jsx';
import ErrorPage from '../../error-page/index.js';
import { Filter, InputFilter, ToggleFilter } from '../../../components/filter/index.js';
import SmallItemTable from '../../../components/small-item-table/index.js';

import QueueBrowserTask from '../../../modules/queue-browser-task.js';

import useMetaData from '../../../features/meta/index.js';

function BsgCategory() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    let { bsgCategoryName } = useParams();
    const { t } = useTranslation();

    /*const bsgCategoryData = Object.values(categoryData).find(
        (category) => category.urlName === bsgCategoryName?.toLowerCase(),
    );*/

    const { data: meta } = useMetaData();
    const category = meta.categories.find(cat => bsgCategoryName === cat.normalizedName);

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

    if (!category) {
        return <ErrorPage />;
    }

    return [
        <SEO 
            title={`${category.name} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('bsg-category-description', 'Find out everything you need to know about {{category}} in Escape from Tarkov.', { category: category.name })}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    {' - '}
                    {category.name}
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
                bsgCategoryFilter={category.id}
                showAllSources={showAllItemSources}
                traderValue={1}
                fleaValue={2}
                cheapestPrice={3}
            />
        </div>,
    ];
}

export default BsgCategory;
