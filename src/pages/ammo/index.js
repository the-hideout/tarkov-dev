/* eslint-disable no-restricted-globals */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import { mdiAmmunition, mdiCached, mdiProgressWrench } from '@mdi/js';

import SEO from '../../components/SEO.jsx';
import { Filter, ToggleFilter, ButtonGroupFilter, ButtonGroupFilterButton, SliderFilter, RangeFilter } from '../../components/filter/index.js';
import Graph from '../../components/Graph.jsx';
import useKeyPress from '../../hooks/useKeyPress.jsx';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';
import SmallItemTable from '../../components/small-item-table/index.js';

import useItemsData from '../../features/items/index.js';

import { formatCaliber } from '../../modules/format-ammo.mjs';

import './index.css';
import { useSelector } from 'react-redux';
import { selectAllTraders } from '../../features/settings/settingsSlice.mjs';

const MAX_DAMAGE = 260; // De-clutter right side of graph with the addition of the AK-50 rounds
const MAX_PENETRATION = 70;

const skipCalibers = [
    'Caliber30x29',
    'Caliber40x46',
    'Caliber127x108',
    'Caliber26x75',
    'Caliber40mmRU',
    'Caliber20x1mm',
    'Caliber725',
];

const markerTypes = [
    'Plus',
    'Circle',
    'TriangleUp',
    'TriangleDown',
    'Diamond',
];

const ammoCategoryId = '5485a8684bdc2da71d8b4567';

function Ammo() {
    const allTraders = useSelector(selectAllTraders);
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentAmmo } = useParams();
    let currentAmmoList = useMemo(() => [], []);
    let redirect = false;
    if (currentAmmo) {
        if (currentAmmo === '12 Gauge' || currentAmmo === '20 Gauge') {
            currentAmmoList = [`${currentAmmo} Shot`, `${currentAmmo} Slug`];
            redirect = true;
        }
        else {
            currentAmmoList = currentAmmo.split(',');
        }
    }
    const navigate = useNavigate();

    // if the name we got from the params is 12/20 Gauge, redirect to a nice looking path 
    useEffect(() => {
        if (redirect) {
            navigate(`/ammo/${currentAmmoList.join(',')}`);
        }
    }, [redirect, currentAmmoList, navigate]);

    const [showOnlyTraderAmmo, setShowOnlyTraderAmmo] = useState(false);
    const [selectedLegendName, setSelectedLegendName] = useState(currentAmmoList);
    const [showAllTraderPrices, setShowAllTraderPrices] = useState(false);
    const [useAllProjectileDamage, setUseAllProjectileDamage] = useState(false);
    const [includeBarterIngredients, setIncludeBarterIngredients] = useStateWithLocalStorage(
        'includeBarterIngredients',
        true,
    );
    const [includeCraftIngredients, setIncludeCraftIngredients] = useStateWithLocalStorage(
        'includeCraftIngredients',
        false,
    );
    const [minPen, setMinPen] = useState(searchParams.get('minp') ?? 0);
    const [minDam, setMinDam] = useState(searchParams.get('mind') ?? 0);
    const [minPrice, setMinPrice] = useState(searchParams.get('minpr') ?? 0);
    const [enablePriceFilter, setEnablePriceFilter] = useState(Boolean(searchParams.get('minpr')));
    const shiftPress = useKeyPress('Shift');
    const { data: items } = useItemsData();
    const { t } = useTranslation();

    const setPathFilters = useCallback((filtervalues) => {
        const params = {
            minp: minPen,
            mind: minDam,
            minpr: minPrice,
        };
        for (const paramName in filtervalues) {
            params[paramName] = filtervalues[paramName];
        }
        if (params.minp === 0) {
            delete params.minp;
        }
        if (params.mind === 0) {
            delete params.mind;
        }
        if (params.minpr === 0) {
            delete params.minpr;
        }
        setSearchParams(params, { replace: true });
    }, [setSearchParams, minPen, minDam, minPrice]);

    useEffect(() => {
        if (!currentAmmo || !currentAmmo.length) {
            setSelectedLegendName([]);

            return;
        }

        if (currentAmmo) {
            setSelectedLegendName(currentAmmo.split(','));
        } else {
            setSelectedLegendName([]);
        }
    }, [currentAmmo]);

    const { ammoData, legendData } = useMemo(() => {
        const typeCache = {};
        const legend = [];
        const calibers = items.filter(item => {
            return item.categoryIds.includes(ammoCategoryId) && !!item.properties.caliber && !skipCalibers.includes(item.properties.caliber);
        }).reduce((all, current) => {
            const caliber = formatCaliber(current.properties.caliber, current.properties.ammoType);
            if (caliber && !all.includes(caliber)) {
                all.push(caliber);
            }
            return all;
        }, []).sort((a, b) => a.localeCompare(b));
        const ammo = items.filter(item => {
            return item.categoryIds.includes(ammoCategoryId) && !!item.properties.caliber && !skipCalibers.includes(item.properties.caliber);
        }).sort((a, b) => {
            const caliberA = formatCaliber(a.properties.caliber, a.properties.ammoType);
            const caliberB = formatCaliber(b.properties.caliber, b.properties.ammoType);
            if (caliberA === caliberB) {
                const damageA = a.properties.damage;
                const damageB = b.properties.damage;
                if (damageA === damageB)
                    return a.name.localeCompare(b.name);
                return damageA - damageB;
            }
            return caliberA.localeCompare(caliberB);
        }).map(item => {
            const returnData = {
                ...item,
                ...item.properties,
                type: formatCaliber(item.properties.caliber, item.properties.ammoType),
                displayDamage: useAllProjectileDamage ? item.properties.projectileCount * item.properties.damage : item.properties.damage,
                displayPenetration: item.properties.penetrationPower,
            };
            if (!returnData.type) 
                console.log(returnData);
    
            if (returnData.displayDamage > MAX_DAMAGE) {
                returnData.name = `${item.name} (${returnData.displayDamage})`;
                returnData.displayDamage = MAX_DAMAGE;
            }
    
            if (returnData.penetrationPower > MAX_PENETRATION) {
                returnData.name = `${item.name} (${returnData.penetrationPower})`;
                returnData.displayPenetration = MAX_PENETRATION;
            }

            const caliberIndex = calibers.indexOf(returnData.type);
            let symbol = {
                fill: `hsl(${Math.round((caliberIndex / calibers.length) * 340)}, 50%, 50%)`,
                type: markerTypes[caliberIndex % markerTypes.length],
            };
    
            if (typeCache[returnData.type]) {
                symbol = typeCache[returnData.type];
            } 
            else {
                typeCache[returnData.type] = symbol;
                legend.push({
                    ...returnData,
                    name: returnData.type,
                    caliber: returnData.properties.caliber,
                    symbol: symbol,
                });
            }
            returnData.symbol = symbol;
    
            return returnData;
        });
        legend.sort((a, b) => {
            return a.type.localeCompare(b.type);
        });
        return { ammoData: ammo, legendData: legend };
    }, [items, useAllProjectileDamage]);

    const listState = useMemo(() => {
        const returnData = ammoData
            .filter(
                (ammo) =>
                    !selectedLegendName ||
                    selectedLegendName.length === 0 ||
                    selectedLegendName.includes(ammo.type),
            ).filter(ammo => {
                if (showOnlyTraderAmmo) {
                    if (!ammo.buyFor.some(buyForEntry =>
                        buyForEntry.vendor.normalizedName !== 'flea-market' &&
                        buyForEntry.vendor.minTraderLevel <= allTraders[buyForEntry.vendor.normalizedName])
                    )
                        return false;
                }
                return true;
            }
            ).filter(ammo => {
                if (minPen === 0 || typeof ammo.properties?.penetrationPower === 'undefined') {
                    return true;
                }
                return ammo.properties.penetrationPower >= minPen;
            }).filter(ammo => {
                if (minDam === 0) {
                    return true;
                }
                return ammo.properties.damage >= minDam;
            }).filter(ammo => {
                // Filter by cheapest available purchase price (trader or flea)
                if (!enablePriceFilter || !minPrice) {
                    return true;
                }
                const vendorPrices = (ammo.buyFor || []).map(b => b.priceRUB).filter(Boolean);
                const fleaPrice = ammo.buyFor?.find(b => b.vendor.normalizedName === 'flea-market')?.priceRUB || 0;
                const cheapest = vendorPrices.length > 0 ? Math.min(...vendorPrices) : fleaPrice;
                if (minPrice && cheapest < minPrice) return false;
                return true;
            })
            .map((ammo) => {
                ammo.chartName = ammo.name
                    .replace(ammo.type, '')
                    .replace(ammo.type.replace(' mm', 'mm'), '')
                    .replace('20/70', '')
                    .replace('12/70', '')
                    .trim();

                ammo.fragChance = `${Math.floor(ammo.fragmentationChance * 100)}%`;
                ammo.trader = ammo.buyFor
                    ?.map((buyFor) => {
                        if (buyFor.vendor.normalizedName === 'flea-market') {
                            return false;
                        }

                        return buyFor;
                    })
                    .filter(Boolean)[0];

                if (!shiftPress) {
                    return ammo;
                }

                return {
                    ...ammo,
                    chartName: `${ammo.chartName} (${ammo.fragmentationChance})`,
                };
            });
        return returnData;
    }, [selectedLegendName, shiftPress, ammoData, minPen, minDam, minPrice, enablePriceFilter, showOnlyTraderAmmo, allTraders]);

    const handleLegendClick = useCallback(
        (event, { datum: { name } }) => {
            let newSelectedAmmo = [...selectedLegendName];
            const metaKey =
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey;

            if (newSelectedAmmo.includes(name) && metaKey) {
                newSelectedAmmo.splice(newSelectedAmmo.indexOf(name), 1);
            } else if (newSelectedAmmo.includes(name)) {
                newSelectedAmmo = [];
            } else if (metaKey) {
                newSelectedAmmo.push(name);
            } else {
                newSelectedAmmo = [name];
            }

            setSelectedLegendName(newSelectedAmmo);
            navigate(`/ammo/${newSelectedAmmo.join(',')}`);
        },
        [selectedLegendName, setSelectedLegendName, navigate],
    );

    return [
        <SEO 
            title={`${t('Ammo chart')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('ammo-page-description', 'This page contains a list of every type of ammo in Escape from Tarkov. To filter the complete list of available cartridges, click the name of a caliber.')}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key="ammo-wrapper">
            <h1 className="center-title">
                {t('Escape from Tarkov')}
                <Icon path={mdiAmmunition} size={1.5} className="icon-with-text"/>
                {t('Ammo chart')}
            </h1>
            <div className="page-wrapper ammo-page-wrapper">
                <Graph
                    listState={listState}
                    legendData={legendData}
                    selectedLegendName={selectedLegendName}
                    handleLegendClick={handleLegendClick}
                    xMin={minDam}
                    xMax={MAX_DAMAGE}
                    yMin={minPen}
                    yMax={MAX_PENETRATION}
                />
            </div>
            
            <div className="page-wrapper ammo-page-wrapper">
            <Trans i18nKey={'ammo-page-p'}>
                <p>
                    The wilderness of Tarkov includes a diverse range of ammunition. To combat different opponents, different types of ammunition are needed.
                </p>
                <p>
                    This page contains a list of every type of ammo in Escape from Tarkov. To filter the complete list of available cartridges, click the name of a caliber.
                </p>
            </Trans>
            </div>
            <Filter>
                <ToggleFilter
                    checked={useAllProjectileDamage}
                    label={t('Total damage')}
                    onChange={(e) =>
                        setUseAllProjectileDamage(!useAllProjectileDamage)
                    }
                    tooltipContent={
                        <>
                            {t('Use total damage of all projectiles in a round')}
                        </>
                    }
                />
                <ToggleFilter
                    checked={showOnlyTraderAmmo}
                    label={t('Trader Ammo')}
                    onChange={(e) =>
                        setShowOnlyTraderAmmo(!showOnlyTraderAmmo)
                    }
                    tooltipContent={
                        <>
                            {t('Only show ammo available from traders on your settings')}
                        </>
                    }
                />
                <ToggleFilter
                    checked={showAllTraderPrices}
                    label={t('Ignore settings')}
                    onChange={(e) =>
                        setShowAllTraderPrices(!showAllTraderPrices)
                    }
                    tooltipContent={
                        <>
                            {t('Shows all sources of items regardless of your settings')}
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
                <SliderFilter
                    value={minPen}
                    label={t('Min Pen')}
                    min={0}
                    max={60}
                    marks={{
                        0: 0,
                        10: 10,
                        20: 20,
                        30: 30,
                        40: 40,
                        50: 50,
                        60: '60+',
                    }}
                    onChange={(event, min) => {
                        setMinPen(min);
                        setPathFilters({
                            minp: min,
                        });
                    }}
                    style={{
                        marginRight: '10px',
                    }}
                    track={'inverted'}
                />
                <SliderFilter
                    value={minDam}
                    label={t('Min Dmg')}
                    min={0}
                    max={105}
                    marks={{
                        0: 0,
                        20: 20,
                        35: 35,
                        50: 50,
                        65: 65,
                        85: 85,
                        105: '105+',
                    }}
                    onChange={(event, min) => {
                        setMinDam(min);
                        setPathFilters({
                            mind: min
                        });
                    }}
                    track={'inverted'}
                />
                <ToggleFilter
                    checked={enablePriceFilter}
                    label={t('Enable price filter')}
                    onChange={(e) => {
                        const next = !enablePriceFilter;
                        setEnablePriceFilter(next);
                        if (!next) {
                            setMinPrice(0);
                            setPathFilters({ minpr: 0 });
                        } else {
                            setPathFilters({ minpr: minPrice });
                        }
                    }}
                    tooltipContent={<>{t('Toggle price filtering on/off')}</>}
                />
                <SliderFilter
                    value={minPrice}
                    label={t('Min Price')}
                    min={0}
                    max={1000}
                    marks={{
                        0: 0,
                        1000: '1000+',
                    }}
                    onChange={(event, min) => {
                        setMinPrice(min);
                        setPathFilters({
                            minpr: min,
                        });
                    }}
                    style={{
                        marginRight: '10px',
                    }}
                    track={'inverted'}
                    step={100}
                    valueLabelDisplay={'auto'}
                />
            </Filter>
            <h2 className="center-title">
                {t('Ammo Statistics Table')}
            </h2>
            <SmallItemTable
                customFilter={(item) => {
                    const isAmmo = item.categories.some(category => category.id === ammoCategoryId);
                    return isAmmo && !skipCalibers.includes(item.properties.caliber);
                }}
                showAllSources={showAllTraderPrices}
                caliberFilter={selectedLegendName}
                useAllProjectileDamage={useAllProjectileDamage}
                minPrice={enablePriceFilter ? minPrice : 0}
                caliber={1}
                damage={2}
                penetrationPower={3}
                armorDamage={4}
                fragChance={5}
                cheapestPrice={6}
                useBarterIngredients={includeBarterIngredients}
                useCraftIngredients={includeCraftIngredients}
                minPenetration={minPen}
                minDamage={minDam}
            />
        </div>,
    ];
}

export default Ammo;
