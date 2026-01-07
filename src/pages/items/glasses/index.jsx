import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Icon } from "@mdi/react";
import { mdiSunglasses } from "@mdi/js";

import SEO from "../../../components/SEO.jsx";
import { Filter, ToggleFilter } from "../../../components/filter/index.jsx";
import SmallItemTable from "../../../components/small-item-table/index.jsx";

function Glasses() {
    const { t } = useTranslation();
    const [showAllItemSources, setShowAllItemSources] = useState(false);

    return [
        <SEO
            title={`${t("Glasses")} - ${t("Escape from Tarkov")} - ${t("Tarkov.dev")}`}
            description={t(
                "glasses-page-description",
                "This page includes a sortable table with information on the different types of glasses available in the game, including their price, armor class, and other characteristics.",
            )}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={"display-wrapper"}>
            <div className="page-headline-wrapper">
                <h1>
                    {t("Escape from Tarkov")}
                    <Icon path={mdiSunglasses} size={1.5} className="icon-with-text" />
                    {t("Glasses")}
                </h1>
                <Filter center>
                    <ToggleFilter
                        checked={showAllItemSources}
                        label={t("Ignore settings")}
                        onChange={(e) => setShowAllItemSources(!showAllItemSources)}
                        tooltipContent={<>{t("Shows all sources of items regardless of your settings")}</>}
                    />
                </Filter>
            </div>

            <SmallItemTable
                typeFilter={"glasses"}
                showAllSources={showAllItemSources}
                armorClass={1}
                blindnessProtection={2}
                stats={3}
                cheapestPrice={4}
                sortBy="armorClass"
            />

            <div className="page-wrapper glasses-page-wrapper">
                {/* prettier-ignore */}
                <Trans i18nKey={'glasses-page-p'}>
                    <p>
                        {"Eyewear in Escape from Tarkov can be used to decrease the number and quantity of raindrops on the players' screens as well as the length of flashbang effects."}
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Glasses;
