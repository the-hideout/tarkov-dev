import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

import { Icon } from '@mdi/react';
import { mdiClipboardList, mdiTimerSand, mdiCached, mdiProgressWrench } from '@mdi/js';

import SEO from '../../components/SEO.jsx';
import SmallItemTable from '../../components/small-item-table/index.js';
import CraftsTable from '../../components/crafts-table/index.js';
import BartersTable from '../../components/barters-table/index.js';
import QuestTable, { getRequiredQuestItems, getRewardQuestItems } from '../../components/quest-table/index.js';
import CanvasGrid from '../../components/canvas-grid/index.js';
import ErrorPage from '../error-page/index.js';
import LoyaltyLevelIcon from '../../components/loyalty-level-icon/index.js';
import PropertyList from '../../components/property-list/index.js';
import ItemsForHideout from '../../components/items-for-hideout/index.js';
import PriceGraph from '../../components/price-graph/index.js';
import ItemSearch from '../../components/item-search/index.js';
import { ToggleFilter, ButtonGroupFilter, ButtonGroupFilterButton, RangeFilter } from '../../components/filter/index.js';
import ContainedItemsList from '../../components/contained-items-list/index.js';
import LoadingSmall from '../../components/loading-small/index.js';
import ItemImage from '../../components/item-image/index.js';
import { PresetSelector } from '../../components/preset-selector/index.js';
import DataTable from '../../components/data-table/index.js';
import CenterCell from '../../components/center-cell/index.js';

import warningIcon from '../../images/icon-warning.png';

import useMetaData from '../../features/meta/index.js';
import useBartersData from '../../features/barters/index.js';
import useHideoutData from '../../features/hideout/index.js';
import useCraftsData from '../../features/crafts/index.js';
import useQuestsData from '../../features/quests/index.js';
import useItemsData from '../../features/items/index.js';
import useMapsData from '../../features/maps/index.js';
import { toggleHideDogtagBarters } from '../../features/settings/settingsSlice.mjs';

import formatPrice from '../../modules/format-price.js';
import bestPrice from '../../modules/best-price.js';
import { isAnyDogtag } from '../../modules/dogtags.js';
import { getRelativeTimeAndUnit } from '../../modules/format-duration.js';
import fleaMarketFee from '../../modules/flea-market-fee.mjs';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';
import { wipeDetails } from '../../modules/wipe-length.js';

import i18n from '../../i18n.js';

import './index.css';

const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
};

function TraderPrice({ currency, price, priceRUB }) {
    if (currency !== 'RUB') {
        return (
            <Tooltip title={formatPrice(priceRUB)} placement="bottom" arrow>
                <div>{formatPrice(price, currency)}</div>
            </Tooltip>
        );
    }

    return formatPrice(priceRUB);
}

function priceIsLocked(buyFor, settings) {
    let className = '';
    if (buyFor.vendor.trader && settings[buyFor.vendor.normalizedName] < buyFor.vendor.minTraderLevel) {
        className = ' locked';
    } else if (buyFor.vendor.normalizedName === 'flea-market' && !settings.hasFlea) {
        className = ' locked';
    }
    return className;
}

function Item() {
    const settings = useSelector((state) => state.settings[state.settings.gameMode]);
    const gameMode = useSelector((state) => state.settings.gameMode);
    const navigate = useNavigate();
    const { itemName } = useParams();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [showAllCrafts, setShowAllCrafts] = useState(false);
    const [showAllBarters, setShowAllBarters] = useState(false);
    const [showAllContainedItemSources, setShowAllContainedItemSources] = useState(false);
    const [showAllHideoutStations, setShowAllHideoutStations] = useState(false);
    const [hideCompletedQuests, setHideCompletedQuests] = useState(true);
    const [includeBarterIngredients, setIncludeBarterIngredients] = useStateWithLocalStorage(
        'includeBarterIngredients',
        true,
    );
    const [includeCraftIngredients, setIncludeCraftIngredients] = useStateWithLocalStorage(
        'includeCraftIngredients',
        false,
    );
    const [showAllCompatiblePlateSources, setShowAllCompatiblePlateSources] = useState(false);
    const [minArmorClass, setMinArmorClass] = useState(1);
    const [maxArmorClass, setMaxArmorClass] = useState(6);

    const handleArmorClassChange = useCallback(([min, max]) => {
        setMinArmorClass(min);
        setMaxArmorClass(max);
    }, [setMinArmorClass, setMaxArmorClass]);

    const [priceDays, setPriceDays] = useStateWithLocalStorage(
        'historicalPriceDays',
        7,
    );

    const loadingData = useMemo(() => {
        return {
            id: 'loading',
            name: t('Loading...'),
            shortName: t('Loading...'),
            types: ['loading'],
            iconLink: `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
            image512pxLink: `${process.env.PUBLIC_URL}/images/unknown-item-512.webp`,
            backgroundColor: 'default',
            sellFor: [],
            buyFor: [],
            sellForTradersBest: null,
        };
    }, [t]);

    const priceDaysLabels = useMemo(() => {
        const labels = [
            {
                label: t('{{count}} days_other', {count: 7}),
                value: 7,
            },
            {
                label: t('{{count}} days_other', {count: 14}),
                value: 14,
            },
            {
                label: t('{{count}} days_other', {count: 30}),
                value: 30,
            },
            {
                label: t('{{count}} months_other', {count: 6}),
                value: 183,
            },
            {
                label: t('{{count}} years_one', {count: 1}),
                value: 365,
            },
            {
                label: t('All'),
                value: 7300,
            },
        ];
        if (gameMode !== 'pve') {
            const wipes = wipeDetails();
            const currentWipe = wipes.find(w => w.ongoing === true);
            const insertIndex = labels.findIndex(l => l.value > currentWipe.lengthDays);
            if (insertIndex > 0) {
                labels.splice(insertIndex, 0, {
                    label: t('Wipe start'),
                    value: currentWipe.lengthDays, 
                });
            }
        }
        return labels;
    }, [t, gameMode]);

    const { data: items, status: itemsStatus } = useItemsData();

    const { data: meta } = useMetaData();

    const { data: barters } = useBartersData();

    const { data: crafts } = useCraftsData();

    const { data: hideout } = useHideoutData();

    const { data: quests } = useQuestsData();

    const { data: maps } = useMapsData();

    const currentItemData = useMemo(() => {
        let item = items.find(i => i.normalizedName === itemName);
        if (!item) {
            item = items.find(i => i.id === itemName);
        }
        if (!item && (itemsStatus === 'idle' || itemsStatus === 'loading')) {
            return loadingData;
        }
        if (item) {
            let extraProps = {};
            if (item.types.includes('keys')) {
                extraProps.usedOnMaps = maps.filter(map => map.locks.some(l => l.key.id === item.id)).sort((a, b) => a.name.localeCompare(b.name));
            }
            return {
                ...item,
                properties: {
                    ...item.properties,
                    ...extraProps,
                },
                ...bestPrice(item, meta?.flea?.sellOfferFeeRate, meta?.flea?.sellRequirementFeeRate),
            };
        }
        return item;
    }, [items, itemName, meta, itemsStatus, loadingData, maps]);

    const questsRequiringCount = useMemo(() => {
        if (!currentItemData || currentItemData.id === 'loading') {
            return [];
        }
        
        return quests.map((questData) => {
            return getRequiredQuestItems(questData, currentItemData.id);
        }).filter(required => required.length > 0).length;
    }, [currentItemData, quests]);

    const questsProvidingCount = useMemo(() => {
        if (!currentItemData || currentItemData.id === 'loading') {
            return [];
        }

        return quests.map(questData => {
            return getRewardQuestItems(questData, currentItemData.id);
        }).filter(reward => reward.length > 0).length;
    }, [currentItemData, quests]);

    const questsToggle = useMemo(() => {
        if (settings.completedQuests?.length > 0) {
            return (
                <ToggleFilter
                    checked={hideCompletedQuests}
                    label={t('Hide completed')}
                    onChange={(e) =>
                        setHideCompletedQuests(!hideCompletedQuests)
                    }
                    tooltipContent={
                        <>
                            {t('Hide tasks you\'ve completed')}
                        </>
                    }
                />
            );
        }
        return '';
    }, [settings, hideCompletedQuests, t]);

    const dogtagToggle = useMemo(() => {
        if (!currentItemData || isAnyDogtag(currentItemData.id)) {
            return '';
        }
        return (
            <ToggleFilter
                checked={settings.hideDogtagBarters}
                label={t('Hide dogtag barters')}
                onChange={(e) => dispatch(toggleHideDogtagBarters(!settings.hideDogtagBarters))}
                tooltipContent={
                    <>
                        {t('The true "cost" of barters using Dogtags is difficult to estimate, so you may want to exclude dogtag barters')}
                    </>
                }
                style={{marginLeft: '3px'}}
            />
        );
    }, [currentItemData, dispatch, settings, t]);

    const softArmorSlots = useMemo(() => {
        const columns = [
            {
                Header: t('Zone'),
                id: 'zones',
                accessor: (s) => s.zones.join(', '),
            },
            {
                Header: t('Class'),
                id: 'class',
                accessor: 'class',
                Cell: CenterCell,
            },
            {
                Header: t('Durability'),
                id: 'durability',
                accessor: 'durability',
                Cell: CenterCell,
            },
        ];
        if (!currentItemData?.properties?.armorSlots) {
            return {data: [], columns};
        }
        const softArmorSlots = currentItemData?.properties?.armorSlots.filter(slot => slot.durability);
        return {columns, data: softArmorSlots}
    }, [currentItemData, t]);
    const plateArmorSlots = useMemo(() => {
        if (!currentItemData?.properties?.armorSlots) {
            return [];
        }
        return currentItemData?.properties?.armorSlots.filter(slot => slot.allowedPlates);
    }, [currentItemData]);

    // if the name we got from the params are the id of the item, redirect
    // to a nice looking path
    useEffect(() => {
        if (currentItemData?.id === itemName) {
            navigate(`/item/${currentItemData.normalizedName}`);
        }
    }, [currentItemData, itemName, navigate]);

    if (!currentItemData && (itemsStatus === 'succeeded' || itemsStatus === 'failed')) {
        return <ErrorPage />;
    }

    const hasProperties = !!currentItemData.properties;

    const containsItems = currentItemData?.containsItems?.length > 0;

    const hasBarters = barters.some(barter => {
        let requiredItems = barter.requiredItems.some(contained => contained?.item.id === currentItemData.id);
        let rewardItems = barter.rewardItems.some(contained => contained?.item.id === currentItemData.id || 
                                                               contained?.item.containsItems.some(ci => ci?.item.id === currentItemData.id));

        return requiredItems || rewardItems;
    });

    const hasCrafts = crafts.some(craft => {
        let requiredItems = craft.requiredItems.some(contained => contained.item.id === currentItemData.id);
        let rewardItems = craft.rewardItems.some(contained => contained.item.id === currentItemData.id);

        return requiredItems || rewardItems;
    });

    const usedInHideout = hideout?.some(station => station.levels.some(module => module.itemRequirements.some(contained => contained.item.id === currentItemData.id)));
    
    const sellForTraders = currentItemData.sellFor.filter(sellFor => sellFor.vendor.normalizedName !== 'flea-market');

    currentItemData.fee = fleaMarketFee(currentItemData.basePrice, currentItemData.lastLowPrice);
    const sellForTradersIsTheBest = currentItemData.sellForTradersBest ? currentItemData.sellForTradersBest.priceRUB > currentItemData.lastLowPrice - currentItemData.fee : false;
    const useFleaPrice = currentItemData.lastLowPrice <= currentItemData.bestPrice;

    let fleaSellPriceDisplay = formatPrice(currentItemData.lastLowPrice);
    let fleaSellIcon = '';
    let fleaTooltip;
    
    if (!useFleaPrice && currentItemData.bestPrice) {
        fleaSellPriceDisplay = formatPrice(currentItemData.bestPrice);
        fleaSellIcon = (
            <img
                alt="Warning"
                loading="lazy"
                className="warning-icon"
                src={warningIcon}
            />
        );
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
                {t(
`The last observed low price for this item on the Flea Market was {{lastSeenPrice}}.
However, due to how fees are calculated, you're better off selling for {{bestPrice}}.`,
                    {
                        lastSeenPrice: formatPrice(currentItemData.lastLowPrice),
                        bestPrice: formatPrice(currentItemData.bestPrice)
                    }
                )}
            </div>
        );
    } else if (!currentItemData.lastLowPrice) {
        fleaSellPriceDisplay = '';
        fleaSellIcon = (
            <img
                alt="Warning"
                loading="lazy"
                className="warning-icon"
                src={warningIcon}
            />
        );
        fleaTooltip = (
            <div>
                <div className="tooltip-calculation">
                    {t('Max price to sell for')}{' '}
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
                {t(
`This item has not been observed on the Flea Market.
The maximum profitable price is {{bestPrice}}, but the item may not sell at that price.
The max profitable price is impacted by the intel center and hideout management skill levels in your settings.`,
                    {
                        bestPrice: formatPrice(currentItemData.bestPrice)
                    }
                )}
            </div>
        )
        if (currentItemData.cached) {
            fleaSellIcon = (
                <Icon
                    path={mdiTimerSand}
                    size={1}
                    className="icon-with-text"
                />
            );
            fleaTooltip = (
                <div>
                    {t('Flea market prices loading')}
                </div>
            );
        }
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
                            ? formatPrice(currentItemData.fee)
                            : formatPrice(currentItemData.bestPriceFee)}
                    </div>
                </div>
                <div className="tooltip-calculation">
                    {t('Profit')}{' '}
                    <div className="tooltip-price-wrapper">
                        {useFleaPrice
                            ? formatPrice(currentItemData.lastLowPrice - currentItemData.fee)
                            : formatPrice(currentItemData.bestPrice - currentItemData.bestPriceFee)}
                    </div>
                </div>
            </div>
        );
    }

    let showRestrictedType = currentItemData.types.includes('backpack') ? 'backpack' : undefined;

    let dateParsed = Date.parse(currentItemData.updated);
    let date = new Date(dateParsed);
    let relativeTime = getRelativeTimeAndUnit(dateParsed);

    return [
        <SEO 
            title={`${currentItemData.name} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('item-page-description', 'This page includes information on the characteristics, uses, and strategies for {{itemName}}.', { itemName: currentItemData.name })}
            url={`https://tarkov.dev/item/${currentItemData.normalizedName}`}
            image={currentItemData.image512pxLink}
            card='summary_large_image'
            key="seo-wrapper"
        />,
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
                                className={'item-icon'}
                                loading="lazy"
                                src={currentItemData.iconLink}
                            />
                        </h1>
                        <PresetSelector 
                            item={currentItemData}
                            alt={(
                                <cite className="item-short-name-wrapper">
                                    {currentItemData.shortName}
                                </cite>
                            )}
                        />
                        {currentItemData.wikiLink && (
                            <span className="wiki-link-wrapper">
                                <a href={currentItemData.wikiLink} target="_blank" rel="noopener noreferrer">
                                    {t('Wiki')}
                                </a>
                            </span>
                        )}
                        {showRestrictedType && (
                            <div>
                                <ContainedItemsList item={currentItemData} showRestrictedType={showRestrictedType} />
                            </div>
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
                                width={currentItemData.grid.width}
                                height={currentItemData.grid.height}
                                grid={currentItemData.grid.pockets}
                            />
                        )}
                        <ItemImage
                            item={currentItemData}
                            backgroundScale={2}
                            imageField={'image512pxLink'}
                            imageViewer={true}
                            nonFunctionalOverlay={true}
                        />
                    </div>
                </div>

                {/* Divider between sections */}
                <hr className="hr-muted"></hr>
                
                <div className="trader-wrapper">
                    {currentItemData.sellFor && currentItemData.sellFor.length > 0 && (
                        <div>
                            <h2>{t('Sell for')}</h2>
                            <div className={'information-grid single-line-grid sell'}>
                                {!currentItemData.types.includes('noFlea') && (
                                    <Tooltip
                                        placement="bottom"
                                        title={fleaTooltip}
                                        arrow
                                    >
                                        <div className={`text-and-image-information-wrapper ${sellForTradersIsTheBest ? '' : 'best-profit'}`}
                                                    key={`${currentItemData.id}-flea-market-price-sell`}>
                                            <img
                                                alt="Flea market"
                                                height="86"
                                                width="86"
                                                src={`${process.env.PUBLIC_URL}/images/traders/flea-market-portrait.png`}
                                                loading="lazy"
                                                // title = {`Sell ${currentItemData.name} on the Flea market`}
                                            />
                                            <div className="price-wrapper">
                                                {fleaSellIcon}
                                                {fleaSellPriceDisplay}
                                            </div>
                                        </div>
                                    </Tooltip>
                                )}
                                {sellForTraders && sellForTraders.map(
                                    (sellForTrader) => {
                                        const traderNormalizedName = sellForTrader.vendor.normalizedName;
                                        const traderIsBest = sellForTradersIsTheBest && traderNormalizedName === currentItemData.sellForTradersBest.vendor.normalizedName;

                                        return (
                                            <div className={`text-and-image-information-wrapper ${traderIsBest ? 'best-profit' : ''}`}
                                                    key={`${currentItemData.id}-trader-price-sell-${sellForTrader.vendor.normalizedName}`}>
                                                <Link to={`/trader/${traderNormalizedName}`} >
                                                    <img
                                                        alt={sellForTrader.vendor.name}
                                                        height="86"
                                                        width="86"
                                                        loading="lazy"
                                                        src={`${process.env.PUBLIC_URL}/images/traders/${traderNormalizedName}-portrait.png`}
                                                    />
                                                </Link>
                                                <div className={`price-wrapper${traderNormalizedName === 'fence' || settings[traderNormalizedName] ? '' : ' locked'}`}>
                                                    <ConditionalWrapper
                                                        condition={sellForTrader.currency !== 'RUB'}
                                                        wrapper={(children) => 
                                                            <Tooltip
                                                                title={formatPrice(sellForTrader.priceRUB)}
                                                                placement="bottom"
                                                                arrow
                                                            >
                                                                <div>{children}</div>
                                                            </Tooltip>
                                                        }
                                                    >
                                                        {formatPrice(sellForTrader.price, sellForTrader.currency)}
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
                                    (buyForSource, index) => {
                                        const loyaltyLevel = buyForSource.requirements.find((requirement) => requirement.type === 'loyaltyLevel')?.value;
                                        return (
                                            <div
                                                className={`text-and-image-information-wrapper`}
                                                key={`${currentItemData.id}-trader-price-buy-${buyForSource.vendor.normalizedName}-${index}`}
                                            >
                                                <div className="source-wrapper">
                                                    {buyForSource.vendor.normalizedName !== 'flea-market' && (
                                                        <LoyaltyLevelIcon
                                                            loyaltyLevel={
                                                                loyaltyLevel
                                                            }
                                                        />
                                                    )}
                                                    {buyForSource.vendor.taskUnlock && (
                                                        <div>
                                                            <Tooltip
                                                                title={(
                                                                    <Link to={`/task/${buyForSource.vendor.taskUnlock.normalizedName}`}>
                                                                        <div style={{whiteSpace: 'nowrap'}}>
                                                                            {t('Task: {{taskName}}', {taskName: buyForSource.vendor.taskUnlock.name})}
                                                                        </div>
                                                                    </Link>
                                                                )}
                                                                arrow
                                                            >
                                                                <div className="quest-icon-wrapper">
                                                                    <Icon
                                                                        path={mdiClipboardList}
                                                                        size={1}
                                                                        className="icon-with-text"
                                                                    />
                                                                </div>
                                                            </Tooltip>
                                                        </div>
                                                    )}
                                                    <ConditionalWrapper
                                                        condition={buyForSource.vendor.normalizedName !== 'flea-market'}
                                                        wrapper={(children) => 
                                                            <Link to={`/trader/${buyForSource.vendor.normalizedName}`}>
                                                                {children}
                                                            </Link>
                                                        }
                                                    >
                                                        <img
                                                            alt={buyForSource.vendor.name}
                                                            height="86"
                                                            width="86"
                                                            loading="lazy"
                                                            src={`${process.env.PUBLIC_URL}/images/traders/${buyForSource.vendor.normalizedName}-portrait.png`}
                                                        />
                                                    </ConditionalWrapper>
                                                </div>
                                                <div className={`price-wrapper ${ index === 0 ? 'best-profit': ''}${priceIsLocked(buyForSource, settings)}`}>
                                                    <TraderPrice
                                                        currency={
                                                            buyForSource.currency
                                                        }
                                                        price={
                                                            buyForSource.price
                                                        }
                                                        priceRUB={
                                                            buyForSource.priceRUB
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
                {currentItemData.id && currentItemData.id !== 'loading' && !currentItemData.types.includes('noFlea') && (
                    <div>
                        <h2>{t('Flea price history')} <Select
                            placeholder={priceDaysLabels.find(l => l.value === priceDays)?.label ?? t('{{count}} days_other', {count: priceDays})}
                            defaultValue={priceDays}
                            options={priceDaysLabels}
                            className="basic-multi-select historical-price-days"
                            classNamePrefix="select"
                            onChange={(event) => {
                                setPriceDays(event.value);
                            }}
                            styles={{display: 'inline'}}
                            ></Select>
                        </h2>
                        <PriceGraph
                            item={currentItemData}
                            days={priceDays}
                        />
                        <br />
                        <div className={`text-and-image-information-wrapper price-info-wrapper`}>
                            <div className="price-wrapper price-wrapper-bright">
                                <div>
                                    {t('Change vs yesterday: {{changeLast48h}} ₽ / {{changeLast48Percent}} %', {changeLast48h: currentItemData.changeLast48h, changeLast48Percent: currentItemData.changeLast48hPercent})}
                                </div>
                                <div>
                                    {t('Lowest scanned price last 24h: {{low24hPrice}}', {low24hPrice: formatPrice(currentItemData.low24hPrice)})}
                                </div>
                                <div>
                                    {t('Highest scanned price last 24h: {{high24hPrice}}', {high24hPrice: formatPrice(currentItemData.high24hPrice)})}
                                </div>
                                <div title={date.toLocaleString(i18n.language)}>
                                    {t('Updated: {{val, relativetime}}', { val: relativeTime[0], range: relativeTime[1] })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    <h2>
                        {t('Stats')}
                    </h2>
                    {hasProperties
                        ? (<PropertyList properties={{...currentItemData.properties, categories: currentItemData.categories}} id={currentItemData.id} />)
                        : (<LoadingSmall />)
                    }
                </div>
                {softArmorSlots.data.length > 0 && (
                    <div>
                        <div className="soft-armor-slots-headline-wrapper">
                            <h2>
                                {t('Soft Armor Slots')}
                            </h2>
                        </div>
                        <DataTable
                            className={`small-data-table`}
                            key="soft-armor-table"
                            columns={softArmorSlots.columns}
                            data={softArmorSlots.data}
                        />
                    </div>

                )}
                {plateArmorSlots.length > 0 && (
                    <div>
                        <div className="item-headline-wrapper-with-controls">
                            <h2>
                                {t('Compatible Armor Plates')}
                            </h2>
                            <span>
                                <ToggleFilter
                                    checked={showAllCompatiblePlateSources}
                                    label={t('Ignore settings')}
                                    onChange={(e) =>
                                        setShowAllCompatiblePlateSources(!showAllCompatiblePlateSources)
                                    }
                                    tooltipContent={
                                        <>
                                            {t('Shows all sources of items regardless of your settings')}
                                        </>
                                    }
                                />
                                <RangeFilter
                                    defaultValue={[1, 6]}
                                    label={t('Armor class')}
                                    min={1}
                                    max={6}
                                    marks={{1:1, 2:2, 3:3, 4:4, 5:5, 6:6}}
                                    onChange={(event, value) => {
                                        handleArmorClassChange(value);
                                    }}
                                />
                            </span>
                        </div>
                        <SmallItemTable
                            armorSlotFilter={plateArmorSlots}
                            minPropertyFilter={{
                                property: 'class',
                                value: minArmorClass,
                            }}
                            maxPropertyFilter={{
                                property: 'class',
                                value: maxArmorClass,
                            }}
                            armorZones={1}
                            armorClass={2}
                            effectiveDurability={3}
                            cheapestPrice
                            showAllSources={showAllCompatiblePlateSources}
                        />
                    </div>
                )}
                {containsItems && (
                    <div>
                        <div className="item-contents-headline-wrapper">
                            <h2>
                                {t('Items contained in {{itemName}}', {itemName: currentItemData.name})}
                            </h2>
                            <ToggleFilter
                                checked={showAllContainedItemSources}
                                label={t('Ignore settings')}
                                onChange={(e) =>
                                    setShowAllContainedItemSources(!showAllContainedItemSources)
                                }
                                tooltipContent={
                                    <>
                                        {t('Shows all sources of items regardless of your settings')}
                                    </>
                                }
                            />
                        </div>
                        <SmallItemTable
                            containedInFilter={currentItemData.containsItems}
                            fleaPrice
                            barterPrice
                            traderValue={1}
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
                                {t('Barters with {{itemName}}', {itemName: currentItemData.name})}
                            </h2>
                            <div className="filter-content-wrapper compact">
                                <ToggleFilter
                                    checked={showAllBarters}
                                    label={t('Ignore settings')}
                                    onChange={(e) =>
                                        setShowAllBarters(!showAllBarters)
                                    }
                                    tooltipContent={
                                        <>
                                            {t('Shows all barters regardless of your settings')}
                                        </>
                                    }
                                />
                                {dogtagToggle}
                                <ButtonGroupFilter>
                                    <ButtonGroupFilterButton
                                        tooltipContent={
                                            <>
                                                {t('Use barters for item sources')}
                                            </>
                                        }
                                        selected={includeBarterIngredients}
                                        content={<Icon path={mdiCached} size={1} className="icon-with-text"/>}
                                        onClick={setIncludeBarterIngredients.bind(undefined, !includeBarterIngredients)}
                                    />
                                    <ButtonGroupFilterButton
                                        tooltipContent={
                                            <>
                                                {t('Use crafts for item sources')}
                                            </>
                                        }
                                        selected={includeCraftIngredients}
                                        content={<Icon path={mdiProgressWrench} size={1} className="icon-with-text"/>}
                                        onClick={setIncludeCraftIngredients.bind(undefined, !includeCraftIngredients)}
                                    />
                                </ButtonGroupFilter>
                            </div>
                        </div>
                        <BartersTable
                            itemFilter={currentItemData.id}
                            showAll={showAllBarters}
                            useBarterIngredients={includeBarterIngredients}
                            useCraftIngredients={includeCraftIngredients}
                        />
                    </div>
                )}
                {hasCrafts && (
                    <div>
                        <div className="item-crafts-headline-wrapper">
                            <h2>
                                {t('Crafts with {{itemName}}', {itemName: currentItemData.name})}
                            </h2>
                            <ToggleFilter
                                checked={showAllCrafts}
                                label={t('Ignore settings')}
                                onChange={(e) =>
                                    setShowAllCrafts(!showAllCrafts)
                                }
                                tooltipContent={
                                    <>
                                        {t('Shows all crafts regardless of your settings')}
                                    </>
                                }
                            />
                            <ButtonGroupFilter>
                                <ButtonGroupFilterButton
                                    tooltipContent={
                                        <>
                                            {t('Use barters for item sources')}
                                        </>
                                    }
                                    selected={includeBarterIngredients}
                                    content={<Icon path={mdiCached} size={1} className="icon-with-text"/>}
                                    onClick={setIncludeBarterIngredients.bind(undefined, !includeBarterIngredients)}
                                />
                                <ButtonGroupFilterButton
                                    tooltipContent={
                                        <>
                                            {t('Use crafts for item sources')}
                                        </>
                                    }
                                    selected={includeCraftIngredients}
                                    content={<Icon path={mdiProgressWrench} size={1} className="icon-with-text"/>}
                                    onClick={setIncludeCraftIngredients.bind(undefined, !includeCraftIngredients)}
                                />
                            </ButtonGroupFilter>
                        </div>
                        <CraftsTable
                            itemFilter={currentItemData.id}
                            showAll={showAllCrafts}
                            useBarterIngredients={includeBarterIngredients}
                            useCraftIngredients={includeCraftIngredients}
                        />
                    </div>
                )}
                {usedInHideout && (
                    <div>
                        <div className="item-crafts-headline-wrapper">
                            <h2>
                                {t('Hideout modules needing {{itemName}}', {itemName: currentItemData.name})}
                            </h2>
                            <ToggleFilter
                                checked={showAllHideoutStations}
                                label={t('Show built')}
                                onChange={(e) =>
                                    setShowAllHideoutStations(!showAllHideoutStations)
                                }
                                tooltipContent={
                                    <>
                                        {t('Shows all modules regardless of your settings')}
                                    </>
                                }
                            />
                        </div>
                        <ItemsForHideout itemFilter={currentItemData.id} showAll={showAllHideoutStations} />
                    </div>
                )}
                {questsRequiringCount > 0 && (
                    <div>
                        <div className="item-crafts-headline-wrapper">
                            <h2>
                                {t('Quests requiring {{itemName}}', {itemName: currentItemData.name})}
                            </h2>
                            {questsToggle}
                        </div>
                        <QuestTable
                            hideCompleted={hideCompletedQuests}
                            requiredItemFilter={currentItemData.id}
                            requiredItems={1}
                        />
                    </div>
                )}
                {questsProvidingCount > 0 && (
                    <div>
                        <div className="item-crafts-headline-wrapper">
                            <h2>
                                {t('Quests rewarding {{itemName}}', {itemName: currentItemData.name})}
                            </h2>
                            {questsToggle}
                        </div>
                        <QuestTable
                            hideCompleted={hideCompletedQuests}
                            rewardItemFilter={currentItemData.id}
                            rewardItems={1}
                        />
                    </div>
                )}
            </div>
        </div>,
    ];
}

export default Item;
