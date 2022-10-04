import React, { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import ErrorPage from '../../components/error-page';
import ItemSearch from '../../components/item-search';
import LoadingSmall from '../../components/loading-small';

import { selectQuests, fetchQuests } from '../../features/quests/questsSlice';

import './index.css';

dayjs.extend(relativeTime);

/*const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
};*/

function Quest() {
    //const settings = useSelector((state) => state.settings);
    const { taskIdentifier } = useParams();
    const { t } = useTranslation();

    const loadingData = {
        name: t('Loading...'),
        loading: true,
    };

    const dispatch = useDispatch();
    const quests = useSelector(selectQuests);
    const questsStatus = useSelector((state) => {
        return state.quests.status;
    });

    useEffect(() => {
        let timer = false;
        if (questsStatus === 'idle') {
            dispatch(fetchQuests());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchQuests());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [questsStatus, dispatch]);

    let currentQuest = useMemo(() => {
        return quests.find(quest => {
            if (quest.id === taskIdentifier) {
                return true;
            }
            if (String(quest.tarkovDataId) === taskIdentifier) {
                return true;
            }
            if (quest.normalizedName === taskIdentifier) {
                return true;
            }
            return false;
        });
    }, [
        quests,
        taskIdentifier,
    ]);

    // if the name we got from the params are the id of the item, redirect
    // to a nice looking path
    if (currentQuest && currentQuest.normalizedName !== taskIdentifier) {
        return (
            <Navigate
                to={`/task/${currentQuest.normalizedName}`}
                replace
            />
        );
    }

    if (!currentQuest) {
        return <ErrorPage />;
    }

    if (!currentQuest) {
        currentQuest = loadingData;
    }

    // checks for item data loaded
    /*if (!currentQuest && (questStatus === 'idle' || questStatus === 'loading')) {
        currentQuest = loadingData;
    }

    if (!currentQuest && (questStatus === 'success' || questStatus === 'failed')) {
        return <ErrorPage />;
    }*/

    return [
        <Helmet key={'quest-page-helmet'}>
            <meta charSet="utf-8" />
            <title>{`${currentQuest.name} - Escape from Tarkov`}</title>
            <meta
                name="description"
                content={`All the relevant information about ${currentQuest.name}`}
            />
            <link
                rel="canonical"
                href={`https://tarkov.dev/task/${currentQuest.normalizedName}`}
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className={'item-page-wrapper'}>
                <ItemSearch showDropdown />
                <div className="main-information-grid">
                    <div className="item-information-wrapper">
                        <h1>
                            <div className={'item-font'}>
                                {currentQuest.name !== 'Loading...'
                                    ? (currentQuest.name)
                                    : (<LoadingSmall />)
                                }
                            </div>
                            <img
                                alt={currentQuest.trader.name}
                                className={'item-icon'}
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/${currentQuest.trader.normalizedName}-icon.jpg`}
                            />
                        </h1>
                        {currentQuest.wikiLink && (
                            <div className="wiki-link-wrapper">
                                <a href={currentQuest.wikiLink}>
                                    {t('Wiki')}
                                </a>
                            </div>
                        )}
                        {typeof currentQuest.tarkovDataId !== 'undefined' && (
                            <div className="wiki-link-wrapper">
                                <a href={`https://tarkovtracker.io/quest/${currentQuest.tarkovDataId}`}>
                                    {t('TarkovTracker')}
                                </a>
                            </div>
                        )}
                    </div>
                    <div className={`icon-and-link-wrapper`}>
                        <Link
                            to={`/traders/${currentQuest.trader.normalizedName}`}
                        >
                            <img
                                alt={currentQuest.trader.name}
                                height="86"
                                width="86"
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/${currentQuest.trader.normalizedName}-icon.jpg`}
                                // title = {`Sell ${currentItemData.name} on the Flea market`}
                            />
                        </Link>
                    </div>
                </div>
                {/* Divider between sections */}
                <hr className="hr-muted"></hr>
            </div>
        </div>,
    ];
}

export default Quest;
