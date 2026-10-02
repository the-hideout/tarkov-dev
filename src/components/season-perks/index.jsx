import React from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress, ToggleButton, ToggleButtonGroup } from "@mui/material";

import useSeasonData from "../../features/season/index.js";

import "./index.css";

const SeasonPerks = React.forwardRef((props, ref) => {
    const [selectedPerks, setSelectedPerks] = React.useState(() => []);
    const selectedPerksRef = React.useRef(selectedPerks);
    const [pointsTotal, setPointsTotal] = React.useState(() => 0);
    const pointsTotalRef = React.useRef(pointsTotal);
    const { t } = useTranslation();
    const seasonData = useSeasonData();

    const handlePerkSelectionChange = React.useCallback(
        (event, newSelectedPerks) => {
            const perks = seasonData.data.perks.personal.filter((p) => newSelectedPerks.includes(p.id));
            setSelectedPerks(newSelectedPerks);
            selectedPerksRef.current = newSelectedPerks;
            setPointsTotal(perks.reduce((total, perk) => total + perk.points, 0));
        },
        [seasonData, setPointsTotal],
    );

    const perkIsDisabled = React.useCallback(
        (perk) => {
            for (const id of selectedPerksRef.current) {
                const selectedPerk = seasonData.data.perks.personal.find((p) => p.id === id);
                if (selectedPerk.exclusiveToPerks.includes(perk.id)) {
                    return true;
                }
            }
            return false;
        },
        [seasonData],
    );

    if (!seasonData || seasonData.status === "loading" || (!seasonData.data && seasonData.status === "idle")) {
        return <CircularProgress aria-label="Loading…" />;
    }
    if (seasonData.status === "failed") {
        return <p>{t("failed")}</p>;
    }

    const commonPerks = [];
    for (const perk of seasonData.data.perks.common) {
        commonPerks.push(
            <span key={perk.id} className="common-perk">
                <span>
                    <img src={perk.imageLink} alt="" className="perk-image" />
                </span>
                <span>
                    <div className="perk-title">{perk.name}</div>
                    <div className="perk-description">{perk.description}</div>
                </span>
            </span>,
        );
    }
    const positivePerks = [];
    const negativePerks = [];
    for (const perk of seasonData.data.perks.personal) {
        let perkGroup = positivePerks;
        const perkType = perk.points < 0 ? "positive" : "negative";
        if (perkType !== "positive") {
            perkGroup = negativePerks;
        }
        perkGroup.push(
            <ToggleButton
                key={perk.id}
                value={perk.id}
                aria-label={perk.name}
                className={`PerkButton ${perkType}`}
                disabled={perkIsDisabled(perk)}
            >
                <div>
                    <img src={perk.imageLink} alt="" className="perk-image" />
                </div>
                <div>
                    <div className="perk-title">{`${perk.name} (${perk.points})`}</div>
                    <div className="perk-description">{perk.description}</div>
                </div>
            </ToggleButton>,
        );
    }
    return [
        <h2 key="perks-global-title">{t("Global Modifiers")}</h2>,
        <div key="perks-common" className="season-perks-common">
            {commonPerks}
        </div>,
        <h2 key="perks-personal-title">{t("Personal Modifiers")}</h2>,
        <div key="perks-points-total" className="season-perks-points-total">
            <span>{t("Point Balance:")}</span>
            <span className="points-total">{pointsTotal}</span>
        </div>,
        <ToggleButtonGroup
            key="perks-negative"
            className="season-perks-selector"
            orientation="vertical"
            onChange={handlePerkSelectionChange}
            value={selectedPerks}
        >
            {negativePerks}
        </ToggleButtonGroup>,
        <ToggleButtonGroup
            key="perks-positive"
            className="season-perks-selector"
            orientation="vertical"
            onChange={handlePerkSelectionChange}
            value={selectedPerks}
        >
            {positivePerks}
        </ToggleButtonGroup>,
    ];
});

export default SeasonPerks;
