import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

import Search from '../../components/search';

import './index.css';

function SearchPreview() {
    const { t } = useTranslation();
    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Search Preview')}</title>
            <meta
                name="description"
                content="search preview"
            />
        </Helmet>,
        <div className={'page-wrapper'}>
            <h1>{t('Search Preview')}</h1>
            <p>Test out the extremely fast search preview powered by github.com/meilisearch/meilisearch</p>
            <Search index={'items'}></Search>
        </div>
    ];
}

export default SearchPreview;
