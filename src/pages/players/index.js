import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Turnstile } from '@marsidev/react-turnstile'

import { Icon } from '@mdi/react';
import { mdiAccountSearch } from '@mdi/js';

import useKeyPress from '../../hooks/useKeyPress.jsx';

import SEO from '../../components/SEO.jsx';
import { InputFilter } from '../../components/filter/index.js';

import playerStats from '../../modules/player-stats.mjs';

import './index.css';

function Players() {
    const turnstileRef = useRef();

    const { t } = useTranslation();

    const enterPress = useKeyPress('Enter');

    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [nameResults, setNameResults] = useState([]);
    const [nameResultsError, setNameResultsError] = useState(false);

    const [isButtonDisabled, setButtonDisabled] = useState(true);
    const [searched, setSearched] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState();

    const searchForName = useCallback(async () => {
        if (nameFilter.length < 3 || nameFilter.length > 15) {
            return;
        }
        try {
            setNameResultsError(false);
            setButtonDisabled(true);
            setNameResults(await playerStats.searchPlayers(nameFilter, turnstileToken));
            setSearched(true);
        } catch (error) {
            setSearched(false);
            setNameResults([]);
            setNameResultsError(error.message);
        }
        turnstileRef.current.reset();
    }, [nameFilter, setNameResults, setNameResultsError, turnstileToken, turnstileRef]);

    const searchResults = useMemo(() => {
        if (!searched) {
            return '';
        }
        if (nameResults.length < 1) {
            return 'No players with this name. Note: banned players do not show up in name searches.';
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

    useEffect(() => {
        if (enterPress) {
            searchForName();
        }
    }, [enterPress, searchForName]);

    return [
        <SEO
            title={`${t('Players')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('players-page-description', 'Search Escape from Tarkov players. View player profiles and see their stats.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'} key="players-page-wrapper">
            <div className="players-headline-wrapper" key="players-headline">
                <h1 className="players-page-title">
                    <Icon path={mdiAccountSearch} size={1.5} className="icon-with-text" />
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
                    placeholder={t('Between 3 and 15 characters')}
                    type="text"
                    onChange={(event) => {
                        let newNameFilter = event.target.value;
                        setNameFilter(newNameFilter);
                        setButtonDisabled(newNameFilter.length < 3 || newNameFilter.length > 15);
                    }}
                />
                <button className="search-button" onClick={searchForName} disabled={isButtonDisabled || turnstileToken === undefined}>{t('Search')}</button>
            </div>
            {!!nameResultsError && (
                <div>
                    <p className="error">{nameResultsError}</p>
                </div>
            )}
            {!nameResultsError && searchResults}
            <Turnstile ref={turnstileRef} className="turnstile-widget" siteKey='0x4AAAAAAAVVIHGZCr2PPwrR' onSuccess={setTurnstileToken} options={{appearance: 'interaction-only'}} />
        </div>,
    ];
}

export default Players;
