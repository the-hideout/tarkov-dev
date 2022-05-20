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
                    formattedItem.totalPrice = '-';
                }

                return formattedItem;
            });

        return returnData;
    }, [items, includeItemIds, barters, includeItems]);

    let displayColumns = useMemo(() => {
        const useColumns = [
            {
                Header: t('Name'),
                accessor: 'name',
                Cell: ItemNameCell,
            },
            {
                Header: t('Quantity'),
                accessor: 'quantity',
                Cell: CenterCell,
            },
            {
                Header: t('Buy on Flea'),
                accessor: (d) => Number(d.buyOnFleaPrice?.price),
                Cell: FleaPriceCell,
                id: 'fleaBuyPrice',
            },
            {
                Header: t('Buy from trader'),
                accessor: (d) => Number(d.instaProfit),
                Cell: TraderPriceCell,
                id: 'traderBuyCell',
            },
            {
                Header: t('Total'),
                accessor: 'totalPrice',
                Cell: ValueCell,
                id: 'totalPriceCell',
            },
        ];

        return useColumns;
    }, [t]);

    const extraRow = (
        <div>
            Total:{' '}
            {formatPrice(
                data.reduce((previousValue, currentValue) => {
                    return previousValue + currentValue.totalPrice;
                }, 0),
            )}
        </div>
    );

    return (
        <DataTable
            className="data-table"
            columns={displayColumns}
            extraRow={extraRow}
            key="item-table"
            data={data}
            autoResetSortBy={false}
        />
    );
}

export default ItemsSummaryTable;
