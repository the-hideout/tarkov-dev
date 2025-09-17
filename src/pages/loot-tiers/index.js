import { useState, useCallback, useMemo, useRef } from 'react';
import debounce from 'lodash.debounce';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useHotkeys } from 'react-hotkeys-hook';

import { Icon } from '@mdi/react';
import {mdiFinance} from '@mdi/js';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';

import SEO from '../../components/SEO.jsx';
import ItemGrid from '../../components/item-grid/index.js';
import {
    Filter,
    ToggleFilter,
    SelectFilter,
    InputFilter,
} from '../../components/filter/index.js';

import QueueBrowserTask from '../../modules/queue-browser-task.js';
import capitalizeFirst from '../../modules/capitalize-first.js';
import itemSearch from '../../modules/item-search.js';
import fleaMarketFee from '../../modules/flea-market-fee.mjs';

import useItemsData from '../../features/items/index.js';

import './index.css';

const defaultGroupNames = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

const DEFAULT_MAX_ITEMS = 256;

const arrayChunk = (inputArray, chunkLength) => {
    return inputArray.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / chunkLength);

        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
    }, []);
};

function LootTier(props) {
    const [numberFilter, setNumberFilter] = useState(DEFAULT_MAX_ITEMS);
    const [minPrice, setMinPrice] = useStateWithLocalStorage('minPrice', 0);
    const hasFlea = useSelector((state) => state.settings[state?.settings?.gameMode ?? 'regular'].hasFlea);
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [includeMarked, setIncludeMarked] = useStateWithLocalStorage(
        'includeMarked',
        false,
    );
    const [groupByType, setGroupByType] = useStateWithLocalStorage(
        'groupByType',
        false,
    );

    const { t } = useTranslation();
    const filterOptions = useMemo(() => {
        return [
            {
                value: 'barter',
                label: t('Barters'),
                default: true,
            },
            {
                value: 'keys',
                label: t('Keys'),
                default: true,
            },
            // {
            //     value: 'marked',
            //     label: t('Marked'),
            //     default: false,
            // },
            {
                value: 'mods',
                label: t('Mods'),
                default: true,
            },
            {
                value: 'provisions',
                label: t('Provisions'),
                default: true,
            },
            {
                value: 'wearable',
                label: t('Wearables'),
                default: true,
            },
            {
                value: 'gun',
                label: t('Guns'),
                default: true,
            }
        ]
    }, [t]);

    const [filters, setFilters] = useStateWithLocalStorage('filters', {
        name: '',
        types: filterOptions
            .map((filter) => {
                if (filter.default) {
                    return filter.value;
                }

                return false;
            })
            .filter(Boolean),
    });

    const inputFilterRef = useRef();

    useHotkeys('ctrl+q', () => {
        if (inputFilterRef?.current.scrollIntoView) {
            inputFilterRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }

        inputFilterRef?.current.focus();
    });

    const handleFilterChange = (selectedFilters) => {
        QueueBrowserTask.task(() => {
            setFilters({
                ...filters,
                types:
                    selectedFilters?.map((selectedValue) => {
                        return selectedValue.value;
                    }) ||
                    filterOptions
                        .map((filter) => {
                            if (filter.default) {
                                return filter.value;
                            }

                            return false;
                        })
                        .filter(Boolean),
            });
        });
    };

    const { data: items } = useItemsData();

    const itemData = useMemo(() => {
        return items
            .map((item) => {
                let baseImageLink = item.baseImageLink;
                let width = item.width;
                let height = item.height;
                let slots = item.slots;
                let itemTypes = item.types;
                let priceRUB = item.cached ? item.basePrice : item.sellForTradersBest.priceRUB;
                let sellTo = item.sellForTradersBest.vendor.name;
                let sellToNormalized = item.sellForTradersBest.vendor.normalizedName;
                let normalizedName = item.normalizedName;

                if (item.types.includes('gun')) {
                    // Overrides guns' dimensions using their default height and width.
                    // Fixes a bug where PPS was calculated using just a weapon receiver.
                    if (item.properties.defaultPreset) {
                        // use default preset images for item
                        const preset = items.find(i => i.id === item.properties.defaultPreset.id);
                        if (preset) {
                            width = preset.width;
                            height = preset.height;
                            slots = width * height;
                            baseImageLink = preset.baseImageLink;
                            priceRUB = preset.cached ? preset.basePrice : preset.sellForTradersBest.priceRUB;
                            sellTo = preset.sellForTradersBest.vendor.name;
                            sellToNormalized = preset.sellForTradersBest.vendor.normalizedName;
                            normalizedName = preset.normalizedName;
                        }
                    }
                    itemTypes = item.types.filter((type) => type !== 'wearable');
                }


                if (hasFlea && !item.types.includes('noFlea')) {
                    const fleaFee = fleaMarketFee(item.basePrice, item.lastLowPrice);
                    const fleaPrice = item.lastLowPrice - fleaFee;
                    if (fleaPrice >= priceRUB) {
                        sellTo = 'Flea Market';
                        sellToNormalized = 'flea-market';
                        priceRUB = fleaPrice;
                    }
                }

                return {
                    ...item,
                    sellTo: sellTo,
                    sellToNormalized: sellToNormalized,
                    pricePerSlot: Math.floor(priceRUB / slots),
                    normalizedName,
                    width,
                    height,
                    slots,
                    baseImageLink,
                    types: itemTypes,
                }
            })
            .filter((item) => {
                if (item.types.includes('unLootable')) {
                    return false;
                }

                return true;
            });
    }, [hasFlea, items]);

    const typeFilteredItems = useMemo(() => {
        const innerTypeFilteredItems = itemData.filter((item) => {
            if (!includeMarked && item.types.includes('markedOnly')) {
                return false;
            }

            const intersection = item.types.filter((type) =>
                filters.types?.includes(type),
            );

            // No categories matching
            if (intersection.length === 0) {
                return false;
            }

            if (minPrice && item.pricePerSlot < minPrice) {
                return false;
            }

            return true;
        });

        return innerTypeFilteredItems;
    }, [filters.types, includeMarked, itemData, minPrice]);

    const filteredItems = useMemo(() => {
        // const items = typeFilteredItems.filter((item) => {
        //     if (
        //         filters.name.length > 0 &&
        //         item.name.toLowerCase().indexOf(filters.name) === -1 &&
        //         item.shortName?.toLowerCase().indexOf(filters.name) === -1
        //     ) {
        //         return false;
        //     }

        //     return true;
        // });
        let items = typeFilteredItems;
        if (filters.name.length > 0) {
            items = itemSearch(typeFilteredItems, filters.name);
        }

        items.sort((itemA, itemB) => {
            const aPPS = itemA.pricePerSlot || Number.MIN_SAFE_INTEGER;
            const bPPS = itemB.pricePerSlot || Number.MIN_SAFE_INTEGER;
            
            return bPPS - aPPS;
        });

        return items;
    }, [filters.name, typeFilteredItems]);

    const minPriceHandler = debounce((event) => {
        console.log('debouncer called');
        const newValue = Number(event.target.value);
        setMinPrice(newValue);

        if (newValue > 0) {
            setNumberFilter(99999);
        } else {
            setNumberFilter(DEFAULT_MAX_ITEMS);
        }
    }, 400);

    const selectedItems = useMemo(() => {
        return filteredItems.slice(
            0,
            Math.min(filteredItems.length, numberFilter),
        );
    }, [filteredItems, numberFilter]);

    const { groupNames, itemChunks } = useMemo(() => {
        let innerGroupNames;
        let innerItemChunks;

        if (groupByType) {
            const activeFiltersSet = new Set();
            const chunkMap = {};

            for (const item of selectedItems) {
                for (const activeFilter of filters.types) {
                    if (!item.types.includes(activeFilter)) {
                        continue;
                    }

                    const option = filterOptions.find(option => option.value === activeFilter);
                    activeFiltersSet.add(option.label)

                    if (!chunkMap[activeFilter]) {
                        chunkMap[activeFilter] = [];
                    }

                    chunkMap[activeFilter].push(item);
                }
            }

            innerGroupNames = Array.from(activeFiltersSet);
            innerItemChunks = Object.values(chunkMap);
        }
        else {
            innerGroupNames = defaultGroupNames;

            innerItemChunks = arrayChunk(
                selectedItems,
                Math.ceil(selectedItems.length / innerGroupNames.length),
            );
        }

        for (let i = 0; i < innerItemChunks.length; i = i + 1) {
            innerItemChunks[i] = innerItemChunks[i]?.sort((itemA, itemB) => {
                if (itemA.height > itemB.height) {
                    return -1;
                }

                if (itemA.height === itemB.height) {
                    if (itemA.slots > itemB.slots) {
                        return -1;
                    }
                    else if (itemA.slots === itemB.slots) {
                        return 0;
                    }
                    else if (itemA.slots < itemB.slots) {
                        return 1;
                    }
                }
                
                if (itemA.height < itemB.height) {
                    return 1;
                }

                return 0;
            });
        }

        return {
            groupNames: innerGroupNames,
            itemChunks: innerItemChunks,
        };
    }, [filterOptions, filters.types, groupByType, selectedItems]);

    const handleFilterNameChange = useCallback(
        (e) => {
            if (typeof window !== 'undefined') {
                const name = e.target.value.toLowerCase();

                // schedule this for the next loop so that the UI
                // has time to update but we do the filtering as soon as possible
                QueueBrowserTask.task(() => {
                    setFilters({
                        ...filters,
                        name,
                    });
                });
            }
        },
        [filters, setFilters],
    );

    return [
        <SEO 
            title={`${t('Loot tiers')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('loot-tiers-page-description', 'Learn about the different types of loot available in the game, their value, rarity, and what to keep and what to trash.')}
            key="seo-wrapper"
        />,
        <div
            className="display-wrapper loot-tiers-main-wrapper"
            key={'display-wrapper'}
        >
            <div className='loot-tiers-wrapper'>
                <h1 className='loot-tiers-text'>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiFinance} size={1.5} className="icon-with-text" /> 
                    {t('Loot tiers')}
                </h1>
                <p className='loot-tiers-text'>{t('Ranking the most valuable items in the game')}</p>
            </div>
            <Filter fullWidth>
                <ToggleFilter
                    label={t('Include Marked')}
                    onChange={(e) => setIncludeMarked(!includeMarked)}
                    checked={includeMarked}
                />
                <ToggleFilter
                    label={t('Group by type')}
                    onChange={(e) => setGroupByType(!groupByType)}
                    checked={groupByType}
                />
                <ToggleFilter
                        checked={showAllItemSources}
                        label={t('Ignore settings')}
                        onChange={(e) =>
                            setShowAllItemSources(!showAllItemSources)
                        }
                        tooltipContent={
                            <>
                                {t('Shows all sources of items regardless of your settings')}
                            </>
                        }
                    />
                <SelectFilter
                    placeholder={t('Select...')}
                    defaultValue={filters.types?.map((filter) => {
                        return filterOptions.find(
                            (defaultFilter) => defaultFilter.value === filter,
                        );
                    })}
                    isMulti={true}
                    options={filterOptions}
                    onChange={handleFilterChange}
                />
                <InputFilter
                    defaultValue={minPrice || ''}
                    placeholder={t('min value')}
                    type={'number'}
                    onChange={minPriceHandler}
                />
                <InputFilter
                    defaultValue={filters.name || ''}
                    placeholder={t('filter on item')}
                    type={'text'}
                    onChange={handleFilterNameChange}
                    parentRef={inputFilterRef}
                />
            </Filter>
            {itemChunks.map((items, index) => (
                <ItemGrid
                    key={`barter-group-${groupNames[index]}`}
                    name={t(capitalizeFirst(groupNames[index]))}
                    items={items}
                />
            ))}

            <div className="loot-tiers-wrapper">
                <p>
                    {t('loot-tiers-page-description', 'Learn about the different types of loot available in the game, their value, rarity, and what to keep and what to trash.')}
                </p>
            </div>
        </div>,
    ];
}

export default LootTier;
