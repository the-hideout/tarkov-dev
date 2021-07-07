import React, { Suspense, useMemo, useEffect } from 'react';
import {Helmet} from 'react-helmet';
import {
    useParams,
    Redirect
} from "react-router-dom";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import { useSelector, useDispatch } from 'react-redux';

// import CraftsTable from '../../components/crafts-table';
import BartersTable from '../../components/barters-table';
import QuestsList from '../../components/quests-list'
import CanvasGrid from '../../components/canvas-grid';
import warningIcon from '../../images/icon-warning.png';
import ErrorPage from '../../components/error-page';
import Loading from '../../components/loading';
import LoyaltyLevelIcon from '../../components/loyalty-level-icon';

import formatPrice from '../../modules/format-price';
import fleaFee from '../../modules/flea-market-fee';
import { selectAllItems, fetchItems } from '../../features/items/itemsSlice';

import Quests from '../../Quests';

import './index.css';

const CraftsTable = React.lazy(() => import('../../components/crafts-table'));

function Item() {
    const {itemName} = useParams();
    const dispatch = useDispatch();
    const items = useSelector(selectAllItems);
    const itemStatus = useSelector((state) => {
        return state.items.status;
    });

    useEffect(() => {
        if (itemStatus === 'idle') {
          dispatch(fetchItems());
        }
    }, [itemStatus, dispatch]);

    let currentItemData = items.find(item => {
        return item.normalizedName === itemName;
    });
    let redirect = false;

    if(!currentItemData){
        currentItemData = items.find(item => item.id === itemName);

        if(currentItemData){
            redirect = true;
        }
    }

    const itemQuests = useMemo(() => {
        return Quests
            .filter((questData) => {
                return questData.objectives.find((objectiveData) => {
                    return objectiveData.targetId === currentItemData?.id;
                });
            });
    }, [currentItemData]);

    if(redirect){
        return <Redirect to={`/item/${currentItemData.normalizedName}`} />;
    }

    if(!currentItemData && (itemStatus === 'idle' || itemStatus === 'loading')){
        return <Loading />;
    }

    if(!currentItemData && (itemStatus === 'succeeded' || itemStatus === 'failed')){
        return <ErrorPage />;
    }

    const traderIsBest = currentItemData.traderPrice > currentItemData.lastLowPrice - fleaFee(currentItemData.avg24hPrice, currentItemData.basePrice) ? true : false;
    const useFleaPrice = currentItemData.avg24hPrice <= currentItemData.bestPrice;

    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta charSet="utf-8" />
            <title>
                {`${currentItemData.name} - Escape from Tarkov`}
            </title>
            <meta
                name="description"
                content= {`All the relevant information about ${currentItemData.name}`}
            />
            <link
                rel = 'canonical'
                href = {`https://tarkov-tools.com/item/${currentItemData.normalizedName}`}
            />
        </Helmet>,
        <div
            className="display-wrapper"
            key = {'display-wrapper'}
        >
            <div
                className = {'item-page-wrapper'}
            >
                <div
                    className = 'information-grid'
                >
                    <h1>
                        {currentItemData.name}
                        <cite>
                            {currentItemData.shortName}
                        </cite>
                    </h1>
                    <div
                        className = 'icon-and-link-wrapper'
                    >
                        {currentItemData.grid && <CanvasGrid
                            height = {currentItemData.grid.height}
                            grid = {currentItemData.grid.pockets}
                            width = {currentItemData.grid.width}
                        />}
                        <img
                            className = {'item-image'}
                            alt = {currentItemData.name}
                            src = {`https://assets.tarkov-tools.com/${currentItemData.id}-grid-image.jpg`}
                        />
                        <a
                            href={currentItemData.wikiLink}
                        >Wiki</a>
                    </div>

                </div>
                <div
                    className = 'information-grid information-outer-grid'
                >
                    <div
                        className = 'information-grid'
                    >
                        <h2>
                            Sell for
                        </h2>
                        <Tippy
                            placement = 'bottom'
                            content={
                            <div>
                                <div
                                    className = 'tooltip-calculation'
                                >
                                    Best price to sell for <div className = 'tooltip-price-wrapper'>{useFleaPrice ? formatPrice(currentItemData.lastLowPrice) : formatPrice(currentItemData.bestPrice)}</div>
                                </div>
                                <div
                                    className = 'tooltip-calculation'
                                >
                                    Fee <div className = 'tooltip-price-wrapper'>{useFleaPrice ? formatPrice(fleaFee(currentItemData.lastLowPrice, currentItemData.basePrice)) : formatPrice(currentItemData.bestPriceFee)}</div>
                                </div>
                                <div
                                    className = 'tooltip-calculation'
                                >
                                    Profit <div className = 'tooltip-price-wrapper'>{useFleaPrice ? formatPrice(currentItemData.lastLowPrice - fleaFee(currentItemData.lastLowPrice, currentItemData.basePrice)) : formatPrice(currentItemData.bestPrice - currentItemData.bestPriceFee)}</div>
                                </div>
                            </div>
                        }>
                            <div
                                className = {`text-and-image-information-wrapper ${traderIsBest ? '' : 'best-profit'}`}
                            >
                                <img
                                    alt = 'Flea market'
                                    src = {`${ process.env.PUBLIC_URL }/images/flea-market-icon.jpg`}
                                    // title = {`Sell ${currentItemData.name} on the Flea market`}
                                />
                                <div
                                    className = 'price-wrapper'
                                >
                                    {!useFleaPrice && <Tippy
                                        placement = 'bottom'
                                        content={ <div>This item is currently being sold for {formatPrice(currentItemData.lastLowPrice)} on the Flea Market.
                                However, due to how fees are calculated you're better off selling for {formatPrice(currentItemData.bestPrice)}</div>}
                                        >
                                            <img
                                                alt = 'Warning'
                                                className = 'warning-icon'
                                                src = {warningIcon}
                                            />
                                        </Tippy>
                                    }
                                    <span>
                                        {formatPrice(useFleaPrice ? currentItemData.lastLowPrice : currentItemData.bestPrice)}
                                    </span>
                                </div>
                            </div>
                        </Tippy>
                        <div
                            className = {`text-and-image-information-wrapper price-info-wrapper`}
                        >
                            <div
                                className = 'price-wrapper'
                            >
                                <div>
                                    Change vs yesterday: {currentItemData.changeLast48h} %
                                </div>
                                <div>
                                    Lowest scanned price last 24h: {formatPrice(currentItemData.low24hPrice)}
                                </div>
                                <div>
                                    Highetst scanned price last 24h: {formatPrice(currentItemData.high24hPrice)}
                                </div>
                            </div>
                        </div>
                        {currentItemData.traderPrices.length > 0 &&
                            <div
                                className = {`text-and-image-information-wrapper ${traderIsBest ? 'best-profit' : ''} first-trader-price`}
                            >
                                <img
                                    alt = {currentItemData.traderName}
                                    src = {`${ process.env.PUBLIC_URL }/images/${currentItemData.traderName.toLowerCase()}-icon.jpg`}
                                    // title = {`Sell ${currentItemData.name} on the Flea market`}
                                />
                                <div
                                    className = 'price-wrapper'
                                >
                                    {formatPrice(currentItemData.traderPrice)}
                                </div>
                            </div>
                        }
                        {currentItemData.traderPrices.map((traderPrice) => {
                            const traderName = traderPrice.trader.toLowerCase();

                            return <div
                                className = {`text-and-image-information-wrapper`}
                                key = {`${currentItemData.id}-trader-price-${traderName}`}
                            >
                                <img
                                    alt = {traderName}
                                    src = {`${ process.env.PUBLIC_URL }/images/${traderName}-icon.jpg`}
                                    // title = {`Sell ${currentItemData.name} on the Flea market`}
                                />
                                <div
                                    className = 'price-wrapper'
                                >
                                    {traderName === 'peacekeeper' ? <Tippy
                                        content = {formatPrice(traderPrice.price)}
                                        placement = 'bottom'
                                    >
                                        <div>
                                            {formatPrice(traderPrice.price / 124, 'USD')}
                                        </div>
                                    </Tippy> : formatPrice(traderPrice.price)}
                                </div>
                            </div>
                        })}
                    </div>
                    <div
                        className = 'information-grid'
                    >
                        <h2>
                            Buy for
                        </h2>
                        {currentItemData.buyFor.map((buyPrice, index) => {
                            const loyaltyLevel = buyPrice.requirements.find(requirement => requirement.type === 'loyaltyLevel')?.value;
                            return <div
                                className = {`text-and-image-information-wrapper`}
                                key = {`${currentItemData.id}-trader-price-${buyPrice.source}`}
                            >
                                <div
                                    className = 'source-wrapper'
                                >
                                    <LoyaltyLevelIcon
                                        loyaltyLevel = {loyaltyLevel}
                                    />
                                    <img
                                        alt = {buyPrice.requirements.source}
                                        src = {`${ process.env.PUBLIC_URL }/images/${buyPrice.source.toLowerCase()}-icon.jpg`}
                                    />
                                </div>
                                <div
                                    className = {`price-wrapper ${index === 0 ? 'best-profit' : ''}`}
                                >
                                    {buyPrice.source === 'peacekeeper' ? formatPrice(buyPrice.price, 'USD'): formatPrice(buyPrice.price)}
                                </div>
                            </div>
                        })}
                    </div>
                </div>
                <div>
                    <h2>
                        Barters with {currentItemData.name}
                    </h2>
                    <BartersTable
                        nameFilter = {currentItemData.name}
                    />
                </div>
                <div>
                    <h2>
                        Crafts with {currentItemData.name}
                    </h2>
                    <Suspense fallback={<div>Loading...</div>}>
                        <CraftsTable
                            nameFilter = {currentItemData.name}
                        />
                    </Suspense>
                </div>
                <QuestsList
                    itemQuests = {itemQuests}
                />
                {/* <pre>
                    {JSON.stringify(currentItemData, null, 4)}
                </pre> */}
            </div>
        </div>,
    ];
};

export default Item;


