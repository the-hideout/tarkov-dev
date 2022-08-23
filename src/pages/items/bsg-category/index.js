import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import ErrorPage from '../../../components/error-page';

import { Filter, InputFilter } from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';
import QueueBrowserTask from '../../../modules/queue-browser-task';

import { useMetaQuery } from '../../../features/meta/queries';

function BsgCategory() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
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
        <Helmet key={'barter-items-helmet'}>
            <meta charSet="utf-8" />
            <title>
                {t('Escape from Tarkov')} {category.name}
            </title>
            <meta
                name="description"
                content={`All the relevant information about Escape from Tarkov`}
            />
        </Helmet>,
        <div className="page-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')} {category.name}
                    {/* <cite>
                        {bsgCategoryData._id}
                    </cite> */}
                </h1>
                <Filter center>
                    <InputFilter
                        defaultValue={nameFilter}
                        onChange={handleNameFilterChange}
                        placeholder={t('Search...')}
                    />
                </Filter>
            </div>

            <SmallItemTable
                nameFilter={nameFilter}
                bsgCategoryFilter={category.id}
                fleaValue
                traderValue
                traderPrice
            />
        </div>,
    ];
}

export default BsgCategory;
