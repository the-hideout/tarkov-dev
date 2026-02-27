import { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Badge, LinearProgress } from "@mui/material";

import "./index.css";

const Sides = {
    Left: "Left",
    Right: "Right",
};

function ID(props) {
    const [side, setSide] = useState(Sides.Left);
    const [copied, setCopied] = useState(false);
    const { t } = useTranslation();
    const socketStatus = useSelector((state) => state.sockets.status);

    const progressStyle = useMemo(() => {
        if (socketStatus !== "connecting") {
            return { display: "none" };
        }
        return {};
    }, [socketStatus]);

    const sessionText = useMemo(() => {
        if (socketStatus === "idle") {
            return t("Click to connect");
        }
        if (socketStatus === "connected") {
            return props.sessionID;
        }
        return t("Connecting...");
    }, [socketStatus, t]);

    const handleCopyClick = useCallback(async () => {
        if (socketStatus !== "connected") {
            return;
        }

        try {
            await navigator.clipboard.writeText(props.sessionID);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Copy failed", err);
        }
    }, [socketStatus]);

    let sideClass;
    let sideButtonContent;
    let otherSide;
    if (side === Sides.Left) {
        sideClass = "id-wrapper-left";
        sideButtonContent = ">>";
        otherSide = Sides.Right;
    } else {
        sideClass = "id-wrapper-right";
        sideButtonContent = "<<";
        otherSide = Sides.Left;
    }

    const handleSwitchSideClick = useCallback(() => {
        setSide(otherSide);
    }, [setSide, otherSide]);

    return (
        <div
            className={`id-wrapper ${sideClass}`}
            alt={t("open this page in another browser or window and connect using this id")}
            title={t("open this page in another browser or window and connect using this id")}
            onClick={props.onClick}
        >
            <div className="update-label">
                {t("ID for remote control")}
                <span className="session-question">
                    <span>?</span>
                    <div className="session-popup">
                        {t("Go to Tarkov.dev with another browser and enter this ID to control this page from there")}
                    </div>
                </span>
                <button className="session-switch-side" onClick={handleSwitchSideClick}>
                    {sideButtonContent}
                </button>
            </div>

            <div className="session-id-container">
                <Badge
                    badgeContent={copied ? t("Copied!") : 0}
                    color="success"
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                >
                    <span className="session-id" onClick={handleCopyClick} style={{ cursor: "pointer" }}>
                        {sessionText}
                    </span>
                </Badge>
            </div>
            <LinearProgress style={progressStyle} />
        </div>
    );
}

export default ID;
