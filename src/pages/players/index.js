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
    const turnstileToken = useRef(false);

    const { t } = useTranslation();

    const enterPress = useKeyPress('Enter');

    const [nameFilter, setNameFilter] = useState('');
    const [nameResults, setNameResults] = useState([]);
    const [nameResultsError, setNameResultsError] = useState(false);

    const [isButtonDisabled, setButtonDisabled] = useState(true);
    const [searched, setSearched] = useState(false);
    //const [turnstileToken, setTurnstileToken] = useState();

    const searchTextValid = useMemo(() => {
        const charactersValid = !!nameFilter.match(/^[a-zA-Z0-9-_]*$/);
        const lengthValid = !!nameFilter.match(/^[a-zA-Z0-9-_]{3,15}$|^TarkovCitizen\d{1,10}$/i);
        setButtonDisabled(!charactersValid || !lengthValid);
        setNameResultsError(false);
        if (!charactersValid) {
            setNameResultsError(`Names can only contain letters, numbers, dashes (-), and underscores (_)`);
        }
        return charactersValid && lengthValid;
    }, [nameFilter, setButtonDisabled, setNameResultsError]);

    const searchForName = useCallback(async () => {
        if (!searchTextValid) {
            return;
        }
        if (!turnstileToken.current) {
            setNameResultsError('Turnstile challenge not solved');
            if (turnstileRef.current?.reset) {
                turnstileRef.current.reset();
            }
            return;
        }
        try {
            setNameResultsError(false);
            setButtonDisabled(true);
            setNameResults((await playerStats.searchPlayers(nameFilter, turnstileToken.current)).sort((a, b) => a.name.localeCompare(b.name)));
            setSearched(true);
        } catch (error) {
            setSearched(false);
            setNameResults([]);
            setNameResultsError(error.message);
        }
        turnstileToken.current = false;
        if (turnstileRef.current?.reset) {
            turnstileRef.current.reset();
        }
    }, [nameFilter, searchTextValid, setNameResults, setNameResultsError, turnstileToken, turnstileRef]);

    const searchResults = useMemo(() => {
        if (!searched) {
            return '';
        }
        if (nameResults.length < 1) {
            return <p>{t('No players with this name')}</p>;
        }
        let morePlayers = '';
        if (nameResults.length >= 5) {
            morePlayers = <p>{t('Refine your search to get better results')}</p>
        }
        return (
            <div>
                {morePlayers}
                <ul className="name-results-list">
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
    }, [searched, nameResults, t]);

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
                    }}
                />
                <button className="search-button" onClick={searchForName} disabled={isButtonDisabled || !turnstileToken?.current}>{t('Search')}</button>
            </div>
            {!!nameResultsError && (
                <div>
                    <p className="error">{nameResultsError}</p>
                </div>
            )}
            <Turnstile 
                ref={turnstileRef}
                className="turnstile-widget"
                siteKey='0x4AAAAAAAVVIHGZCr2PPwrR'
                onSuccess={(token) => {
                    turnstileToken.current = token;
                }}
                onError={(errorCode) => {
                    // https://developers.cloudflare.com/turnstile/reference/client-side-errors#error-codes
                    if (errorCode === '110200') {
                        setNameResultsError(`Turnstile error: ${window.location.hostname} is not a valid hostname`);
                    } else if (errorCode.startsWith('600')) {
                        setNameResultsError('Turnstile challenge failed');
                    } else {
                        setNameResultsError(`Turnstile error code ${errorCode}`);
                    }
                }}
                options={{appearance: 'interaction-only'}}
            />
            {!nameResultsError && searchResults}
        </div>,
    ];
}

export default Players;
