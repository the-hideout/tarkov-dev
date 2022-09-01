import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import Icon from '@mdi/react';
import { mdiLock } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import SmallItemTable from '../../components/small-item-table';
import CraftsTable from '../../components/crafts-table';
import BartersTable from '../../components/barters-table';
import QuestsList from '../../components/quests-list';
import CanvasGrid from '../../components/canvas-grid';
import warningIcon from '../../images/icon-warning.png';
import ErrorPage from '../../components/error-page';
import LoyaltyLevelIcon from '../../components/loyalty-level-icon';
import PropertyList from '../../components/property-list';
import ItemsForHideout from '../../components/items-for-hideout';
import PriceGraph from '../../components/price-graph';
import ItemSearch from '../../components/item-search';
import { ToggleFilter } from '../../components/filter';
import ContainedItemsList from '../../components/contained-items-list';
import LoadingSmall from '../../components/loading-small';

import { useMetaQuery } from '../../features/meta/queries';
import { selectAllBarters, fetchBarters, } from '../../features/barters/bartersSlice';
import { selectAllHideoutModules, fetchHideout } from '../../features/hideout/hideoutSlice';
import { selectAllCrafts, fetchCrafts } from '../../features/crafts/craftsSlice';
import { selectQuests, fetchQuests } from '../../features/quests/questsSlice';
import {
    useItemByNameQuery,
    useItemByIdQuery,
} from '../../features/items/queries';

import formatPrice from '../../modules/format-price';
import fleaFee from '../../modules/flea-market-fee';
import bestPrice from '../../modules/best-price';

import './index.css';

dayjs.extend(relativeTime);

const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
};

function TraderPrice({ currency, price, priceRUB }) {
    if (currency !== 'RUB') {
        return (
            <Tippy content={formatPrice(priceRUB)} placement="bottom">
                <div>{formatPrice(price, currency)}</div>
            </Tippy>
        );
    }

    return formatPrice(priceRUB);
}

function Item() {
    const { itemName } = useParams();
    const { t } = useTranslation();
    const [showAllCrafts, setShowAllCrafts] = useState(false);
    const [showAllBarters, setShowAllBarters] = useState(false);
    const [showAllContainedItemSources, setShowAllContainedItemSources] = useState(false);
    const [showAllHideoutStations, setShowAllHideoutStations] = useState(false);

    const loadingData = {
        name: t('Loading...'),
        types: ['loading'],
        iconLink: `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
        gridImageLink: `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
        sellFor: [
            {
                source: 'fleaMarket',
                price: 0,
            },
        ],
        buyFor: [
            {
                source: 'flea-market',
                price: 0,
                requirements: [],
            },
        ],
    };

    // item name may be an id
    const { data: currentItemByIdData } = useItemByIdQuery(itemName);

    // TODO: This function needs to be greatly improved.
    //  it currently only needs to get a single item via its ID but it
    //  queries all items via graphql and then searches for said item.
    //  This is slow and does a lot of extra processing that is not needed
    const { data: currentItemByNameData, status: itemStatus } = useItemByNameQuery(itemName);

    const { data: meta } = useMetaQuery();
    const dispatch = useDispatch();
    const barters = useSelector(selectAllBarters);
    const bartersStatus = useSelector((state) => {
        return state.barters.status;
    });
    const crafts = useSelector(selectAllCrafts);
    const craftsStatus = useSelector((state) => {
        return state.crafts.status;
    });
    const hideout = useSelector(selectAllHideoutModules);
    const hideoutStatus = useSelector((state) => {
        return state.hideout.status;
    });
    const quests = useSelector(selectQuests);
    const questsStatus = useSelector((state) => {
        return state.quests.status;
    });

    useEffect(() => {
        let timer = false;
        if (bartersStatus === 'idle') {
            dispatch(fetchBarters());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchBarters());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [bartersStatus, dispatch]);

    useEffect(() => {
        let timer = false;
        if (craftsStatus === 'idle') {
            dispatch(fetchCrafts());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchCrafts());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [craftsStatus, dispatch]);

    useEffect(() => {
        let timer = false;
        if (hideoutStatus === 'idle') {
            dispatch(fetchHideout());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchHideout());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [hideoutStatus, dispatch]);

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

    let currentItemData = currentItemByNameData;

    const itemQuests = useMemo(() => {
        if (!currentItemData) {
            return [];
        }
        
        return quests.map((questData) => {
            const questDataCopy = {
                ...questData,
                neededItems: []
            };

            /*questDataCopy.objectives = questDataCopy.objectives.filter(objectiveData => {
                return objectiveData.item?.id === currentItemData?.id ||
                    objectiveData.containsAll?.some(part => part.id === currentItemData?.id) ||
                    objectiveData.markerItem?.id === currentItemData?.id;
            });*/

            const objectiveInfo = {
                iconLink: currentItemData?.iconLink,
                name: currentItemData?.name,
                count: 0,
                foundInRaid: false
            };

            questDataCopy.objectives.forEach((objectiveData) => {
                if (objectiveData.item?.id === currentItemData?.id && objectiveData.type !== 'findItem') {
                    objectiveInfo.count += objectiveData.count || 1;
                    objectiveInfo.foundInRaid = objectiveInfo.foundInRaid || objectiveData.foundInRaid;
                }
                if (objectiveData.markerItem?.id === currentItemData?.id) {
                    objectiveInfo.count++;
                }
                objectiveData.containsAll?.forEach(part => {
                    if (part.id === currentItemData?.id) 
                        objectiveInfo.count++;
                });
                if (objectiveData.usingWeapon?.length === 1) {
                    objectiveData.usingWeapon?.forEach(item => {
                        if (item.id === currentItemData?.id) 
                            objectiveInfo.count = 1;
                    });
                }
                if (objectiveData.usingWeaponMods?.length === 1) {
                    objectiveData.usingWeaponMods[0].forEach(item => {
                        if (item.id === currentItemData?.id) 
                            objectiveInfo.count = 1;
                    });
                }
                if (objectiveData.wearing?.length === 1) {
                    objectiveData.wearing?.forEach(outfit => {
                        outfit.forEach(item => {
                            if (item.id === currentItemData?.id) 
                                objectiveInfo.count = 1;
                        });
                    });
                }
            });

            questData.neededKeys.forEach(taskKey => {
                taskKey.keys.forEach(key => {
                    if (key.id === currentItemData?.id) {
                        objectiveInfo.count++;
                    }
                });
            });

            if (objectiveInfo.count > 0) 
                questDataCopy.neededItems.push(objectiveInfo);
            
            if (questDataCopy.neededItems.length > 0) 
                return questDataCopy;

            return false;
        }).filter(Boolean);
    }, [currentItemData, quests]);

    const questsProviding = useMemo(() => {
        if (!currentItemData) {
            return [];
        }

        const rewardTypes = ['startRewards', 'finishRewards'];
        return quests.map(quest => {
            const questDataCopy = {
                ...quest,
                rewardItems: []
            };

            rewardTypes.forEach(rewardType => {
                const rewardInfo = {
                    iconLink: currentItemData?.iconLink,
                    name: currentItemData?.name,
                    count: 0,
                    rewardType: rewardType
                };
                quest[rewardType].items.forEach(contained => {
                    if (contained.item.id === currentItemData?.id) {
                        rewardInfo.count += contained.count;
                    }
                    contained.item.containsItems.forEach(ci => {
                        if (ci.item.id === currentItemData?.id) {
                            rewardInfo.count += contained.count;
                        }
                    });
                });
                if (rewardInfo.count > 0)
                    questDataCopy.rewardItems.push(rewardInfo);
            });

            if (questDataCopy.rewardItems.length > 0) 
                return questDataCopy;
            
            return false;
        }).filter(Boolean);
    }, [currentItemData, quests]);

    currentItemData = useMemo(() => {
        if (!currentItemData || !currentItemData.bestPrice) 
            return currentItemData;
        return {
            ...currentItemData,
            ...bestPrice(currentItemData, meta?.flea?.sellOfferFeeRate, meta?.flea?.sellRequirementFeeRate),
        };
    }, [meta, currentItemData]);

    // if the name we got from the params are the id of the item, redirect
    // to a nice looking path
    if (currentItemByIdData) {
        return (
            <Navigate
                to={`/item/${currentItemByIdData.normalizedName}`}
                replace
            />
        );
    }

    // checks for item data loaded
    if (!currentItemData && (itemStatus === 'idle' || itemStatus === 'loading')) {
        currentItemData = loadingData;
    }

    if (!currentItemData && (itemStatus === 'success' || itemStatus === 'failed')) {
        return <ErrorPage />;
    }

    const hasProperties = !!currentItemData.properties;

    const containsItems = currentItemData?.containsItems?.length > 0;

    const hasBarters = barters.some(barter => {
        let requiredItems = barter.requiredItems.some(contained => contained.item.id === currentItemData.id);
        let rewardItems = barter.rewardItems.some(contained => contained.item.id === currentItemData.id || 
                                                               contained.item.containsItems.some(ci => ci.item.id === currentItemData.id));

        return requiredItems || rewardItems;
    });

    const hasCrafts = crafts.some(craft => {
        let requiredItems = craft.requiredItems.some(contained => contained.item.id === currentItemData.id);
        let rewardItems = craft.rewardItems.some(contained => contained.item.id === currentItemData.id);

        return requiredItems || rewardItems;
    });

    const usedInHideout = hideout?.some(station => station.levels.some(module => module.itemRequirements.some(contained => contained.item.id === currentItemData.id)));

    if (!currentItemData.bestPrice) {
        currentItemData = {
            ...currentItemData,
            ...bestPrice(currentItemData, meta?.flea?.sellOfferFeeRate, meta?.flea?.sellRequirementFeeRate),
        };
    }

    const itemFleaFee = fleaFee(currentItemData.basePrice, currentItemData.lastLowPrice, 1, meta?.flea?.sellOfferFeeRate, meta?.flea?.sellRequirementFeeRate);

    const traderIsBest = currentItemData.traderTotalPriceRUB > currentItemData.lastLowPrice - itemFleaFee;
    const useFleaPrice = currentItemData.lastLowPrice <= currentItemData.bestPrice;

    let fleaTooltip;

    if (!useFleaPrice && currentItemData.bestPrice) {
        fleaTooltip = (
            <div>
                <div className="tooltip-calculation">
                    {t('Best price to sell for')}{' '}
                    <div className="tooltip-price-wrapper">
                        {formatPrice(currentItemData.bestPrice)}
                    </div>
                </div>
                <div className="tooltip-calculation">
                    {t('Fee')}{' '}
                    <div className="tooltip-price-wrapper">
                        {formatPrice(currentItemData.bestPriceFee)}
                    </div>
                </div>
                <div className="tooltip-calculation">
                    {t('Profit')}{' '}
                    <div className="tooltip-price-wrapper">
                        {formatPrice(currentItemData.bestPrice - currentItemData.bestPriceFee)}
                    </div>
                </div>
                <div className="tooltip-calculation">
                    {t('Calculated over the average for the last 24 hours')}
                </div>
                {t('This item was sold for')}{' '}
                {formatPrice(currentItemData.avg24hPrice)}{' '}
                {t('on average in the last 24h on the Flea Market.')}
                {t(" However, due to how fees are calculated you're better off selling for")}{' '}
                {formatPrice(currentItemData.bestPrice)}
            </div>
        );
    } else if (!currentItemData.lastLowPrice) {
        fleaTooltip = t('No flea price seen');
    } else {
        fleaTooltip = (
            <div>
                <div className="tooltip-calculation">
                    {t('Likely sell price')}{' '}
                    <div className="tooltip-price-wrapper">
                        {useFleaPrice
                            ? formatPrice(currentItemData.lastLowPrice)
                            : formatPrice(currentItemData.bestPrice)}
                    </div>
                </div>
                <div className="tooltip-calculation">
                    {t('Fee')}{' '}
                    <div className="tooltip-price-wrapper">
                        {useFleaPrice
                            ? formatPrice(itemFleaFee)
                            : formatPrice(currentItemData.bestPriceFee)}
                    </div>
                </div>
                <div className="tooltip-calculation">
                    {t('Profit')}{' '}
                    <div className="tooltip-price-wrapper">
                        {useFleaPrice
                            ? formatPrice(currentItemData.lastLowPrice - itemFleaFee)
                            : formatPrice(currentItemData.bestPrice - currentItemData.bestPriceFee)}
                    </div>
                </div>
                <div className="tooltip-calculation">
                    {t('Calculated over the average for the last 24 hours')}
                </div>
            </div>
        );
    }

    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{`${currentItemData.name} - Escape from Tarkov`}</title>
            <meta
                name="description"
                content={`All the relevant information about ${currentItemData.name}`}
            />
            <link
                rel="canonical"
                href={`https://tarkov.dev/item/${currentItemData.normalizedName}`}
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className={'item-page-wrapper'}>
                <ItemSearch showDropdown />
                <div className="main-information-grid">
                    <div className="item-information-wrapper">
                        <h1>
                            <div className={'item-font'}>
                                {!currentItemData.types.includes('loading')
                                    ? (currentItemData.name)
                                    : (<LoadingSmall />)
                                }
                            </div>
                            <img
                                alt={currentItemData.name}
                                className={'item-image'}
                                loading="lazy"
                                height={62}
                                width={62}
                                src={currentItemData.iconLink}
                            />
                        </h1>
                        <cite className="item-short-name-wrapper">
                            {currentItemData.shortName}
                        </cite>
                        {currentItemData.wikiLink && (
                            <span className="wiki-link-wrapper">
                                <a href={currentItemData.wikiLink}>
                                    {t('Wiki')}
                                </a>
                            </span>
                        )}
                        {(currentItemData.properties?.grids || currentItemData.properties?.slots) && (
                            <div>
                                <ContainedItemsList item={currentItemData} />
                            </div>
                        )}
                    </div>
                    <div className="icon-and-link-wrapper">
                        {currentItemData.grid && (
                            <CanvasGrid
                                height={currentItemData.grid.height}
                                grid={currentItemData.grid.pockets}
                                width={currentItemData.grid.width}
                            />
                        )}
                        {currentItemData.gridImageLink && (
                            <img
                                alt={currentItemData.name}
                                className={'item-image'}
                                loading="lazy"
                                src={currentItemData.gridImageLink}
                            />
                        )}
                    </div>
                </div>
                <div className="trader-wrapper">
                    {currentItemData.sellFor && currentItemData.sellFor.length > 0 && (
                        <div>
                            <h2>{t('Sell for')}</h2>
                            <div className={'information-grid single-line-grid sell'}>
                                {!currentItemData.types.includes('noFlea') && (
                                    <Tippy
                                        placement="bottom"
                                        content={fleaTooltip}
                                    >
                                        <div className={`text-and-image-information-wrapper ${traderIsBest ? '' : 'best-profit'}`}>
                                            <img
                                                alt="Flea market"
                                                height="86"
                                                width="86"
                                                src={`${process.env.PUBLIC_URL}/images/flea-market-icon.jpg`}
                                                loading="lazy"
                                                // title = {`Sell ${currentItemData.name} on the Flea market`}
                                            />
                                            <div className="price-wrapper">
                                                {(!useFleaPrice || !currentItemData.lastLowPrice) && (
                                                    <img
                                                        alt="Warning"
                                                        loading="lazy"
                                                        className="warning-icon"
                                                        src={warningIcon}
                                                    />
                                                )}
                                                {(!useFleaPrice || currentItemData.lastLowPrice) && formatPrice(useFleaPrice ? currentItemData.lastLowPrice : currentItemData.bestPrice)}
                                            </div>
                                        </div>
                                    </Tippy>
                                )}
                                {currentItemData.traderName && currentItemData.traderPrice !== 0 && (
                                    <div className={`text-and-image-information-wrapper ${traderIsBest ? 'best-profit' : ''} first-trader-price`}>
                                        <Link
                                            to={`/traders/${currentItemData.traderNormalizedName}`}
                                        >
                                            <img
                                                alt={currentItemData.traderName}
                                                height="86"
                                                width="86"
                                                loading="lazy"
                                                src={`${process.env.PUBLIC_URL}/images/${currentItemData.traderNormalizedName}-icon.jpg`}
                                                // title = {`Sell ${currentItemData.name} on the Flea market`}
                                            />
                                        </Link>
                                        <div className="price-wrapper">
                                            <ConditionalWrapper
                                                condition={currentItemData.traderCurrency !== 'RUB'}
                                                wrapper={(children) => 
                                                    <Tippy
                                                        content={formatPrice(currentItemData.traderTotalPriceRUB)}
                                                        placement="bottom"
                                                    >
                                                        <div>{children}</div>
                                                    </Tippy>
                                                }
                                            >
                                                {formatPrice(currentItemData.traderTotalPrice, currentItemData.traderCurrency)}
                                            </ConditionalWrapper>
                                        </div>
                                    </div>
                                )}
                                {currentItemData.traderPrices && currentItemData.traderPrices.map(
                                    (traderPrice, traderPriceIndex) => {
                                        const traderName = traderPrice.trader.normalizedName;

                                        return (
                                            <div
                                                className={`text-and-image-information-wrapper`}
                                                key={`${currentItemData.id}-trader-price-${traderName}-${traderPriceIndex}`}
                                            >
                                                <ConditionalWrapper
                                                    condition={traderName !== 'fence'}
                                                    wrapper={(children) => 
                                                        <Link to={`/traders/${traderName}`}>
                                                            {children}
                                                        </Link>
                                                    }
                                                >
                                                    <img
                                                        alt={traderPrice.trader.name}
                                                        height="86"
                                                        loading="lazy"
                                                        width="86"
                                                        src={`${process.env.PUBLIC_URL}/images/${traderName}-icon.jpg`}
                                                        // title = {`Sell ${currentItemData.name} on the Flea market`}
                                                    />
                                                </ConditionalWrapper>
                                                <div className="price-wrapper">
                                                    <ConditionalWrapper
                                                        condition={traderPrice.currency !== 'RUB'}
                                                        wrapper={(children) => 
                                                            <Tippy
                                                                content={formatPrice(traderPrice.totalPriceRUB)}
                                                                placement="bottom"
                                                            >
                                                                <div>{children}</div>
                                                            </Tippy>
                                                        }
                                                    >
                                                        {formatPrice(traderPrice.totalPrice, traderPrice.currency)}
                                                    </ConditionalWrapper>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )}
                    {currentItemData.buyFor && currentItemData.buyFor.length > 0 && (
                        <div>
                            <h2>{t('Buy for')}</h2>
                            <div className="information-grid single-line-grid buy">
                                {currentItemData.buyFor.map(
                                    (buyPrice, index) => {
                                        const loyaltyLevel = buyPrice.requirements.find((requirement) => requirement.type === 'loyaltyLevel')?.value;
                                        return (
                                            <div
                                                className={`text-and-image-information-wrapper`}
                                                key={`${currentItemData.id}-trader-price-${buyPrice.source}-${index}`}
                                            >
                                                <div className="source-wrapper">
                                                    {buyPrice.source !== 'flea-market' && (
                                                        <LoyaltyLevelIcon
                                                            loyaltyLevel={
                                                                loyaltyLevel
                                                            }
                                                        />
                                                    )}
                                                    {buyPrice?.vendor?.taskUnlock && (
                                                        <Tippy
                                                            content={t('Quest: ')+buyPrice.vendor.taskUnlock.name}
                                                        >
                                                            <div className="quest-icon-wrapper">
                                                                <Icon
                                                                    path={mdiLock}
                                                                    size={1}
                                                                    className="icon-with-text"
                                                                />
                                                            </div>
                                                        </Tippy>
                                                    )}
                                                    <ConditionalWrapper
                                                        condition={buyPrice.source !== 'flea-market'}
                                                        wrapper={(children) => 
                                                            <Link to={`/traders/${buyPrice.source.toLowerCase()}`}>
                                                                {children}
                                                            </Link>
                                                        }
                                                    >
                                                        <img
                                                            alt={buyPrice.requirements.source}
                                                            height="86"
                                                            loading="lazy"
                                                            width="86"
                                                            src={`${process.env.PUBLIC_URL}/images/${buyPrice.source.toLowerCase()}-icon.jpg`}
                                                        />
                                                    </ConditionalWrapper>
                                                </div>
                                                <div className={`price-wrapper ${ index === 0 ? 'best-profit': ''}`}>
                                                    <TraderPrice
                                                        currency={
                                                            buyPrice.currency
                                                        }
                                                        price={
                                                            buyPrice.price
                                                        }
                                                        priceRUB={
                                                            buyPrice.priceRUB
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {currentItemData.id && !currentItemData.types.includes('noFlea') && (
                    <div>
                        <h2>{t('Flea price last 7 days')}</h2>
                        <PriceGraph
                            itemId={currentItemData.id}
                            itemChange24={currentItemData.changeLast48h}
                        />
                        <br />
                        <div className={`text-and-image-information-wrapper price-info-wrapper`}>
                            <div className="price-wrapper price-wrapper-bright">
                                <div>
                                    {t('Change vs yesterday')}: {currentItemData.changeLast48h} ₽ / {currentItemData.changeLast48hPercent} %
                                </div>
                                <div>
                                    {t('Lowest scanned price last 24h')}: {formatPrice(currentItemData.low24hPrice)}
                                </div>
                                <div>
                                    {t('Highest scanned price last 24h')}: {formatPrice(currentItemData.high24hPrice)}
                                </div>
                                <div title={dayjs(currentItemData.updated,).format('YYYY-MM-DD HH:mm:ss')}>
                                    {t('Updated')}: {dayjs(currentItemData.updated).fromNow()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    <h2 className='item-h2'>
                        {t('Stats')}
                    </h2>
                    {hasProperties
                        ? (<PropertyList properties={{...currentItemData.properties, categories: currentItemData.categories}} />)
                        : (<LoadingSmall />)
                    }
                </div>
                {containsItems && (
                    <div>
                        <div className="item-contents-headline-wrapper">
                            <h2>
                                {t('Items contained in')} {currentItemData.name}
                            </h2>
                            <ToggleFilter
                                checked={showAllContainedItemSources}
                                label={t('Ignore settings')}
                                onChange={(e) =>
                                    setShowAllContainedItemSources(!showAllContainedItemSources)
                                }
                                tooltipContent={
                                    <>
                                        {t('Shows all sources of items regardless of what you have set in your settings')}
                                    </>
                                }
                            />
                        </div>
                        <SmallItemTable
                            containedInFilter={currentItemData.containsItems}
                            fleaPrice
                            barterPrice
                            traderValue
                            traderPrice
                            cheapestPrice
                            sumColumns
                            showAllSources={showAllContainedItemSources}
                        />
                    </div>
                )}
                {hasBarters && (
                    <div>
                        <div className="item-barters-headline-wrapper">
                            <h2>
                                {t('Barters with')} {currentItemData.name}
                            </h2>
                            <ToggleFilter
                                checked={showAllBarters}
                                label={t('Ignore settings')}
                                onChange={(e) =>
                                    setShowAllBarters(!showAllBarters)
                                }
                                tooltipContent={
                                    <>
                                        {t('Shows all crafts regardless of what you have set in your settings')}
                                    </>
                                }
                            />
                        </div>
                        <BartersTable
                            itemFilter={currentItemData.id}
                            showAll={showAllBarters}
                        />
                    </div>
                )}
                {hasCrafts && (
                    <div>
                        <div className="item-crafts-headline-wrapper">
                            <h2>
                                {t('Crafts with')} {currentItemData.name}
                            </h2>
                            <ToggleFilter
                                checked={showAllCrafts}
                                label={t('Ignore settings')}
                                onChange={(e) =>
                                    setShowAllCrafts(!showAllCrafts)
                                }
                                tooltipContent={
                                    <>
                                        {t('Shows all crafts regardless of what you have set in your settings')}
                                    </>
                                }
                            />
                        </div>
                        <CraftsTable
                            itemFilter={currentItemData.id}
                            showAll={showAllCrafts}
                        />
                    </div>
                )}
                {usedInHideout && (
                    <div>
                        <div className="item-crafts-headline-wrapper">
                            <h2>
                                {t('Hideout modules needing')} {currentItemData.name}
                            </h2>
                            <ToggleFilter
                                checked={showAllHideoutStations}
                                label={t('Show built')}
                                onChange={(e) =>
                                    setShowAllHideoutStations(!showAllHideoutStations)
                                }
                                tooltipContent={
                                    <>
                                        {t('Shows all modules regardless of what you have set in your settings')}
                                    </>
                                }
                            />
                        </div>
                        <ItemsForHideout itemFilter={currentItemData.id} showAll={showAllHideoutStations} />
                    </div>
                )}
                {itemQuests.length > 0 && (
                    <QuestsList itemQuests={itemQuests} />
                )}
                {questsProviding.length > 0 && (
                    <QuestsList itemQuests={questsProviding} />
                )}
            </div>
        </div>,
    ];
}

export default Item;
