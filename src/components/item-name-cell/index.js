import { Link } from 'react-router-dom';

import ContainedItemsList from '../contained-items-list';

import './index.css';

function ItemNameCell(props) {
    return (
        <div className="small-item-table-description-wrapper">
            <div className="small-item-table-image-wrapper">
                <Link
                    to={props.row.original.itemLink}
                    className="small-item-table-image-link"
                >
                    <img
                        alt={props.row.original.name}
                        className="table-image"
                        loading="lazy"
                        src={props.row.original.iconLink}
                    />
                </Link>
            </div>
            <div className="small-item-table-name-wrapper">
                <Link
                    className="craft-reward-item-title"
                    to={props.row.original.itemLink}
                >
                    {props.row.original.name}{props.row.original.count > 1 ? ` x ${props.row.original.count}` : ''}
                </Link>
                {props.row.original.notes ? (
                    <cite>{props.row.original.notes}</cite>
                ) : (
                    ''
                )}
                {props.showContainedItems && (props.row.original.properties?.grids || props.row.original.properties?.slots) && (
                    <cite>
                        <ContainedItemsList item={props.row.original} />
                    </cite>
                )}
            </div>
        </div>
    );
}

export default ItemNameCell;
