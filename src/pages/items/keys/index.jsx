import { useCallback, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Icon } from "@mdi/react";
import { mdiKeyVariant } from "@mdi/js";

import SEO from "../../../components/SEO.jsx";
import { Filter, InputFilter, ToggleFilter } from "../../../components/filter/index.jsx";
import SmallItemTable from "../../../components/small-item-table/index.jsx";

import QueueBrowserTask from "../../../modules/queue-browser-task.js";

function Keys() {
    const defaultQuery = new URLSearchParams(window.location.search).get("search");
    const [showAllItemSources, setShowAllItemSources] = useState(false);
    const [nameFilter, setNameFilter] = useState(defaultQuery || "");
    const { t } = useTranslation();

    const handleNameFilterChange = useCallback(
        (e) => {
            if (typeof window !== "undefined") {
                const name = e.target.value.toLowerCase();

                // schedule this for the next loop so that the UI
                // has time to update but we do the filtering as soon as possible
                QueueBrowserTask.task(() => {
                    setNameFilter(name);
                });
            }
        },
        [setNameFilter],
    );

    return [
        <SEO
            title={`${t("Keys")} - ${t("Escape from Tarkov")} - ${t("Tarkov.dev")}`}
            description={t(
                "keys-page-description",
                "This page includes a sortable table with information on the different types of keys available in the game, including their price, rarity, and other characteristics.",
            )}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={"display-wrapper"}>
            <div className="page-headline-wrapper">
                <h1>
                    {t("Escape from Tarkov")}
                    <Icon path={mdiKeyVariant} size={1.5} className="icon-with-text" />
                    {t("Keys")}
                </h1>
                <Filter center>
                    <ToggleFilter
                        checked={showAllItemSources}
                        label={t("Ignore settings")}
                        onChange={(e) => setShowAllItemSources(!showAllItemSources)}
                        tooltipContent={<>{t("Shows all sources of items regardless of your settings")}</>}
                    />
                    <InputFilter
                        defaultValue={nameFilter}
                        onChange={handleNameFilterChange}
                        placeholder={t("filter on item")}
                    />
                </Filter>
            </div>

            <SmallItemTable
                nameFilter={nameFilter}
                typeFilter="keys"
                showAllSources={showAllItemSources}
                traderValue={1}
                fleaValue={2}
                cheapestPrice={3}
            />

            <div className="page-wrapper keys-page-wrapper">
                {/* prettier-ignore */}
                <Trans i18nKey={'keys-page-p'}>
                    <p>
                        {"Maps, keys, key cards, and other useful objects are included in intelligence items. These will help you stay one step ahead of the competition—or at the very least, know where you are in Escape from Tarkov."}
                        <br/>
                        {"The remaining durability of keys and keycards with a limited number of uses is displayed in the bottom right corner of their icons and on their inspection screens."}
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Keys;
