import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import { mdiClipboardList, mdiTimerSand, mdiCached, mdiProgressWrench } from '@mdi/js';

import SEO from '../../components/SEO';
import SmallItemTable from '../../components/small-item-table';
import CraftsTable from '../../components/crafts-table';
import BartersTable from '../../components/barters-table';
import QuestTable, { getRequiredQuestItems, getRewardQuestItems } from '../../components/quest-table';
import CanvasGrid from '../../components/canvas-grid';
import ErrorPage from '../../components/error-page';
import LoyaltyLevelIcon from '../../components/loyalty-level-icon';
import PropertyList from '../../components/property-list';
import ItemsForHideout from '../../components/items-for-hideout';
import PriceGraph from '../../components/price-graph';
import ItemSearch from '../../components/item-search';
import { ToggleFilter, ButtonGroupFilter, ButtonGroupFilterButton } from '../../components/filter';
import ContainedItemsList from '../../components/contained-items-list';
import LoadingSmall from '../../components/loading-small';
import ItemImage from '../../components/item-image';
import { PresetSelector } from '../../components/preset-selector';

import warningIcon from '../../images/icon-warning.png';

import { useMetaData } from '../../features/meta/metaSlice';
import { useBartersData } from '../../features/barters/bartersSlice';
import { useHideoutData } from '../../features/hideout/hideoutSlice';
import { useCraftsData } from '../../features/crafts/craftsSlice';
import { useQuestsData } from '../../features/quests/questsSlice';
import { useItemsData } from '../../features/items/itemsSlice';
import { toggleHideDogtagBarters } from '../../features/settings/settingsSlice';

import formatPrice from '../../modules/format-price';
import fleaFee from '../../modules/flea-market-fee';
import bestPrice from '../../modules/best-price';
import { isAnyDogtag } from '../../modules/dogtags';
import { getRelativeTimeAndUnit } from '../../modules/format-duration';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

import i18n from '../../i18n';

import './index.css';

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
    const settings = useSelector((state) => state.settings);
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

    const loadingData = useMemo(() => {
        return {
            id: 'loading',
            name: t('Loading...'),
            shortName: t('Loading...'),
            types: ['loading'],
            iconLink: `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
            gridImageLink: `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
            image512pxLink: `${process.env.PUBLIC_URL}/images/unknown-item-512.webp`,
            backgroundColor: 'default',
            sellFor: [],
            buyFor: [],
            sellForTradersBest: null,
        };
    }, [t]);

    const { data: items, status: itemsStatus } = useItemsData();

    const { data: meta } = useMetaData();

    const { data: barters } = useBartersData();

    const { data: crafts } = useCraftsData();

    const { data: hideout } = useHideoutData();

    const { data: quests } = useQuestsData();

    const currentItemData = useMemo(() => {
        let item = items.find(i => i.normalizedName === itemName);
        if (!item) {
            item = items.find(i => i.id === itemName);
        }
        if (!item && (itemsStatus === 'idle' || itemsStatus === 'loading')) {
            return loadingData;
        }
        if (item) {
            return {
                ...item,
                ...bestPrice(item, meta?.flea?.sellOfferFeeRate, meta?.flea?.sellRequirementFeeRate),
            };
        }
        return item;
    }, [items, itemName, meta, itemsStatus, loadingData]);

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

    // if the name we got from the params are the id of the item, redirect
    // to a nice looking path
    useEffect(() => {
        if (currentItemData?.id === itemName) {
            navigate(`/item/${currentItemData.normalizedName}`);
        }
    }, [currentItemData, itemName, navigate]);

    if (!currentItemData && (itemsStatus === 'success' || itemsStatus === 'failed')) {
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
    
    const sellForTraders = currentItemData.sellFor.filter(sellFor => sellFor.vendor.normalizedName !== 'flea-market');

    const itemFleaFee = fleaFee(currentItemData.basePrice, currentItemData.lastLowPrice, 1, meta?.flea?.sellOfferFeeRate, meta?.flea?.sellRequirementFeeRate);

    const sellForTradersIsTheBest = currentItemData.sellForTradersBest ? currentItemData.sellForTradersBest.priceRUB > currentItemData.lastLowPrice - itemFleaFee : false;
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
            </div>
        );
    }

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
                        {(currentItemData.properties?.grids || currentItemData.properties?.slots) && (
                            <div>
                                <ContainedItemsList item={currentItemData} items={items} />
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
                        <ItemImage
                            item={currentItemData}
                            backgroundScale={2}
                            imageField={'image512pxLink'}
                            imageViewer={true}
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
                                    <Tippy
                                        placement="bottom"
                                        content={fleaTooltip}
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
                                    </Tippy>
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
                                                            <Tippy
                                                                content={formatPrice(sellForTrader.priceRUB)}
                                                                placement="bottom"
                                                            >
                                                                <div>{children}</div>
                                                            </Tippy>
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
                                                key={`${currentItemData.id}-trader-price-buy-${buyForSource.vendor.normalizedName}`}
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
                                                            <Tippy
                                                                content={(
                                                                    <Link to={`/task/${buyForSource.vendor.taskUnlock.normalizedName}`}>
                                                                        <div style={{whiteSpace: 'nowrap'}}>
                                                                            {t('Task: {{taskName}}', {taskName: buyForSource.vendor.taskUnlock.name})}
                                                                        </div>
                                                                    </Link>
                                                                )}
                                                                interactive={true}
                                                            >
                                                                <div className="quest-icon-wrapper">
                                                                    <Icon
                                                                        path={mdiClipboardList}
                                                                        size={1}
                                                                        className="icon-with-text"
                                                                    />
                                                                </div>
                                                            </Tippy>
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
                {currentItemData.id && !currentItemData.types.includes('noFlea') && (
                    <div>
                        <h2>{t('Flea price last 7 days')}</h2>
                        <PriceGraph
                            item={currentItemData}
                            itemChange24={currentItemData.changeLast48h}
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
                        ? (<PropertyList properties={{...currentItemData.properties, categories: currentItemData.categories}} />)
                        : (<LoadingSmall />)
                    }
                </div>
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
