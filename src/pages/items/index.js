import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import { mdiViewGrid } from '@mdi/js';

import ItemSearch from '../../components/item-search';
import ItemIconList from '../../components/item-icon-list';

import itemsData from '../../data/category-pages.json';

import './index.css';

function Items(props) {
    const { t } = useTranslation();
    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Items')}</title>
            <meta
                name="description"
                content="Escape from Tarkov item guides and graphs"
            />
        </Helmet>,
        <div className={'page-wrapper'} key="map-page-wrapper">
            <h1 className="center-title">
                {t('Escape from Tarkov')}
                <Icon path={mdiViewGrid} size={1.5} className="icon-with-text"/>
                {t('Items')}
            </h1>
            <ItemSearch showDropdown />
            <div className="guides-list-wrapper">
                {itemsData.map((categoryPage) => (
                    <Link
                        to={`/items/${categoryPage.key}`}
                        key={`item-wrapper-${categoryPage.key}`}
                        className="screen-link"
                    >
                        <h2 className="center-title">
                            <Icon
                                path={ItemIconList(categoryPage.icon)}
                                size={1}
                                className="icon-with-text"
                            />
                            {t(categoryPage.displayText)}
                        </h2>
                        <img
                            alt={`${categoryPage.displayText} table`}
                            loading="lazy"
                            src={`${process.env.PUBLIC_URL}/images/${categoryPage.key}-table-thumbnail.jpg`}
                        />
                    </Link>
                ))}
            </div>
        </div>,
    ];
}

export default Items;
