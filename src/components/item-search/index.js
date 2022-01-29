import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Link,
    useNavigate,
    useLocation,
} from "react-router-dom";
import {useTranslation} from 'react-i18next';
import {useHotkeys} from 'react-hotkeys-hook';
import debounce from 'lodash.debounce';

import { selectAllItems, fetchItems } from '../../features/items/itemsSlice';
import useKeyPress from '../../hooks/useKeyPress';
import itemSearch from '../../modules/item-search';

import './index.css';

function ItemSearch({defaultValue, onChange, placeholder, autoFocus, showDropdown}) {
    const items = useSelector(selectAllItems);
    const itemStatus = useSelector((state) => {
        return state.items.status;
    });
    const { t } = useTranslation();

    const [nameFilter, setNameFilter] = useState(defaultValue || '');
    const [cursor, setCursor] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const downPress = useKeyPress('ArrowDown');
    const upPress = useKeyPress('ArrowUp');
    const enterPress = useKeyPress('Enter');
    let navigate = useNavigate();
    let location = useLocation();
    const dispatch = useDispatch();
    const inputRef = useRef(null);

    if(!placeholder){
        placeholder = t('Search item...');
    }

    useHotkeys('ctrl+q', () => {
        if(inputRef?.current.scrollIntoView){
            inputRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }

        inputRef?.current.focus();
    });

    useEffect(() => {
        let timer = false;
        if (itemStatus === 'idle') {
            dispatch(fetchItems());
        }

        if(!timer){
            timer = setInterval(() => {
                dispatch(fetchItems());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        }
    }, [itemStatus, dispatch]);


    const debouncedOnchange = useRef(
        debounce((newValue) => {
            onChange(newValue);
        }, 300)
    ).current;

    const handleNameFilterChange = useCallback((e) => {
        setNameFilter(e.target.value.toLowerCase());
        debouncedOnchange(e.target.value.toLowerCase());
    }, [setNameFilter, debouncedOnchange]);

    useEffect(() => {
        if (downPress) {
            setCursor(prevState =>
                Math.min(prevState + 1, 9)
            );
        }
    }, [downPress]);

    useEffect(() => {
        if (upPress) {
            setCursor(prevState => (prevState > 0 ? prevState - 1 : prevState));
        }
    }, [upPress]);

    if(autoFocus && window.matchMedia('(max-width: 600px)').matches){
        autoFocus = false;
    }

    const data = useMemo(() => {
        if(!nameFilter){
            return [];
        }

        let returnData = items.map((itemData) => {
            const formattedItem = {
                id: itemData.id,
                name: itemData.name,
                shortName: itemData.shortName,
                normalizedName: itemData.normalizedName,
                avg24hPrice: itemData.avg24hPrice,
                lastLowPrice: itemData.lastLowPrice,
                // iconLink: `https://assets.tarkov-tools.com/${itemData.id}-icon.jpg`,
                iconLink: itemData.iconLink || `${process.env.PUBLIC_URL}/images/unknown-item-icon.jpg`,
                instaProfit: 0,
                itemLink: `/item/${itemData.normalizedName}`,
                traderName: itemData.traderName,
                traderPrice: itemData.traderPrice,
                types: itemData.types,
                buyFor: itemData.buyFor,
            };

            const buyOnFleaPrice = itemData.buyFor.find(buyPrice => buyPrice.source === 'flea-market');

            if(buyOnFleaPrice){
                formattedItem.instaProfit = itemData.traderPrice - buyOnFleaPrice.price;
            }

            return formattedItem;
        })
        .filter(item => {
            return !item.types.includes('disabled');
        });

        if(nameFilter && nameFilter.length > 0){
            returnData = itemSearch(returnData, nameFilter);
        }

        return returnData;
    },
        [nameFilter, items]
    );

    useEffect(() => {
        if(enterPress && data[cursor]){
            navigate(data[cursor].itemLink);
            setCursor(0);
            setNameFilter('');
        }
    }, [cursor, enterPress, data, navigate]);

    useEffect(() => {
        setCursor(0);
        setNameFilter('');
    }, [location]);

    return <div
        className="item-search"
    >
        <input
            type="text"
            // defaultValue = {defaultValue || nameFilter}
            onChange = {handleNameFilterChange}
            placeholder = {placeholder}
            value={nameFilter}
            autoFocus = {autoFocus}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            ref={inputRef}
        />
        {!isFocused &&
            <div
                className='search-tip-wrapper'
            >
                ctrl+q
            </div>
        }
        {showDropdown && <div
                className='item-list-wrapper'
            >
                {data.map((item, index) => {
                    if(index >= 10){
                        return null;
                    }

                    return <Link
                        className={`search-result-wrapper ${index === cursor ? 'active': ''}`}
                        key = {`search-result-wrapper-${item.id}`}
                        to = {`${item.itemLink}`}
                    >
                        <img
                            alt = {`${item.name}`}
                            loading='lazy'
                            src = {item.iconLink}
                        />
                        {item.name}
                    </Link>;
                })}
            </div>
        }
    </div>;
}

export default ItemSearch;