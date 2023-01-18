import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css'; // optional

import DataTable from '../data-table';
import ItemNameCell from '../item-name-cell';
import TraderPriceCell from '../trader-price-cell';
import CenterCell from '../center-cell';
import FleaPriceCell from '../flea-price-cell';
import ValueCell from '../value-cell';

import formatPrice from '../../modules/format-price';
import { useItemsQuery } from '../../features/items/queries';
import { useBartersQuery } from '../../features/barters/bartersSlice';

import FleaMarketLoadingIcon from '../FleaMarketLoadingIcon';

// import './index.css';

function ItemsSummaryTable(props) {
    const { includeItems } = props;
    const { t } = useTranslation();

    const { data: items } = useItemsQuery();
    const { data: barters } = useBartersQuery();

    const includeItemIds = useMemo(() => {
        return includeItems.map((includeItem) => includeItem.id);
    }, [includeItems]);

    const data = useMemo(() => {
        let returnData = items
            .filter((item) => includeItemIds.includes(item.id))
            .map((item) => {
                const formattedItem = {
                    ...item,
                    quantity: includeItems.find(
                        (includeItem) => includeItem.id === item.id,
                    ).quantity,
                    itemLink: `/item/${item.normalizedName}`,
                    barters: barters.filter(
                        (barter) => barter.rewardItems[0].item.id === item.id,
                    ),
                    buyOnFleaPrice: item.buyFor.find(
                        (buyPrice) => buyPrice.source === 'flea-market',
                    ),
                    buyFromTraderPrice: item.buyFor.find(
                        (buyPrice) => buyPrice.source !== 'flea-market',
                    ),
                };

                let traderPrice = formattedItem.buyFromTraderPrice?.priceRUB;
                let fleaPrice = formattedItem.buyOnFleaPrice?.price;

                if (traderPrice && fleaPrice && traderPrice < fleaPrice) {
                    formattedItem.totalPrice =
                        traderPrice * formattedItem.quantity;
                } else if (
                    traderPrice &&
                    fleaPrice &&
                    traderPrice > fleaPrice
                ) {
                    formattedItem.totalPrice =
                        fleaPrice * formattedItem.quantity;
                } else if (traderPrice) {
                    formattedItem.totalPrice =
                        traderPrice * formattedItem.quantity;
                } else if (fleaPrice) {
                    formattedItem.totalPrice =
                        fleaPrice * formattedItem.quantity;
                } else if (formattedItem.id === '5449016a4bdc2d6f028b456f') {
                    formattedItem.totalPrice = formattedItem.quantity;
                } else {
                    formattedItem.totalPrice = 0;
                }

                return formattedItem;
            });

        return returnData;
    }, [items, includeItemIds, barters, includeItems]);

    let displayColumns = useMemo(() => {
        const useColumns = [
            {
                Header: t('Name'),
                id: 'name',
                accessor: 'name',
                Cell: ItemNameCell,
            },
            {
                Header: t('Amount'),
                id: 'quantity',
                accessor: 'quantity',
                Cell: CenterCell,
            },
            {
                Header: t('Buy on Flea'),
                id: 'fleaBuy',
                accessor: (d) => Number(d.buyOnFleaPrice?.price),
                Cell: FleaPriceCell,
            },
            {
                Header: t('Trader buy'),
                id: 'traderBuy',
                accessor: (d) => Number(d.instaProfit),
                Cell: TraderPriceCell,
            },
            {
                Header: t('Cost'),
                id: 'totalPrice',
                accessor: 'totalPrice',
                Cell: (props) => {
                    if (!props.value && props.row.original.cached) {
                        return (
                            <div className="center-content">
                                <FleaMarketLoadingIcon/>
                            </div>
                        );
                    }
                    return <ValueCell value={props.value}/>;
                },
            },
        ];

        return useColumns;
    }, [t]);

    const extraRow = (
        <>
            {t('Cost')}:{' '}
            {formatPrice(
                data.reduce((previousValue, currentValue) => {
                    return previousValue + currentValue.totalPrice;
                }, 0),
            )}
        </>
    );

    return (
        <DataTable
            className="data-table"
            key="item-summary-table"
            columns={displayColumns}
            data={data}
            extraRow={extraRow}
            autoResetSortBy={false}
        />
    );
}

export default ItemsSummaryTable;
