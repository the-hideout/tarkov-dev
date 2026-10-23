import { useTranslation } from "react-i18next";
import Countdown from "react-countdown";
import { CircularProgress } from "@mui/material";

import SEO from "../../components/SEO.jsx";
import SeasonPerks from "../../components/season-perks/index.jsx";

import useSeasonData from "../../features/season/index.js";

import i18n from "../../i18n.js";

const Season = () => {
    const { t } = useTranslation();

    const { status, data: seasonData } = useSeasonData();

    if (status === "loading" || (!seasonData && status === "idle")) {
        return <CircularProgress aria-label="Loading…" />;
    }
    if (status === "failed") {
        return <p>{t("failed")}</p>;
    }

    return [
        <SEO
            title={`${t("game_mode_pvp-season")} - ${t("Escape from Tarkov")} - ${t("Tarkov.dev")}`}
            description={t(
                "season-description",
                "Get the latest information on the current season in Escape from Tarkov.",
            )}
            key="seo-wrapper"
        />,
        <div className={"page-wrapper"} key="page-wrapper">
            <div className="display-wrapper" key="season-display-wrapper">
                <div className={"entity-page-wrapper"} key="season-page-display-wrapper">
                    <div className="entity-information-wrapper">
                        <div className="entity-top-content">
                            <div className="title-bar">
                                <span className="type">{t("Season")}</span>
                                <h1>{seasonData.name}</h1>
                                {seasonData.wikiLink && (
                                    <span className="wiki-link-wrapper">
                                        <a href={seasonData.wikiLink} target="_blank" rel="noopener noreferrer">
                                            {t("Wiki")}
                                        </a>
                                    </span>
                                )}
                            </div>
                            <div className="main-content">
                                <h3>
                                    {new Date(seasonData.start).toLocaleString()} -{" "}
                                    {new Date(seasonData.end).toLocaleString()}
                                </h3>
                                <h3>
                                    {t("Time Remaining:")}{" "}
                                    <Countdown
                                        date={new Date(seasonData?.end ?? undefined).getTime()}
                                        locale={i18n.language}
                                    />
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div className="center-title">
                        <SeasonPerks />
                    </div>
                </div>
            </div>
        </div>,
    ];
};

export default Season;
