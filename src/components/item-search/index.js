import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useHotkeys } from 'react-hotkeys-hook';
import debounce from 'lodash.debounce';

import useKeyPress from '../../hooks/useKeyPress.jsx';
import itemSearch from '../../modules/item-search.js';
import { SelectFilter } from '../filter/index.js';

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
                                {searchFor !== 'task' && (<img
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
