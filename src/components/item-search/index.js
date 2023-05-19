import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useHotkeys } from 'react-hotkeys-hook';
import debounce from 'lodash.debounce';

import useKeyPress from '../../hooks/useKeyPress';
import itemSearch from '../../modules/item-search';
import { SelectFilter } from '../filter';

import './index.css';
import useItemsData from '../../features/items';
import useQuestsData from '../../features/quests';

function ItemSearch({
    defaultValue,
    onChange,
    placeholder,
    autoFocus,
    showDropdown,
    defaultSearch = 'items',
    showSearchTypeSelector = true,
}) {
    const { data: items } = useItemsData();
    const { data: tasks } = useQuestsData();
    const { t } = useTranslation();

    const [nameFilter, setNameFilter] = useState(defaultValue || '');
    const [searchFor, setSearchFor] = useState(defaultSearch || 'items');
    const searchTypeSelectRef = useRef();
    const [cursor, setCursor] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const downPress = useKeyPress('ArrowDown');
    const upPress = useKeyPress('ArrowUp');
    const enterPress = useKeyPress('Enter');
    let navigate = useNavigate();
    let location = useLocation();
    const inputRef = useRef(null);

    if (!placeholder) {
        let searchType = '';
        if (!showSearchTypeSelector) {
            searchType = ` ${defaultSearch}`
        }
        placeholder = t(`Search${searchType}...`);
    }

    const selectPlaceholder = useMemo(() => {
        if (searchFor === 'tasks') {
            return 'Tasks';
        }
        return 'Items';
    }, [searchFor]);

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

    const searchTipStyle = useMemo(() => {
        const style = {
            right: '8px'
        };
        if (showSearchTypeSelector) {
            style.right = '120px';
        }
        return style;
    }, [showSearchTypeSelector]);

    if (autoFocus && window?.matchMedia && window.matchMedia('(max-width: 600px)').matches) {
        autoFocus = false;
    }

    const data = useMemo(() => {
        if (!nameFilter || !showDropdown) {
            return [];
        }

        let returnData;
        if (searchFor === 'tasks') {
            returnData = tasks.filter(task => {
                if (nameFilter.length === 0) {
                    return true;
                }
                return task.name.toLowerCase().includes(nameFilter.toLowerCase());
            }).map(task => {
                return {
                    ...task, 
                    itemLink: `/task/${task.normalizedName}`,
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
                        // iconLink: `https://assets.tarkov.dev/${itemData.id}-icon.jpg`,
                        iconLink: itemData.iconLink || `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
                        instaProfit: 0,
                        itemLink: `/item/${itemData.normalizedName}`,
                        types: itemData.types,
                        buyFor: itemData.buyFor,
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
        }

        return returnData;
    }, [searchFor, nameFilter, showDropdown, items, tasks]);

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
                            value: 'items',
                            selected: searchFor !== 'tasks',
                        },
                        {
                            label: t('Tasks'),
                            value: 'tasks',
                            selected: searchFor === 'tasks',
                        }
                    ]}
                />
            </div>)}
            <input
                type="text"
                // defaultValue = {defaultValue || nameFilter}
                onChange={handleNameFilterChange}
                placeholder={placeholder}
                value={nameFilter}
                autoFocus={autoFocus}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                ref={inputRef}
            />
            {!isFocused && <div className="search-tip-wrapper" style={searchTipStyle}>ctrl+q</div>}
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
                                {searchFor !== 'tasks' && (<img
                                    alt={`${item.name}`}
                                    loading="lazy"
                                    src={item.iconLink}
                                />)}
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ItemSearch;
