import { useTranslation } from "react-i18next";
import Countdown from "react-countdown";

import SEO from "../../components/SEO.jsx";
import { getCurrentSeason } from "../../modules/season-details.mjs";

import i18n from "../../i18n.js";

const Season = () => {
    const { t } = useTranslation();

    const currentSeason = getCurrentSeason();

    return [
        <SEO
            title={`${t("game_mode_pvp-season")} - ${t("Escape from Tarkov")} - ${t("Tarkov.dev")}`}
            description={t(
                "season-description",
                "Get the latest information on the average wipe length in Escape from Tarkov. Find out how long wipes typically last, and prepare for the next wipe.",
            )}
            key="seo-wrapper"
        />,
        <div className={"page-wrapper"} key="page-wrapper">
            <h1 className="center-title">
                {t("Escape from Tarkov")} - {t("game_mode_pvp-season")}
            </h1>
            <div className="center-title">
                <h3>{t("Time Remaining:")}</h3>
                <h2>
                    <Countdown date={new Date(currentSeason?.end ?? undefined).getTime()} locale={i18n.language} />
                </h2>
            </div>
            <div className="center-title">
                <p>Eventually, this page can include information on the perks available for the current season.</p>
            </div>
        </div>,
    ];
};

export default Season;
