import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useHotkeys } from 'react-hotkeys-hook';
import debounce from 'lodash.debounce';
import { Tooltip } from '@mui/material';

import useKeyPress from '../../hooks/useKeyPress.jsx';
import itemSearch from '../../modules/item-search.js';
import { SelectFilter } from '../filter/index.js';
import formatPrice from '../../modules/format-price.js';

import './index.css';
import useItemsData from '../../features/items/index.js';
import useQuestsData from '../../features/quests/index.js';

function ItemSearch({
    defaultValue,
    onChange,
    placeholder,
    autoFocus,
    showDropdown,
    defaultSearch = 'item',
    showSearchTypeSelector = true,
}) {
    const { data: items } = useItemsData();
    const { data: tasks } = useQuestsData();
    const { t } = useTranslation();

    const [nameFilter, setNameFilter] = useState(defaultValue || '');
    const [searchFor, setSearchFor] = useState(defaultSearch || 'item');
    const searchTypeSelectRef = useRef();
    const [cursor, setCursor] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const downPress = useKeyPress('ArrowDown');
    const upPress = useKeyPress('ArrowUp');
    const enterPress = useKeyPress('Enter');
    let navigate = useNavigate();
    let location = useLocation();
    const inputRef = useRef(null);

    const placeholderText = useMemo(() => {
        if (placeholder) {
            return placeholder;
        }
        // t('Search item...')
        // t('Search task...')
        return t(`Search ${searchFor}...`);
    }, [placeholder, searchFor, t]);

    const selectPlaceholder = useMemo(() => {
        if (searchFor === 'task') {
            return t('Tasks');
        }
        return t('Items');
    }, [t, searchFor]);

    useHotkeys('ctrl+q', () => {
        if (inputRef?.current.scrollIntoView) {
            inputRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }

        inputRef?.current.focus();
    });

    const debouncedOnChange = useRef(
        debounce((newValue) => {
            onChange(newValue);
        }, 300),
    ).current;

    const handleNameFilterChange = useCallback(
        (e) => {
            setNameFilter(e.target.value.toLowerCase());
            if (onChange) {
                debouncedOnChange(e.target.value.toLowerCase());
            }
        },
        [setNameFilter, debouncedOnChange, onChange],
    );

    const handleSearchTypeChange = useCallback(
        (e) => {
            setSearchFor(e.value.toLowerCase());
            inputRef?.current.focus();
        },
        [setSearchFor],
    );

    useEffect(() => {
        if (downPress) {
            setCursor((prevState) => Math.min(prevState + 1, 9));
        }
    }, [downPress]);

    useEffect(() => {
        if (upPress) {
            setCursor((prevState) =>
                prevState > 0 ? prevState - 1 : prevState,
            );
        }
    }, [upPress]);

    if (autoFocus && window?.matchMedia && window.matchMedia('(max-width: 600px)').matches) {
        autoFocus = false;
    }

    const data = useMemo(() => {
        if (!nameFilter || !showDropdown) {
            return [];
        }

        let returnData;
        if (searchFor === 'task') {
            returnData = tasks.filter(task => {
                if (nameFilter.length === 0) {
                    return true;
                }
                return task.name.toLowerCase().includes(nameFilter.toLowerCase()) || task.id === nameFilter;
            }).map(task => {
                return {
                    ...task, 
                    itemLink: `/task/${task.normalizedName}`,
                    displayName: task.name,
                };
            });
        } else {
            returnData = items
                .map((itemData) => {
                    const formattedItem = {
                        id: itemData.id,
                        name: itemData.name,
                        shortName: itemData.shortName,
                        normalizedName: itemData.normalizedName,
                        avg24hPrice: itemData.avg24hPrice,
                        lastLowPrice: itemData.lastLowPrice,
                        iconLink: itemData.iconLink || `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
                        instaProfit: 0,
                        itemLink: `/item/${itemData.normalizedName}`,
                        types: itemData.types,
                        buyFor: itemData.buyFor,
                        sellFor: itemData.sellFor,
                        width: itemData.width,
                        height: itemData.height,
                    };
    
                    const buyOnFleaPrice = itemData.buyFor.find(
                        (buyPrice) => buyPrice.vendor.normalizedName === 'flea-market',
                    );
    
                    if (buyOnFleaPrice) {
                        formattedItem.instaProfit = itemData.sellForTradersBest.priceRUB - buyOnFleaPrice.price;
                    }
    
                    return formattedItem;
                })
                .filter((item) => {
                    return !item.types.includes('disabled');
                });
    
            if (nameFilter.length > 0) {
                returnData = itemSearch(returnData, nameFilter);
            }
            returnData.forEach(formattedItem => {
                formattedItem.displayName = [
                    <img
                        key={'item-search-image'}
                        alt={`${formattedItem.name}`}
                        loading="lazy"
                        src={formattedItem.iconLink}
                        className="item-search-item-image"
                    />,
                    <span key={'item-search-name'}>{formattedItem.name}</span>
                ];

                const sellOnFleaPrice = formattedItem.sellFor.find(
                    (buyPrice) => buyPrice.vendor.normalizedName === 'flea-market',
                );

                if (sellOnFleaPrice) {
                    let toolTip = [
                        <div key="item-search-sell-to-tooltip">{t('Sell to Flea')}</div>
                    ];
                    if (formattedItem.width > 1 || formattedItem.height > 1) {
                        toolTip.push(
                            <div key="item-search-sell-to-per-slot">
                                {`\n ${t('Per slot')}: ${formatPrice(Math.round(sellOnFleaPrice.priceRUB / (formattedItem.width * formattedItem.height)))}`}
                            </div>
                        );
                    }
                    formattedItem.displayName.push(
                        <Tooltip
                            key="item-search-flea-price"
                            title={toolTip}
                            arrow
                        >
                            <span>
                                <span className="item-search-separator">|</span>
                                <img alt={sellOnFleaPrice.vendor.name} className="item-search-price" src={`${process.env.PUBLIC_URL}/images/traders/${sellOnFleaPrice.vendor.normalizedName}-icon.jpg`}/>
                                <span>{formatPrice(sellOnFleaPrice.priceRUB)}</span>
                            </span>
                        </Tooltip>
                    );
                }

                const sellToTrader = formattedItem.sellFor.reduce((best, buyPrice) => {
                    if (buyPrice.vendor.normalizedName === 'flea-market') {
                        return best;
                    }
                    if (!best) {
                        return buyPrice;
                    }
                    if (buyPrice.priceRUB > best.priceRUB) {
                        return buyPrice;
                    }
                    return best;
                }, undefined);

                if (sellToTrader) {
                    let toolTip = [
                        <div key="item-search-sell-to-tooltip">{sellToTrader.vendor.name}</div>
                    ];
                    if (formattedItem.width > 1 || formattedItem.height > 1) {
                        toolTip.push(
                            <div key="item-search-sell-to-per-slot">
                                {`\n ${t('Per slot')}: ${formatPrice(Math.round(sellToTrader.priceRUB / (formattedItem.width * formattedItem.height)))}`}
                            </div>
                        );
                    }
                    formattedItem.displayName.push(
                        <Tooltip
                            key="item-search-trader-price"
                            title={toolTip}
                            arrow
                        >
                            <span>
                                <span className="item-search-separator">|</span>
                                <img alt={sellToTrader.vendor} className="item-search-price" src={`${process.env.PUBLIC_URL}/images/traders/${sellToTrader.vendor.normalizedName}-icon.jpg`}/>
                                <span>{formatPrice(sellToTrader.priceRUB)}</span>
                            </span>
                        </Tooltip>
                    );
                }

                formattedItem.displayName = <span className="item-search-result-parts-wrapper">{formattedItem.displayName}</span>
            });
        }

        return returnData;
    }, [searchFor, nameFilter, showDropdown, items, tasks, t]);

    useEffect(() => {
        if (enterPress && data[cursor]) {
            navigate(data[cursor].itemLink);
        }
    }, [cursor, enterPress, data, navigate]);

    useEffect(() => {
        setCursor(0);
        if (!location.search) {
            setNameFilter('');
        }
    }, [location]);

    return (
        <div className="item-search">
            <input
                type="text"
                // defaultValue = {defaultValue || nameFilter}
                onChange={handleNameFilterChange}
                placeholder={placeholderText}
                value={nameFilter}
                autoFocus={autoFocus}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                ref={inputRef}
            />
            <div className="search-extras-wrapper">
                {!isFocused && <div className="search-tip-wrapper">ctrl+q</div>}
                {showSearchTypeSelector && (<div className="search-type-selector">
                    <SelectFilter
                        value={searchFor}
                        onChange={handleSearchTypeChange}
                        onMenuOpen={(e) => {
                            setIsFocused(true);
                        }}
                        className="search-type-selector"
                        placeholder={selectPlaceholder}
                        parentRef={searchTypeSelectRef}
                        options={[
                            {
                                label: t('Items'),
                                value: 'item',
                                selected: searchFor !== 'task',
                            },
                            {
                                label: t('Tasks'),
                                value: 'task',
                                selected: searchFor === 'task',
                            }
                        ]}
                    />
                </div>)}
            </div>
            {showDropdown && (
                <div className="item-list-wrapper">
                    {data.map((item, index) => {
                        if (index >= 10) {
                            return null;
                        }

                        return (
                            <Link
                                className={`search-result-wrapper ${
                                    index === cursor ? 'active' : ''
                                }`}
                                key={`search-result-wrapper-${item.id}`}
                                to={`${item.itemLink}`}
                            >
                                {item.displayName}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ItemSearch;
