/* eslint-disable no-restricted-globals */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css'; // optional

import Graph from '../../components/Graph.jsx';
import useKeyPress from '../../hooks/useKeyPress';
import DataTable from '../../components/data-table';
import CenterCell from '../../components/center-cell';
import ValueCell from '../../components/value-cell';
import getRublePrice from '../../modules/get-ruble-price.js';
import TraderPriceCell from '../../components/trader-price-cell';
import { useItemsQuery } from '../../features/items/queries';
import rawData from '../../data/ammo.json';

const MAX_DAMAGE = 170;
const MAX_PENETRATION = 70;

const formattedData = rawData.data
    .map((ammoData) => {
        const returnData = {
            ...ammoData,
            displayDamage: ammoData.damage,
            displayPenetration: ammoData.penetration,
        };

        if (ammoData.damage > MAX_DAMAGE) {
            returnData.name = `${ammoData.name} (${ammoData.damage})`;
            returnData.displayDamage = MAX_DAMAGE;
        }

        if (ammoData.penetration > MAX_PENETRATION) {
            returnData.name = `${ammoData.name} (${ammoData.penetration})`;
            returnData.displayPenetration = MAX_PENETRATION;
        }

        return returnData;
    })
    .sort((a, b) => {
        return a.type.localeCompare(b.type);
    });

let typeCache = [];
const legendData = formattedData
    .map((ammo) => {
        if (typeCache.includes(ammo.type)) {
            return false;
        }

        typeCache.push(ammo.type);

        return {
            ...ammo,
            name: ammo.type,
            symbol: ammo.symbol,
        };
    })
    .filter(Boolean);

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

                ammo = {
                    ...ammo,
                    ...items.find((item) => ammo.id === item.id),
                };
                ammo.fragChance = `${Math.floor(ammo.fragChance * 100)}%`;
                ammo.trader = ammo.buyFor
                    ?.map((buyFor) => {
                        if (buyFor.source === 'flea-market') {
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
                    chartName: `${ammo.chartName} (${ammo.fragChance})`,
                };
            });

        return returnData;
    }, [selectedLegendName, shiftPress, items]);

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

            if (
                getRublePrice(
                    a.original.trader?.price,
                    a.original.trader?.currency,
                ) >
                getRublePrice(
                    b.original.trader?.price,
                    b.original.trader?.currency,
                )
            ) {
                return 1;
            }

            if (
                getRublePrice(
                    a.original.trader?.price,
                    a.original.trader?.currency,
                ) <
                getRublePrice(
                    b.original.trader?.price,
                    b.original.trader?.currency,
                )
            ) {
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
                accessor: 'penetration',
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
                Header: t('Trader price'),
                accessor: 'trader',
                sortType: traderPriceSort,
                Cell: TraderPriceCell,
            },
        ],
        [t, traderPriceSort],
    );

    return (
        <React.Fragment>
            <div className={'updated-label'}>
                {`Ammo updated: ${new Date(
                    rawData.updated,
                ).toLocaleDateString()}`}
            </div>
            <div className="page-wrapper">
                <Graph
                    listState={listState}
                    legendData={legendData}
                    selectedLegendName={selectedLegendName}
                    handleLegendClick={handleLegendClick}
                    xMax={MAX_DAMAGE}
                    yMax={MAX_PENETRATION}
                />
            </div>
            <DataTable columns={columns} data={listState} />
        </React.Fragment>
    );
}

export default Ammo;
