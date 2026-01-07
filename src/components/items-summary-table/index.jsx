import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@mui/material";
import { Icon } from "@mdi/react";
import {
    mdiCloseOctagon,
    mdiHelpRhombus,
    mdiCached,
    mdiClipboardList,
    mdiTimerSand,
    mdiCloseCircle,
    mdiCheckCircle,
} from "@mdi/js";

import DataTable from "../data-table/index.jsx";
import ItemNameCell from "../item-name-cell/index.jsx";
import ValueCell from "../value-cell/index.jsx";
import BarterTooltip from "../barter-tooltip/index.jsx";

import formatPrice from "../../modules/format-price.js";
import { getCheapestPrice } from "../../modules/format-cost-items.js";

import useItemsData from "../../features/items/index.js";
import useBartersData from "../../features/barters/index.js";
import useCraftsData from "../../features/crafts/index.js";
import useTradersData from "../../features/traders/index.js";
import useHideoutData from "../../features/hideout/index.js";

import FleaMarketLoadingIcon from "../FleaMarketLoadingIcon.jsx";

import "./index.css";

const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
};

function ItemsSummaryTable({ includeItems, includeTraders, includeStations }) {
    const { t } = useTranslation();

    const settings = useSelector((state) => state.settings[state.settings.gameMode]);
    const { data: items } = useItemsData();
    const { data: barters } = useBartersData();
    const { data: crafts } = useCraftsData();
    const { data: traders } = useTradersData();
    const { data: stations } = useHideoutData();

    const data = useMemo(() => {
        const requiredItems = items
            .filter((item) => includeItems.some((it) => it.id === item.id))
            .map((item) => {
                const includeItem = includeItems.find((includeItem) => includeItem.id === item.id);
                const foundInRaid = includeItem.attributes?.some(
                    (att) => att.name === "foundInRaid" && att.value === "true",
                );
                const formattedItem = {
                    ...item,
                    quantity: includeItem.quantity,
                    foundInRaid,
                    attribtues: includeItem.attributes,
                    itemLink: `/item/${item.normalizedName}`,
                    barters: barters.filter((barter) => barter.rewardItems[0].item.id === item.id),
                };

                formattedItem.cheapestObtainInfo = getCheapestPrice(formattedItem, {
                    barters,
                    crafts,
                    settings,
                    useBarterIngredients: false,
                    useCraftIngredients: false,
                });
                formattedItem.cheapestPrice = formattedItem.cheapestObtainInfo.pricePerUnit;
                if (formattedItem.id === "5449016a4bdc2d6f028b456f") {
                    formattedItem.cheapestPrice = 1;
                    formattedItem.cheapestObtainInfo.price = 1;
                    formattedItem.cheapestObtainInfo.priceRUB = 1;
                    formattedItem.cheapestObtainInfo.pricePerUnit = 1;
                }

                formattedItem.totalPrice = formattedItem.cheapestObtainInfo.pricePerUnit * formattedItem.quantity;

                return formattedItem;
            });
        for (const req of includeTraders) {
            const trader = traders.find((t) => t.id === req.trader.id);
            requiredItems.push({
                ...trader,
                quantity: req.level,
                itemLink: `/trader/${trader.normalizedName}`,
                iconLink: `images/traders/${trader.normalizedName}-icon.jpg`,
                types: [],
                barters: [],
                buyOnFleaPrice: 0,
                cheapestPrice: 0,
                requiredTraderLevel: trader.levels.find((l) => l.level === req.level),
                totalPrice: 0,
                levelMet: settings[trader.normalizedName] >= req.level,
            });
        }
        for (const req of includeStations) {
            const station = stations.find((s) => s.id === req.station.id);
            requiredItems.push({
                ...station,
                quantity: req.level,
                //itemLink: `#`,
                iconLink: station.imageLink,
                types: [],
                barters: [],
                buyOnFleaPrice: 0,
                cheapestPrice: 0,
                requiredStationLevel: station.levels.find((l) => l.level === req.level),
                totalPrice: 0,
                levelMet: settings[station.normalizedName] >= req.level,
            });
        }
        return requiredItems;
    }, [items, includeItems, includeTraders, includeStations, settings, barters, crafts, traders, stations]);

    let displayColumns = useMemo(() => {
        const useColumns = [
            {
                Header: t("Item"),
                id: "name",
                accessor: "name",
                Cell: (props) => {
                    return <ItemNameCell item={props.row.original} items={items} />;
                },
            },
            {
                Header: t("Amount"),
                id: "quantity",
                accessor: "quantity",
                Cell: (props) => {
                    let quantity = props.value.toLocaleString();
                    let tipContent = [];
                    const priceContent = [];
                    let addedClasses = "";
                    if (props.row.original.requiredTraderLevel) {
                        const trader = props.row.original;
                        priceContent.push(
                            <Icon
                                path={props.row.original.levelMet ? mdiCheckCircle : mdiCloseCircle}
                                size={1}
                                className="icon-with-text"
                                key="no-prices-icon"
                            />,
                        );
                        if (!props.row.original.levelMet) {
                            addedClasses = " trader-station-level-unmet";
                        }
                        tipContent.push(
                            <div key="player-level">
                                {t("Player level: {{playerLevel}}", {
                                    playerLevel: trader.requiredTraderLevel.requiredPlayerLevel,
                                })}
                            </div>,
                        );
                        tipContent.push(
                            <div key="rep-level">
                                {t("Reputation: {{reputation}}", {
                                    reputation: trader.requiredTraderLevel.requiredReputation,
                                })}
                            </div>,
                        );
                        tipContent.push(
                            <div key="commerce-level">
                                {t("Commerce: {{commerce}}", {
                                    commerce: formatPrice(
                                        trader.requiredTraderLevel.requiredCommerce,
                                        trader.currency.normalizedName,
                                    ),
                                })}
                            </div>,
                        );
                    } else if (props.row.original.requiredStationLevel) {
                        if (!props.row.original.levelMet) {
                            addedClasses = " trader-station-level-unmet";
                        }
                    }
                    return (
                        <ConditionalWrapper
                            condition={tipContent.length > 0}
                            wrapper={(children) => {
                                return (
                                    <Tooltip placement="right" title={tipContent} arrow>
                                        {children}
                                    </Tooltip>
                                );
                            }}
                        >
                            <div className={`center-content${addedClasses}`}>{quantity}</div>
                        </ConditionalWrapper>
                    );
                },
            },
            {
                Header: t("Cheapest Price"),
                id: "cheapestPrice",
                accessor: "cheapestPrice",
                sortType: (a, b, columnId, desc) => {
                    const aCheap = a.values.cheapestPrice || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    const bCheap = b.values.cheapestPrice || (desc ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER);
                    return aCheap - bCheap;
                },
                Cell: (props) => {
                    let tipContent = "";
                    const priceContent = [];
                    const cheapestObtainInfo = props.row.original.cheapestObtainInfo;
                    if (cheapestObtainInfo && cheapestObtainInfo.type !== "none") {
                        let priceSource = "";
                        const displayedPrice = [];
                        let taskIcon = "";
                        let barterIcon = "";
                        if (!cheapestObtainInfo.barter && !cheapestObtainInfo.craft) {
                            if (props.row.original.id === "5449016a4bdc2d6f028b456f") {
                                priceSource = "";
                            } else if (cheapestObtainInfo.vendor.normalizedName === "flea-market") {
                                priceSource = cheapestObtainInfo.vendor.name;
                            } else {
                                let sellTo = "";
                                let loyalty = ` ${t("LL{{level}}", { level: cheapestObtainInfo.vendor.minTraderLevel })}`;
                                if (cheapestObtainInfo.type === "cash-sell") {
                                    sellTo = `${t("Sell to")} `;
                                    loyalty = "";
                                }
                                priceSource = `${sellTo}${cheapestObtainInfo.vendor.name}${loyalty}`;
                            }
                            if (cheapestObtainInfo.vendor?.taskUnlock) {
                                taskIcon = (
                                    <Icon
                                        key="price-task-tooltip-icon"
                                        path={mdiClipboardList}
                                        size={1}
                                        className="icon-with-text"
                                    />
                                );
                                tipContent = (
                                    <div>
                                        <Link to={`/task/${cheapestObtainInfo.vendor.taskUnlock.normalizedName}`}>
                                            {t("Task: {{taskName}}", {
                                                taskName: cheapestObtainInfo.vendor.taskUnlock.name,
                                            })}
                                        </Link>
                                    </div>
                                );
                            }
                        } else if (cheapestObtainInfo.barter) {
                            priceSource = `${cheapestObtainInfo.barter.trader.name} ${t("LL{{level}}", { level: cheapestObtainInfo.barter.level })}`;
                            barterIcon = (
                                <Icon key="barter-tooltip-icon" path={mdiCached} size={1} className="icon-with-text" />
                            );
                            let barterTipTitle = "";
                            if (cheapestObtainInfo.barter.taskUnlock) {
                                taskIcon = (
                                    <Icon
                                        key="barter-task-tooltip-icon"
                                        path={mdiClipboardList}
                                        size={1}
                                        className="icon-with-text"
                                    />
                                );
                                barterTipTitle = (
                                    <Link to={`/task/${cheapestObtainInfo.barter.taskUnlock.normalizedName}`}>
                                        {t("Task: {{taskName}}", {
                                            taskName: cheapestObtainInfo.barter.taskUnlock.name,
                                        })}
                                    </Link>
                                );
                            }
                            tipContent = (
                                <BarterTooltip
                                    barter={cheapestObtainInfo.barter}
                                    showTitle={taskIcon !== ""}
                                    title={barterTipTitle}
                                    allowAllSources={false}
                                    barters={barters}
                                    crafts={crafts}
                                    useBarterIngredients={false}
                                    useCraftIngredients={false}
                                />
                            );
                        } else if (cheapestObtainInfo.craft) {
                            const craft = cheapestObtainInfo.craft;
                            const station = stations.find((s) => s.id === craft.station.id);
                            priceSource = `${station.name} ${craft.level}`;
                            let barterTipTitle = "";
                            if (craft.taskUnlock) {
                                taskIcon = (
                                    <Icon
                                        key="craft-task-tooltip-icon"
                                        path={mdiClipboardList}
                                        size={1}
                                        className="icon-with-text"
                                    />
                                );
                                barterTipTitle = (
                                    <Link to={`/task/${craft.taskUnlock.normalizedName}`}>
                                        {t("Task: {{taskName}}", { taskName: craft.taskUnlock.name })}
                                    </Link>
                                );
                            }
                            tipContent = (
                                <BarterTooltip
                                    barter={craft}
                                    showTitle={taskIcon !== ""}
                                    title={barterTipTitle}
                                    allowAllSources={false}
                                    barters={barters}
                                    crafts={crafts}
                                    useBarterIngredients={false}
                                    useCraftIngredients={false}
                                />
                            );
                        }
                        displayedPrice.push(priceSource);
                        displayedPrice.push(barterIcon);
                        displayedPrice.push(taskIcon);
                        priceContent.push(<div key="price-info">{formatPrice(props.value)}</div>);
                        priceContent.push(
                            <div key="price-source-info" className="trader-unlock-wrapper">
                                {displayedPrice}
                            </div>,
                        );
                    } else if (props.row.original.requiredTraderLevel) {
                        priceContent.push("-");
                    } else if (props.row.original.requiredStationLevel) {
                        priceContent.push("-");
                    } else if (props.row.original.foundInRaid) {
                        priceContent.push(t("Found In Raid"));
                    } else {
                        tipContent = [];
                        if (props.row.original.types.includes("noFlea")) {
                            priceContent.push(
                                <Icon path={mdiCloseOctagon} size={1} className="icon-with-text" key="no-flea-icon" />,
                            );
                            tipContent.push(
                                <div key={"no-flea-tooltip"}>{t("This item can't be sold on the Flea Market")}</div>,
                            );
                        } else if (!settings.hasFlea) {
                            priceContent.push(
                                <Icon
                                    path={mdiCloseOctagon}
                                    size={1}
                                    className="icon-with-text"
                                    key="no-prices-icon"
                                />,
                            );
                            tipContent.push(<div key={"no-flea-tooltip"}>{t("Flea Market not available")}</div>);
                        } else {
                            let tipText = t("Not scanned on the Flea Market");
                            let icon = mdiHelpRhombus;
                            if (props.row.original.cached) {
                                tipText = t("Flea market prices loading");
                                icon = mdiTimerSand;
                            }
                            priceContent.push(
                                <Icon path={icon} size={1} className="icon-with-text" key="no-prices-icon" />,
                            );
                            tipContent.push(<div key={"no-flea-tooltip"}>{tipText}</div>);
                        }
                        tipContent.push(<div key={"no-trader-sell-tooltip"}>{t("No trader offers available")}</div>);
                    }
                    return (
                        <ConditionalWrapper
                            condition={tipContent}
                            wrapper={(children) => {
                                return (
                                    <Tooltip placement="right" title={tipContent} arrow>
                                        {children}
                                    </Tooltip>
                                );
                            }}
                        >
                            <div className="center-content">{priceContent}</div>
                        </ConditionalWrapper>
                    );
                },
            },
            {
                Header: t("Cost"),
                id: "totalPrice",
                accessor: "totalPrice",
                Cell: (props) => {
                    if (!props.value && props.row.original.cached) {
                        return (
                            <div className="center-content">
                                <FleaMarketLoadingIcon />
                            </div>
                        );
                    }
                    return <ValueCell value={props.value} />;
                },
            },
        ];

        return useColumns;
    }, [t, items, barters, crafts, stations, settings]);

    const extraRow = (
        <>
            {t("Cost")}:{" "}
            {formatPrice(
                data.reduce((previousValue, currentValue) => {
                    return previousValue + currentValue.totalPrice;
                }, 0),
            )}
        </>
    );

    return (
        <DataTable
            key="item-summary-table"
            columns={displayColumns}
            data={data}
            extraRow={extraRow}
            autoResetSortBy={false}
        />
    );
}

export default ItemsSummaryTable;
