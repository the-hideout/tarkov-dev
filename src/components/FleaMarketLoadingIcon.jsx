import { useTranslation } from "react-i18next";
import { Icon } from "@mdi/react";
import { mdiTimerSand } from "@mdi/js";
import { Tooltip } from "@mui/material";

function FleaMarketLoadingIcon({ size = 1, tooltip }) {
    const { t } = useTranslation();

    if (!tooltip) {
        tooltip = t("Flea market prices loading");
    }

    return (
        <Tooltip placement="bottom" title={tooltip} arrow>
            <Icon path={mdiTimerSand} size={size} className="icon-with-text" />
        </Tooltip>
    );
}

export default FleaMarketLoadingIcon;
