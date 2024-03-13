import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { mdiAccountSearch } from '@mdi/js';

import SEO from '../../components/SEO.jsx';
import { InputFilter } from '../../components/filter/index.js';

import './index.css';

function Players() {
    const { t } = useTranslation();

    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [nameResults, setNameResults] = useState([]);
    const [searchMessage, setSearchMessage] = useState(false);

    const searchForName = useCallback(async () => {
        if (nameFilter.length < 3 || nameFilter.length > 15) {
            setSearchMessage(t('Name must be 3-15 characters'));
            return;
        }
        setSearchMessage(false);
        try {
            const response = await fetch('https://player.tarkov.dev/name/'+nameFilter);
            if (response.status !== 200) {
                return;
            }
            setNameResults(await response.json());
        } catch (error) {
            setSearchMessage('Error searching player profile: ' + error);
        }
    }, [nameFilter, setNameResults, setSearchMessage, t]);

    const searchResults = useMemo(() => {
        if (nameResults.length < 1) {
            return '';
        }
        return (
            <div>
                <ul>
                    {nameResults.map(result => {
                        return <li key={`account-${result.aid}`}>
                            <Link to={`/player/${result.aid}`}>
                                {result.name}
                            </Link>
                        </li>
                    })}
                </ul>
            </div>
        );
    }, [nameResults]);

    const searchMessageElement = useMemo(() => {
        if (!searchMessage) {
            return '';
        }
        return (
            <div>
                {searchMessage}
            </div>
        );
    }, [searchMessage])

    if (defaultQuery) {
        searchForName();
    }

    return [
        <SEO 
            title={`${t('Players')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('players-page-description', 'Search Escape from Tarkov players. View player profiles and see their stats.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'} key="players-page-wrapper">
            <div className="players-headline-wrapper" key="players-headline">
                <h1 className="players-page-title">
                    <Icon path={mdiAccountSearch} size={1.5} className="icon-with-text"/>
                    {t('Players')}
                </h1>
            </div>
            <div>
                <Trans i18nKey={'players-page-p'}>
                    <p>
                        Search for Escape From Tarkov players and view their profiles.
                    </p>
                </Trans>
            </div>
            <div className='search-controls'>
                <InputFilter
                    label={t('Player Name')}
                    defaultValue={nameFilter}
                    type="text"
                    onChange={(event) => {
                        setNameFilter(event.target.value);
                    }}
                />
                <button className="search-button" onClick={searchForName}>{t('Search')}</button>
            </div>
            {searchMessageElement}
            {searchResults}
        </div>,
    ];
}

export default Players;
