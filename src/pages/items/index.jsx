import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Icon } from "@mdi/react";
import { mdiViewGrid } from "@mdi/js";

import SEO from "../../components/SEO.jsx";
import ItemSearch from "../../components/item-search/index.jsx";
import ItemIconList from "../../components/item-icon-list/index.jsx";

import categoryPages from "../../data/category-pages.json";

import "./index.css";

function Items(props) {
    const { t } = useTranslation();
    return [
        <SEO
            title={`${t("Items")} - ${t("Escape from Tarkov")} - ${t("Tarkov.dev")}`}
            description={t(
                "items-page-description",
                "This page includes links to pages with information on different item categories, including armor, backpacks, barter items, containers, glasses, grenades, guns, headsets, helmet, keys, gun mods, pistol grips, provisions, rigs, suppressors, and more.",
            )}
            key="seo-wrapper"
        />,
        <div className={"page-wrapper"} key="map-page-wrapper">
            <h1 className="center-title">
                {t("Escape from Tarkov")}
                <Icon path={mdiViewGrid} size={1.5} className="icon-with-text" />
                {t("Items")}
            </h1>
            <ItemSearch showDropdown />
            <div className="items-list-wrapper">
                {categoryPages.map((categoryPage) => (
                    <Link
                        to={`/items/${categoryPage.key}`}
                        key={`item-wrapper-${categoryPage.key}`}
                        className="screen-link"
                    >
                        <h2 className="center-title">
                            <Icon path={ItemIconList(categoryPage.icon)} size={1} className="screen-link-icon" />
                            {t(categoryPage.displayText)}
                        </h2>
                        <img
                            alt={`${categoryPage.displayText} table`}
                            loading="lazy"
                            src={`${process.env.PUBLIC_URL}/images/items/${categoryPage.key}-table_thumb.jpg`}
                        />
                    </Link>
                ))}
            </div>

            <div className="page-wrapper items-page-wrapper">
                <p>
                    {t(
                        "items-page-description",
                        "This page includes links to pages with information on different item categories, including armor, backpacks, barter items, containers, glasses, grenades, guns, headsets, helmet, keys, gun mods, pistol grips, provisions, rigs, suppressors, and more.",
                    )}
                </p>
            </div>
        </div>,
    ];
}

export default Items;
