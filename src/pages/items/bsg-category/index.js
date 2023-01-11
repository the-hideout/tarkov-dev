import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import ErrorPage from '../../../components/error-page';

import { Filter, InputFilter, ToggleFilter } from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';
import QueueBrowserTask from '../../../modules/queue-browser-task';

import { useMetaQuery } from '../../../features/meta/queries';

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

    const { data: meta } = useMetaQuery();
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
        <Helmet key={'bsg-category-helmet'}>
            <meta charSet="utf-8" />
            <title>{category.name} - {t('Escape from Tarkov')} - {t('Tarkov.dev')}</title>
            <meta
                name="description"
                content={t('bsg-category-description', 'Find out everything you need to know about {{category}} in Escape from Tarkov.', { category: category.name })}
            />
        </Helmet>,
        <div className="page-wrapper" key={'display-wrapper'}>
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
