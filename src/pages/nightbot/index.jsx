import { useTranslation } from "react-i18next";

import SEO from "../../components/SEO.jsx";

import "./index.css";

function Nightbot() {
    const { t } = useTranslation();
    const botName = "Nightbot";
    return [
        <SEO
            title={`${t("Tarkov.dev {{bot}} integration", { bot: botName })} - ${t("Tarkov.dev")}`}
            description={t(
                "bot-page-description",
                "This page contains everything necessary to integrate {{bot}} with Tarkov.dev.",
                { bot: botName },
            )}
            key="seo-wrapper"
        />,
        <div className={"page-wrapper nightbot-page-wrapper"}>
            <h1>{t("Tarkov.dev {{bot}} integration", { bot: botName })}</h1>
            <p>{t("You can add command to your nightbot to get price check in your twitch / youtube channel chat")}</p>
            <h2>{t("Instructions")}</h2>
            <ul>
                <li>
                    {t("Register at")}{" "}
                    <a href="https://nightbot.tv" target="_blank" rel="noopener noreferrer">
                        nightbot.tv
                    </a>{" "}
                    {t("using your twitch / youtube account")}
                </li>
                <li>
                    {t("Go to dashboard")}{" "}
                    <a href="https://nightbot.tv/dashboard" target="_blank" rel="noopener noreferrer">
                        nightbot.tv/dashboard
                    </a>
                </li>
                <li>{t('Click the "Join Channel" button')}</li>
            </ul>
            <p>
                <img
                    alt={"Nightbot step 1"}
                    height={452}
                    src={`${process.env.PUBLIC_URL}/images/integrations/nightbot-1.jpg`}
                    width={900}
                    loading="lazy"
                />
            </p>
            <ul>
                <li>{t("Make bot - moderator, just type /mod nightbot in your chat")}</li>
                <li>
                    {t("Go to custom commands")}{" "}
                    <a href="https://nightbot.tv/commands/custom" target="_blank" rel="noopener noreferrer">
                        nightbot.tv/commands/custom
                    </a>
                </li>
                <li>{t('Press the "Add command" button')}</li>
            </ul>
            <p>
                <img
                    alt={"Nightbot step 2"}
                    height={375}
                    loading="lazy"
                    src={`${process.env.PUBLIC_URL}/images/integrations/nightbot-2.jpg`}
                    width={900}
                />
            </p>
            <ul>
                <li>{t("Command: !p or anything you like")}</li>
                <li>
                    {t("Message:")}
                    <pre>$(urlfetch https://streamer.tarkov.dev/webhook/nightbot?q=$(querystring))</pre>
                </li>
                <li>{t('Press "Submit"')}</li>
            </ul>
            <p>
                <img
                    alt={"Nightbot step 3"}
                    loading="lazy"
                    height={579}
                    src={`${process.env.PUBLIC_URL}/images/integrations/nightbot-3.jpg`}
                    width={900}
                />
            </p>
            <p>
                {t("Big thanks to")}{" "}
                <a href="https://www.twitch.tv/PhreakinPhil" target="_blank" rel="noopener noreferrer">
                    PhreakinPhil
                </a>{" "}
                {t("for feedback")}
            </p>
        </div>,
    ];
}

export default Nightbot;
