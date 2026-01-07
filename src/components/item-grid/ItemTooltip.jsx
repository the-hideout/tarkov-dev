import { useTranslation } from "react-i18next";

import formatPrice from "../../modules/format-price.js";

function ItemTooltip(props) {
    const { t } = useTranslation();

    if (!props.pricePerSlot) {
        return false;
    }

    return (
        <span className={"grid-item-tooltip"}>
            <div className={"grid-item-tooltip-title"}>{props.name}</div>
            <div>
                {t("Value")}: {formatPrice(props.pricePerSlot * props.slots)}
            </div>
            <div>
                {t("Per slot")}: {formatPrice(props.pricePerSlot)}
            </div>
            <div>
                {t("Sell to")}: {props.sellTo}
            </div>
        </span>
    );
}

export default ItemTooltip;
