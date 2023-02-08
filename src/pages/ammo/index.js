/* eslint-disable no-restricted-globals */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css'; // optional

import Icon from '@mdi/react';
import { mdiAmmunition } from '@mdi/js';

import SEO from '../../components/SEO';
import { Filter, ToggleFilter } from '../../components/filter';
import Graph from '../../components/Graph.jsx';
import useKeyPress from '../../hooks/useKeyPress';
import SmallItemTable from '../../components/small-item-table';

import { useItemsQuery } from '../../features/items/queries';

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
    const shiftPress = useKeyPress('Shift');
    const { data: items } = useItemsQuery();
    const settings = useSelector((state) => state.settings);
    const { t } = useTranslation();

    useEffect(() => {
        if (currentAmmo === []) {
            setSelectedLegendName([]);

            return true;
        }

        if (currentAmmo) {
            setSelectedLegendName(currentAmmo.split(','));
        } else {
            setSelectedLegendName([]);
        }
    }, [currentAmmo]);

    let typeCache = [];
    const legendData = [];
    const formattedData = items.filter(item => {
        return item.categories.some(cat => cat.id === '5485a8684bdc2da71d8b4567') && !skipTypes.includes(item.properties.caliber)
    }).map(ammoData => {
        const returnData = {
            ...ammoData,
            ...ammoData.properties,
            type: formatCaliber(ammoData.properties.caliber, ammoData.properties.ammoType),
            displayDamage: useAllProjectileDamage ? ammoData.properties.projectileCount * ammoData.properties.damage : ammoData.properties.damage,
            displayPenetration: ammoData.properties.penetrationPower,
        };
        if (!returnData.type) 
            console.log(returnData);

        if (returnData.displayDamage > MAX_DAMAGE) {
            returnData.name = `${ammoData.name} (${returnData.displayDamage})`;
            returnData.displayDamage = MAX_DAMAGE;
        }

        if (returnData.penetrationPower > MAX_PENETRATION) {
            returnData.name = `${ammoData.name} (${returnData.penetrationPower})`;
            returnData.displayPenetration = MAX_PENETRATION;
        }
        let symbol = symbols[typeCache.length];

        if(typeCache.includes(returnData.type)) {
            symbol = symbols[typeCache.indexOf(returnData.type)];
        } else {
            typeCache.push(returnData.type);
            legendData.push({
                ...returnData,
                name: returnData.type,
                caliber: returnData.properties.caliber,
                symbol: symbol,
            });
        }
        returnData.symbol = symbol;

        if(!symbol) {
            console.log(`Missing symbol for ${returnData.type}, the graph will crash. Add more symbols to src/symbols.json`);
            process.exit(1);
        }

        if (!showAllTraderPrices) {
            returnData.buyFor = returnData.buyFor.filter(buyFor => {
                if (buyFor.vendor.normalizedName === 'flea-market') {
                    return true;
                }
                if (buyFor.vendor.minTraderLevel <= settings[buyFor.vendor.normalizedName]) {
                    return true;
                }
                return false;
            });
        }

        return returnData;
    }).sort((a, b) => {
        return a.type.localeCompare(b.type);
    });

    legendData.sort((a, b) => {
        return a.type.localeCompare(b.type);
    });

    const listState = useMemo(() => {
        const returnData = formattedData
            .filter(
                (ammo) =>
                    !selectedLegendName ||
                    selectedLegendName.length === 0 ||
                    selectedLegendName.includes(ammo.type),
            )
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
    }, [selectedLegendName, shiftPress, formattedData]);

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
            />
        </div>,
    ];
}

export default Ammo;
