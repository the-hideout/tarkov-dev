import React, { Suspense, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Navigate, Link } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import Icon from '@mdi/react';
import { mdiLock } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// import CraftsTable from '../../components/crafts-table';
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
import { Filter, ToggleFilter } from '../../components/filter';
import ContainedItemsList from '../../components/contained-items-list';

import formatPrice from '../../modules/format-price';
import fleaFee from '../../modules/flea-market-fee';
import bestPrice from '../../modules/best-price';

import Quests from '../../Quests';

import './index.css';
import {
    useItemByNameQuery,
    useItemByIdQuery,
} from '../../features/items/queries';

dayjs.extend(relativeTime);

const CraftsTable = React.lazy(() => import('../../components/crafts-table'));

const loadingData = {
    name: 'Loading...',
    types: [],
    iconLink: `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
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

function TraderPrice({ currency, price, priceRUB }) {
    if (currency !== 'RUB') {
        return (
            <Tippy content={formatPrice(priceRUB)} placement="bottom">
                <>{formatPrice(price, currency)}</>
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

    const { data: currentItemByNameData, status: itemStatus } =
        useItemByNameQuery(itemName);
    // TODO: This function needs to be greatly improved.
    //  it currently only needs to get a single item via its ID but it
    //  queries all items via graphql and then searches for said item.
    //  This is slow and does a lot of extra processing that is not needed
    const { data: currentItemByIdData } = useItemByIdQuery(itemName);

    let currentItemData = currentItemByNameData;

    const itemQuests = useMemo(() => {
        return Quests.filter((questData) => {
            const requiresItem = questData.objectives.find((objectiveData) => {
                return objectiveData.targetId === currentItemData?.id;
            });

            if (!requiresItem) {
                return false;
            }

            return true;
        }).map((questData) => {
            const questDataCopy = {
                ...questData,
            };
            questDataCopy.objectives = questDataCopy.objectives.filter(
                ({ targetId }) => targetId === currentItemData?.id,
            );

            questDataCopy.objectives.forEach((objectiveData) => {
                if (objectiveData.targetId === currentItemData?.id) {
                    objectiveData.iconLink = currentItemData.iconLink;
                    objectiveData.name = currentItemData.name;
                }
            });

            return questDataCopy;
        });
    }, [currentItemData]);

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

    if (
        !currentItemData &&
        (itemStatus === 'idle' || itemStatus === 'loading')
    ) {
        currentItemData = loadingData;
    }

    if (
        !currentItemData &&
        (itemStatus === 'success' || itemStatus === 'failed')
    ) {
        return <ErrorPage />;
    }

    if (!currentItemData.bestPrice) {
        currentItemData = {
            ...currentItemData,
            ...bestPrice(currentItemData),
        };
    }

    const traderIsBest =
        currentItemData.traderPriceRUB >
        currentItemData.lastLowPrice -
            fleaFee(currentItemData.basePrice, currentItemData.lastLowPrice)
            ? true
            : false;
    const useFleaPrice =
        currentItemData.lastLowPrice <= currentItemData.bestPrice;

    let fleaTooltip = (
        <>
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
                        ? formatPrice(
                              fleaFee(
                                    currentItemData.basePrice,
                                    currentItemData.lastLowPrice,
                              ),
                          )
                        : formatPrice(currentItemData.bestPriceFee)}
                </div>
            </div>
            <div className="tooltip-calculation">
                {t('Profit')}{' '}
                <div className="tooltip-price-wrapper">
                    {useFleaPrice
                        ? formatPrice(
                              currentItemData.lastLowPrice -
                                  fleaFee(
                                        currentItemData.basePrice,
                                        currentItemData.lastLowPrice,
                                  ),
                          )
                        : formatPrice(
                              currentItemData.bestPrice -
                                  currentItemData.bestPriceFee,
                          )}
                </div>
            </div>
            <div className="tooltip-calculation">
                {t('Calculated over the average for the last 24 hours')}
            </div>
        </>
    );

    if (!useFleaPrice) {
        fleaTooltip = (
            <>
                <div className="tooltip-calculation">
                    {t('Best price to sell for')}{' '}
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
                            ? formatPrice(
                                  fleaFee(
                                        currentItemData.basePrice,
                                        currentItemData.lastLowPrice,
                                  ),
                              )
                            : formatPrice(currentItemData.bestPriceFee)}
                    </div>
                </div>
                <div className="tooltip-calculation">
                    {t('Profit')}{' '}
                    <div className="tooltip-price-wrapper">
                        {useFleaPrice
                            ? formatPrice(
                                  currentItemData.lastLowPrice -
                                      fleaFee(
                                            currentItemData.basePrice,
                                            currentItemData.lastLowPrice,
                                      ),
                              )
                            : formatPrice(
                                  currentItemData.bestPrice -
                                      currentItemData.bestPriceFee,
                              )}
                    </div>
                </div>
                <div className="tooltip-calculation">
                    {t('Calculated over the average for the last 24 hours')}
                </div>
                {t('This item was sold for')}{' '}
                {formatPrice(currentItemData.avg24hPrice)}{' '}
                {t('on average in the last 24h on the Flea Market.')}
                {t(
                    " However, due to how fees are calculated you're better off selling for",
                )}{' '}
                {formatPrice(currentItemData.bestPrice)}
            </>
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
                            <div
                                style={{
                                    fontSize: 36,
                                    fontWeight: 'bold',
                                }}
                            >
                                {currentItemData.name}
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
                        {currentItemData.canHoldItems && (
                            <ContainedItemsList item={currentItemData} />
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
                    {currentItemData.sellFor &&
                        currentItemData.sellFor.length > 0 && (
                            <>
                                <h2>{t('Sell for')}</h2>
                                <div className={'information-grid'}>
                                    {!currentItemData.types.includes(
                                        'noFlea',
                                    ) && (
                                        <Tippy
                                            placement="bottom"
                                            content={fleaTooltip}
                                        >
                                            <div
                                                className={`text-and-image-information-wrapper flea-wrapper ${
                                                    traderIsBest
                                                        ? ''
                                                        : 'best-profit'
                                                }`}
                                            >
                                                <img
                                                    alt="Flea market"
                                                    height="86"
                                                    width="86"
                                                    src={`${process.env.PUBLIC_URL}/images/flea-market-icon.jpg`}
                                                    loading="lazy"
                                                    // title = {`Sell ${currentItemData.name} on the Flea market`}
                                                />
                                                <div className="price-wrapper">
                                                    {!useFleaPrice && (
                                                        <img
                                                            alt="Warning"
                                                            loading="lazy"
                                                            className="warning-icon"
                                                            src={warningIcon}
                                                        />
                                                    )}
                                                    <span>
                                                        {formatPrice(
                                                            useFleaPrice
                                                                ? currentItemData.lastLowPrice
                                                                : currentItemData.bestPrice,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </Tippy>
                                    )}
                                    {currentItemData.traderName &&
                                        currentItemData.traderPrice !== 0 && (
                                            <div
                                                className={`text-and-image-information-wrapper ${
                                                    traderIsBest
                                                        ? 'best-profit'
                                                        : ''
                                                } first-trader-price`}
                                            >
                                                <Link
                                                    to={`/traders/${currentItemData.traderName.toLowerCase()}`}
                                                >
                                                    <img
                                                        alt={
                                                            currentItemData.traderName
                                                        }
                                                        height="86"
                                                        width="86"
                                                        loading="lazy"
                                                        src={`${
                                                            process.env
                                                                .PUBLIC_URL
                                                        }/images/${currentItemData.traderName.toLowerCase()}-icon.jpg`}
                                                        // title = {`Sell ${currentItemData.name} on the Flea market`}
                                                    />
                                                </Link>
                                                <div className="price-wrapper">
                                                    {currentItemData.traderCurrency !== 'RUB' ? (
                                                        <Tippy
                                                            content={formatPrice(
                                                                currentItemData.traderPriceRUB,
                                                            )}
                                                            placement="bottom"
                                                        >
                                                            <>
                                                                {formatPrice(
                                                                    currentItemData.traderPrice,
                                                                    currentItemData.traderCurrency,
                                                                )}
                                                            </>
                                                        </Tippy>
                                                    ) : (
                                                        formatPrice(
                                                            currentItemData.traderPrice,
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    {currentItemData.traderPrices &&
                                        currentItemData.traderPrices.map(
                                            (traderPrice, traderPriceIndex) => {
                                                const traderName =
                                                    traderPrice.trader.toLowerCase();

                                                return (
                                                    <div
                                                        className={`text-and-image-information-wrapper`}
                                                        key={`${currentItemData.id}-trader-price-${traderName}-${traderPriceIndex}`}
                                                    >
                                                        {traderName !==
                                                            'fence' && (
                                                            <Link
                                                                to={`/traders/${traderName}`}
                                                            >
                                                                <img
                                                                    alt={
                                                                        traderName
                                                                    }
                                                                    height="86"
                                                                    loading="lazy"
                                                                    width="86"
                                                                    src={`${process.env.PUBLIC_URL}/images/${traderName}-icon.jpg`}
                                                                    // title = {`Sell ${currentItemData.name} on the Flea market`}
                                                                />
                                                            </Link>
                                                        )}
                                                        {traderName ===
                                                            'fence' && (
                                                            <img
                                                                alt={traderName}
                                                                height="86"
                                                                loading="lazy"
                                                                width="86"
                                                                src={`${process.env.PUBLIC_URL}/images/${traderName}-icon.jpg`}
                                                                // title = {`Sell ${currentItemData.name} on the Flea market`}
                                                            />
                                                        )}
                                                        <div className="price-wrapper">
                                                            {traderPrice.currency !== 'RUB' ? (
                                                                <Tippy
                                                                    content={formatPrice(
                                                                        traderPrice.priceRUB,
                                                                    )}
                                                                    placement="bottom"
                                                                >
                                                                    <>
                                                                        {formatPrice(
                                                                            traderPrice.price,
                                                                            traderPrice.currency,
                                                                        )}
                                                                    </>
                                                                </Tippy>
                                                            ) : (
                                                                formatPrice(
                                                                    traderPrice.price,
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                </div>
                            </>
                        )}
                    {currentItemData.buyFor &&
                        currentItemData.buyFor.length > 0 && (
                            <>
                                <h2>{t('Buy for')}</h2>
                                <div className="information-grid single-line-grid">
                                    {currentItemData.buyFor.map(
                                        (buyPrice, index) => {
                                            const loyaltyLevel =
                                                buyPrice.requirements.find(
                                                    (requirement) =>
                                                        requirement.type ===
                                                        'loyaltyLevel',
                                                )?.value;
                                            return (
                                                <div
                                                    className={`text-and-image-information-wrapper`}
                                                    key={`${currentItemData.id}-trader-price-${buyPrice.source}-${index}`}
                                                >
                                                    <div className="source-wrapper">
                                                        {buyPrice.source !==
                                                            'flea-market' && (
                                                            <LoyaltyLevelIcon
                                                                loyaltyLevel={
                                                                    loyaltyLevel
                                                                }
                                                            />
                                                        )}
                                                        {buyPrice.requirements.find(
                                                            (requirement) =>
                                                                requirement.type ===
                                                                'questCompleted',
                                                        ) && (
                                                            <Tippy
                                                                content={
                                                                    t('Locked behind a quest')
                                                                }
                                                            >
                                                                <div className="quest-icon-wrapper">
                                                                    <Icon
                                                                        path={
                                                                            mdiLock
                                                                        }
                                                                        size={1}
                                                                        className="icon-with-text"
                                                                    />
                                                                </div>
                                                            </Tippy>
                                                        )}
                                                        {buyPrice.source !==
                                                            'flea-market' && (
                                                            <Link
                                                                to={`/traders/${buyPrice.source.toLowerCase()}`}
                                                            >
                                                                <img
                                                                    alt={
                                                                        buyPrice
                                                                            .requirements
                                                                            .source
                                                                    }
                                                                    height="86"
                                                                    loading="lazy"
                                                                    width="86"
                                                                    src={`${
                                                                        process
                                                                            .env
                                                                            .PUBLIC_URL
                                                                    }/images/${buyPrice.source.toLowerCase()}-icon.jpg`}
                                                                />
                                                            </Link>
                                                        )}
                                                        {buyPrice.source ===
                                                            'flea-market' && (
                                                            <img
                                                                alt={
                                                                    buyPrice
                                                                        .requirements
                                                                        .source
                                                                }
                                                                height="86"
                                                                loading="lazy"
                                                                width="86"
                                                                src={`${
                                                                    process.env
                                                                        .PUBLIC_URL
                                                                }/images/${buyPrice.source.toLowerCase()}-icon.jpg`}
                                                            />
                                                        )}
                                                    </div>
                                                    <div
                                                        className={`price-wrapper ${
                                                            index === 0
                                                                ? 'best-profit'
                                                                : ''
                                                        }`}
                                                    >
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
                            </>
                        )}
                </div>
                {!currentItemData.types.includes('noFlea') && (
                    <>
                        <h2>{t('Flea price last 7 days')}</h2>
                        <PriceGraph
                            itemId={currentItemData.id}
                            itemChange24={currentItemData.changeLast48h}
                        />
                        <br />
                        <div
                            className={`text-and-image-information-wrapper price-info-wrapper`}
                        >
                            <div className="price-wrapper price-wrapper-bright">
                                <>
                                    {t('Change vs yesterday')}
                                    {': '}
                                    {currentItemData.changeLast48h} ₽
                                    {' / '}
                                    {currentItemData.changeLast48hPercent} %
                                </>
                                <>
                                    {t('Lowest scanned price last 24h')}
                                    {': '}
                                    {formatPrice(currentItemData.low24hPrice)}
                                </>
                                <>
                                    {t('Highest scanned price last 24h')}
                                    {': '}
                                    {formatPrice(currentItemData.high24hPrice)}
                                </>
                                <div
                                    title={dayjs(currentItemData.updated,).format('YYYY-MM-DD HH:mm:ss')}
                                >
                                    {t('Updated')}
                                    {': '}
                                    {dayjs(currentItemData.updated).fromNow()}
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <h2 style={{ marginTop: 10 }}>{t('Stats')}</h2>
                <PropertyList properties={currentItemData.properties} />
                <>
                    <div className="item-barters-headline-wrapper">
                        <h2>
                            {t('Barters with')} {currentItemData.name}
                        </h2>
                        <Filter>
                            <ToggleFilter
                                checked={showAllBarters}
                                label={t('Ignore settings')}
                                onChange={(e) =>
                                    setShowAllBarters(!showAllBarters)
                                }
                                tooltipContent={
                                    <>
                                        {t(
                                            'Shows all crafts regardless of what you have set in your settings',
                                        )}
                                    </>
                                }
                            />
                        </Filter>
                    </div>
                    <BartersTable
                        itemFilter={currentItemData.id}
                        showAll={showAllBarters}
                    />
                </>
                <>
                    <div className="item-crafts-headline-wrapper">
                        <h2>
                            {t('Crafts with')} {currentItemData.name}
                        </h2>
                        <Filter>
                            <ToggleFilter
                                checked={showAllCrafts}
                                label={t('Ignore settings')}
                                onChange={(e) =>
                                    setShowAllCrafts(!showAllCrafts)
                                }
                                tooltipContent={
                                    <>
                                        {t(
                                            'Shows all crafts regardless of what you have set in your settings',
                                        )}
                                    </>
                                }
                            />
                        </Filter>
                    </div>
                    <Suspense fallback={<>{t('Loading...')}</>}>
                        <CraftsTable
                            itemFilter={currentItemData.id}
                            showAll={showAllCrafts}
                        />
                    </Suspense>
                </>
                <>
                    <h2>
                        {t('Hideout modules needing')} {currentItemData.name}
                    </h2>
                    <Suspense fallback={<>{t('Loading...')}</>}>
                        <ItemsForHideout itemFilter={currentItemData.id} />
                    </Suspense>
                </>
                <QuestsList itemQuests={itemQuests} />
            </div>
        </div>,
    ];
}

export default Item;
