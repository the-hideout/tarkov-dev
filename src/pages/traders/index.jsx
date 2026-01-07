import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";

import { Icon } from "@mdi/react";
import { mdiAccountGroup } from "@mdi/js";

import SEO from "../../components/SEO.jsx";
import TraderResetTime from "../../components/trader-reset-time/index.jsx";
import LoadingSmall from "../../components/loading-small/index.jsx";

import useTradersData from "../../features/traders/index.js";

import i18n from "../../i18n.js";

import "./index.css";

function Traders(props) {
    const { t } = useTranslation();
    const { data: allTraders } = useTradersData();

    // filter traders to only those who have barters
    // we used to check for sell items, but requires all item data
    // items.some(item => item.buyFor.some(offer => offer.vendor.trader?.id === trader.id))
    const traders = useMemo(() => {
        return allTraders.filter((trader) => trader.barters?.length > 0);
    }, [allTraders]);

    return [
        <SEO
            title={`${t("Traders")} - ${t("Escape from Tarkov")} - ${t("Tarkov.dev")}`}
            description={t(
                "traders-page-description",
                "Find out everything you need to know about traders in Escape from Tarkov. Learn about the different traders available in the game, their locations, and the items they sell.",
            )}
            key="seo-wrapper"
        />,
        <div className={"page-wrapper"} key="traders-page-wrapper">
            <h1 className="center-title">
                {t("Escape from Tarkov")}
                <Icon path={mdiAccountGroup} size={1.5} className="icon-with-text" />
                {t("Traders")}
            </h1>
            <div className="traders-list-wrapper">
                {traders.map((trader) => {
                    let resetTime = <LoadingSmall />;
                    if (trader.resetTime) {
                        resetTime = <TraderResetTime center timestamp={trader.resetTime} locale={i18n.language} />;
                    }
                    return (
                        <Link key={trader.id} to={`/trader/${trader.normalizedName}`} className="screen-link">
                            <h2 className="center-title">{trader.name}</h2>
                            <img
                                alt={trader.name}
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/traders/${trader.normalizedName}-portrait.png`}
                            />
                            {resetTime}
                        </Link>
                    );
                })}
            </div>
            <hr className="desc-line-break" />
            <div className="traders-page-wrapper">
                <h3>{t("About Traders")}</h3>
                {/* prettier-ignore */}
                <Trans i18nKey={'traders-page-p'}>
                    <p>
                        The backbones of trade in the destroyed, besieged Norvinsk. In Escape from Tarkov, each merchant specialized in a particular kind of products, such as medical supplies, weaponry, or military equipment. Although their prices are typically high, you get what you pay for.
                    </p>
                    <p>
                        More importantly, you can develop a reputation with each trader through Quests, which will enable you to receive better offers generally and reduce the commission they receive (an additional markup you pay on sales and purchases), among other benefits.
                    </p>
                    <p>
                        Additionally, traders provide other services like insurance and repairs (allowing you to recover your gear in case of death during a raid).
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Traders;
