import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import SEO from '../../../components/SEO.jsx';
import ErrorPage from '../../error-page/index.jsx';
import { Filter, InputFilter, ToggleFilter } from '../../../components/filter/index.js';
import SmallItemTable from '../../../components/small-item-table/index.js';

import QueueBrowserTask from '../../../modules/queue-browser-task.js';

import { useHandbookData } from '../../../features/items/index.js';

function HandbookCategory() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    let { handbookCategoryName } = useParams();
    const { t } = useTranslation();

    const { data: handbook } = useHandbookData();
    const category = handbook.handbookCategories.find(cat => handbookCategoryName === cat.normalizedName);

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

    let categoryImage = ' - ';
    if (category.imageLink) {
        categoryImage = <img src={category.imageLink} alt="" style={{objectFit: 'contain', verticalAlign: 'middle', marginLeft: '5px', marginRight: '5px'}}/>
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
                    {categoryImage}
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
                handbookCategoryFilter={category.id}
                showAllSources={showAllItemSources}
                traderValue={1}
                fleaValue={2}
                cheapestPrice={3}
            />
        </div>,
    ];
}

export default HandbookCategory;
