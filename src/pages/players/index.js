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

    const [isButtonDisabled, setButtonDisabled] = useState(true);
    const [searched, setSearched] = useState(false);

    const searchForName = useCallback(async () => {
        if (nameFilter.length < 3 || nameFilter.length > 15) {
            return;
        }
        try {
            setButtonDisabled(true);
            const response = await fetch('https://player.tarkov.dev/name/'+nameFilter);
            if (response.status !== 200) {
                return;
            }
            setButtonDisabled(false);
            setSearched(true);
            setNameResults(await response.json());
        } catch (error) {
            setNameResults(['Error searching player profile: ' + error]);
        }
    }, [nameFilter, setNameResults]);

    const searchResults = useMemo(() => {
        if (!searched) {
            return '';
        }
        if (nameResults.length < 1) {
            return 'No players with this name';
        }
        let morePlayers = '';
        if (nameResults.length >= 5) {
            morePlayers = 'Refine you search to get better results';
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
                {morePlayers}
            </div>
        );
    }, [searched, nameResults]);

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
                    placeholder={t('Between 3 and 14 characters')}
                    type="text"
                    onChange={(event) => {
                        let newNameFilter = event.target.value;
                        setNameFilter(newNameFilter);
                        setButtonDisabled(newNameFilter.length < 3 || newNameFilter.length > 15);
                    }}
                />
                <button className="search-button" onClick={searchForName} disabled={isButtonDisabled}>{t('Search')}</button>
            </div>
            {searchResults}
        </div>,
    ];
}

export default Players;
