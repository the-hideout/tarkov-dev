import { Link } from 'react-router-dom';

import ContainedItemsList from '../contained-items-list';

import './index.css';

function ItemNameCell(props) {
    return (
        <div className="small-item-table-description-wrapper">
            <div className="small-item-table-image-wrapper">
                <img
                    alt=""
                    className="table-image"
                    height="64"
                    loading="lazy"
                    src={props.row.original.iconLink}
                    width="64"
                />
            </div>
            <div className="small-item-table-name-wrapper">
                <Link
                    className="craft-reward-item-title"
                    to={props.row.original.itemLink}
                >
                    {props.row.original.name}
                </Link>
                {props.row.original.notes ? (
                    <cite>{props.row.original.notes}</cite>
                ) : (
                    ''
                )}
                {props.showContainedItems && props.row.original.canHoldItems && (
                    <cite>
                        <ContainedItemsList item={props.row.original} />
                    </cite>
                )}
            </div>
        </div>
    );
}

export default ItemNameCell;
