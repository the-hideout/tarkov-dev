/* eslint-disable no-restricted-globals */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css'; // optional

import Icon from '@mdi/react';
import { mdiAmmunition } from '@mdi/js';

import Graph from '../../components/Graph.jsx';
import useKeyPress from '../../hooks/useKeyPress';
import DataTable from '../../components/data-table';
import CenterCell from '../../components/center-cell';
import ValueCell from '../../components/value-cell';
import TraderPriceCell from '../../components/trader-price-cell';
import { useItemsQuery } from '../../features/items/queries';
import formatCaliber from '../../modules/format-ammo';
import symbols from '../../symbols';

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
    let currentAmmoList = [];
    if (currentAmmo) {
        currentAmmoList = currentAmmo.split(',');
    }
    const navigate = useNavigate();
    const [selectedLegendName, setSelectedLegendName] =
        useState(currentAmmoList);
    const shiftPress = useKeyPress('Shift');
    const { t } = useTranslation();
    const { data: items } = useItemsQuery();

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
        return item.categories.some(cat => cat.id === '5485a8684bdc2da71d8b4567') &&
            !skipTypes.includes(item.properties.caliber)
    }).map(ammoData => {
        const returnData = {
            ...ammoData,
            ...ammoData.properties,
            type: formatCaliber(ammoData.properties.caliber) || ammoData.properties.caliber.replace('Caliber', ''),
            displayDamage: ammoData.properties.damage,
            displayPenetration: ammoData.properties.penetrationPower,
        };
        if (!returnData.type) console.log(returnData);
        if (returnData.type === '12 Gauge Shot' && returnData.ammoType === 'bullet') returnData.type = returnData.type.replace('Shot', 'Slug');

        if (returnData.damage > MAX_DAMAGE) {
            returnData.name = `${ammoData.name} (${returnData.damage})`;
            returnData.displayDamage = MAX_DAMAGE;
        }

        if (returnData.penetration > MAX_PENETRATION) {
            returnData.name = `${ammoData.name} (${returnData.penetration})`;
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
                symbol: symbol,
            });
        }
        returnData.symbol = symbol;

        if(!symbol) {
            console.log(`Missing symbol for ${returnData.type}, the graph will crash. Add more symbols to src/symbols.json`);
            process.exit(1);
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

    const traderPriceSort = useMemo(
        () => (a, b) => {
            if (!a.original.trader) {
                return 1;
            }

            if (!b.original.trader) {
                return -1;
            }

            if (a.original.trader?.priceRUB > b.original.trader?.priceRUB) {
                return 1;
            }

            if (a.original.trader?.priceRUB < b.original.trader?.priceRUB) {
                return -1;
            }

            return 0;
        },
        [],
    );

    const columns = useMemo(
        () => [
            {
                Header: t(''),
                accessor: 'gridImageLink',
                Cell: (props) => {
                    return (
                        <CenterCell>
                            <img
                                alt={`${props.row.original.name} icon`}
                                height={64}
                                loading="lazy"
                                src={props.value}
                                width={64}
                            />
                        </CenterCell>
                    );
                },
            },
            {
                Header: t('Name'),
                accessor: 'name',
                Cell: (props) => {
                    return (
                        <div>
                            <Link
                                to={`/item/${props.cell.row.original.normalizedName}`}
                            >
                                {props.value}
                            </Link>
                        </div>
                    );
                },
            },
            {
                Header: t('Caliber'),
                accessor: 'type',
                Cell: CenterCell,
            },
            {
                Header: t('Damage'),
                accessor: 'damage',
                Cell: CenterCell,
            },
            {
                Header: t('Penetration'),
                accessor: 'penetrationPower',
                Cell: CenterCell,
            },
            {
                Header: t('Armor damage'),
                accessor: 'armorDamage',
                Cell: CenterCell,
            },
            {
                Header: t('Fragmentation chance'),
                accessor: 'fragChance',
                Cell: CenterCell,
            },
            {
                Header: t('Flea Price'),
                accessor: 'lastLowPrice',
                Cell: ValueCell,
            },
            {
                Header: t('Trader buy'),
                accessor: 'trader',
                sortType: traderPriceSort,
                Cell: TraderPriceCell,
            },
        ],
        [t, traderPriceSort],
    );

    return (
        <React.Fragment>
            <h1 className="center-title">
                {t('Escape from Tarkov')}
                <Icon path={mdiAmmunition} size={1.5} className="icon-with-text"/>
                {t('Ammo Chart')}
            </h1>
            <div className="page-wrapper" style={{ minHeight: 0 }}>
                <Graph
                    listState={listState}
                    legendData={legendData}
                    selectedLegendName={selectedLegendName}
                    handleLegendClick={handleLegendClick}
                    xMax={MAX_DAMAGE}
                    yMax={MAX_PENETRATION}
                />
            </div>
            
            <div className="page-wrapper" style={{ minHeight: 0 }}>
                <p>
                    {"The wilderness of Tarkov includes a diverse range of ammunition. To combat different opponents, different types of ammunition are needed."}<br/>
                    <br/>
                    {"This page contains a list of every type of ammo in Escape from Tarkov. To filter the complete list of available cartridges, click the name of a caliber."}
                </p>
            </div>

            <h2 className="center-title">
                {t('Ammo Statistics Table')}
            </h2>

            <DataTable columns={columns} data={listState} />
        </React.Fragment>
    );
}

export default Ammo;
