import {
    Link
} from 'react-router-dom';
import {Helmet} from 'react-helmet';

import Icon from '@mdi/react'
import * as Icons from '@mdi/js';

import ItemSearch from '../../components/item-search';

import itemsData from '../../data/category-pages.json';

import './index.css';

function Items(props) {
    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta
                charSet='utf-8'
            />
            <title>
                Escape from Tarkov Items
            </title>
            <meta
                name = 'description'
                content = 'Escape from Tarkov item guides and graphs'
            />
        </Helmet>,
        <div
            className = {'page-wrapper'}
            key = 'map-page-wrapper'
        >
            <h1
                className = 'center-title'
            >
                <Icon
                    path={Icons.mdiHanger}
                    size={1.5}
                    className = 'icon-with-text'
                />
                Escape from Tarkov Items
            </h1>
            <ItemSearch
                showDropdown
            />
            <div
                className = 'guides-list-wrapper'
            >
                {itemsData.map(categoryPage =>
                    <Link
                        to = {`/items/${categoryPage.key}`}
                        key = {`item-wrapper-${categoryPage.key}`}
                        className = 'screen-link'
                    >
                        <h2
                            className = 'center-title'
                        >
                            <Icon
                                path={Icons[categoryPage.icon]}
                                size={1}
                                className = 'icon-with-text'
                            />
                            {categoryPage.displayText}
                        </h2>
                        <img
                            alt = {`${categoryPage.displayText} table`}
                            loading='lazy'
                            src = {`${process.env.PUBLIC_URL}/images/${categoryPage.key}-table-thumbnail.jpg`}
                        />
                    </Link>
                )}
            </div>
        </div>,
    ];
};

export default Items;
