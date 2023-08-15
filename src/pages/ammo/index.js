/* eslint-disable no-restricted-globals */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css'; // optional

import Icon from '@mdi/react';
import { mdiAmmunition, mdiCached, mdiProgressWrench } from '@mdi/js';

import SEO from '../../components/SEO';
import { Filter, ToggleFilter, ButtonGroupFilter, ButtonGroupFilterButton, RangeFilter } from '../../components/filter';
import Graph from '../../components/Graph.jsx';
import useKeyPress from '../../hooks/useKeyPress';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';
import SmallItemTable from '../../components/small-item-table';

import useItemsData from '../../features/items';

import { formatCaliber } from '../../modules/format-ammo';

import symbols from '../../symbols';

import './index.css';

const MAX_DAMAGE = 170;
const MAX_PENETRATION = 70;

const skipTypes = [
    'Caliber30x29',
    'Caliber40x46',
    'Caliber127x108',
    'Caliber26x75',
    'Caliber40mmRU'
];

function Ammo() {
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
    const [minPen, setMinPen] = useState(0);
    const [maxPen, setMaxPen] = useState(60);
    const shiftPress = useKeyPress('Shift');
    const { data: items } = useItemsData();
    const { t } = useTranslation();

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
        const typeCache = [];
        const legend = [];
        const ammo = items.filter(item => {
            return item.categories.some(cat => cat.id === '5485a8684bdc2da71d8b4567') && !skipTypes.includes(item.properties.caliber)
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
            let symbol = symbols[typeCache.length];
    
            if (typeCache.includes(returnData.type)) {
                symbol = symbols[typeCache.indexOf(returnData.type)];
            } 
            else {
                typeCache.push(returnData.type);
                legend.push({
                    ...returnData,
                    name: returnData.type,
                    caliber: returnData.properties.caliber,
                    symbol: symbol,
                });
            }
            returnData.symbol = symbol;
    
            if (!symbol) {
                console.log(`Missing symbol for ${returnData.type}, the graph will crash. Add more symbols to src/symbols.json`);
                process.exit(1);
            }
    
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
                if (minPen === 0 && maxPen === 60) {
                    return true;
                }
                const max = maxPen === 60 ? Number.MAX_SAFE_INTEGER : maxPen;
                const pen = ammo.properties.penetrationPower;
                return pen >= minPen && pen <= max;
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
    }, [selectedLegendName, shiftPress, ammoData, minPen, maxPen]);

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
                    xMax={MAX_DAMAGE}
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
                <RangeFilter
                    defaultValue={[0, 60]}
                    label={t('Penetration')}
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
                    onChange={([min, max]) => {
                        setMinPen(min);
                        setMaxPen(max);
                    }}
                />
            </Filter>
            <h2 className="center-title">
                {t('Ammo Statistics Table')}
            </h2>
            <SmallItemTable
                bsgCategoryFilter={'5485a8684bdc2da71d8b4567'}
                showAllSources={showAllTraderPrices}
                caliberFilter={selectedLegendName}
                useAllProjectileDamage={useAllProjectileDamage}
                caliber={1}
                damage={2}
                penetrationPower={3}
                armorDamage={4}
                fragChance={5}
                cheapestPrice={6}
                useBarterIngredients={includeBarterIngredients}
                useCraftIngredients={includeCraftIngredients}
                minPenetration={minPen}
                maxPenetration={maxPen}
            />
        </div>,
    ];
}

export default Ammo;
