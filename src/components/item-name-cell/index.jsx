import { Link } from "react-router-dom";

import ContainedItemsList from "../contained-items-list/index.jsx";

import "./index.css";

function ItemNameCell(props) {
    let { item, showContainedItems, showRestrictedType } = props;
    if (!item) {
        item = props.row.original;
    }
    let firImage = "";
    if (item.foundInRaid) {
        firImage = (
            <img alt="" className="item-fir" loading="lazy" src={`${process.env.PUBLIC_URL}/images/icon-fir.png`} />
        );
    }
    const itemImageElement = (
        <span style={{ position: "relative" }}>
            <img alt={item.name} className="table-image" loading="lazy" src={item.iconLink} />
            {firImage}
        </span>
    );
    let itemImageWrapper;
    const itemNameElement = (
        <span>
            {item.name} {item.count > 1 ? ` x ${item.count}` : ""}
        </span>
    );
    let itemNameWrapper;
    if (item.itemLink) {
        itemImageWrapper = <Link to={item.itemLink}>{itemImageElement}</Link>;
        itemNameWrapper = <Link to={item.itemLink}>{itemNameElement}</Link>;
    } else {
        itemImageWrapper = itemImageElement;
        itemNameWrapper = itemNameElement;
    }
    return (
        <div className="small-item-table-description-wrapper">
            <div className="small-item-table-image-wrapper">{itemImageWrapper}</div>
            <div className="small-item-table-name-wrapper">
                {itemNameWrapper}
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
