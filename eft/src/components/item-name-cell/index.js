import { Link } from 'react-router-dom';

import ContainedItemsList from '../contained-items-list/index.js';

import './index.css';

function ItemNameCell(props) {
    let {item, showContainedItems, showRestrictedType} = props;
    if (!item) {
        item = props.row.original;
    }
    return (
        <div className="small-item-table-description-wrapper">
            <div className="small-item-table-image-wrapper">
                <Link
                    to={item.itemLink}
                >
                    <img
                        alt={item.name}
                        className="table-image"
                        loading="lazy"
                        src={item.iconLink}
                    />
                </Link>
            </div>
            <div className="small-item-table-name-wrapper">
                <Link
                    to={item.itemLink}
                >
                    {item.name}{item.count > 1 ? ` x ${item.count}` : ''}
                </Link>
                {showRestrictedType && (
                    <cite>
                        <ContainedItemsList item={item} showRestrictedType={showRestrictedType} />
                    </cite>
                )}
                {showContainedItems && (item.properties?.grids || item.properties?.slots) && (
                    <cite>
                        <ContainedItemsList item={item} />
                    </cite>
                )}
            </div>
        </div>
    );
}

export default ItemNameCell;
