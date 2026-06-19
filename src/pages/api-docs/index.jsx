import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark as atomOneDark } from "react-syntax-highlighter/dist/esm/styles/prism/index.js";
import { Trans, useTranslation } from "react-i18next";
import { HashLink } from "react-router-hash-link";

import SEO from "../../components/SEO.jsx";
//import ApiMetricsGraph from '../../components/api-metrics-graph/index.js';

import "./index.css";

function APIDocs() {
    const { t } = useTranslation();
    return [
        <SEO
            title={`${t("API Documentation")} - ${t("Tarkov.dev")}`}
            description={t(
                "api-docs-page-description",
                "Escape from Tarkov's community made API and its documentation. Learn more about our free and easy to use GraphQL API for EFT.",
            )}
            key="seo-wrapper"
        />,
        <div className={"page-wrapper api-docs-page-wrapper"}>
            <h1>{t("Tarkov.dev API")}</h1>
            <h2>{t("About")}</h2>
            {/* prettier-ignore */}
            <Trans i18nKey={'api-json-about-p'}>
                <div className="section-text-wrapper">
                    The API serves JSON responses to simple GET requests.
                </div>
                <div className="section-text-wrapper">
                    A list of available endpoints can be found at: <a href="https://json.tarkov.dev/endpoints" target="_blank" rel="noopener noreferrer">https://json.tarkov.dev/endpoints</a>.
                </div>
            </Trans>
            <h2>{t("FAQ")}</h2>
            <div className="section-text-wrapper">
                <h3>{t("Is it free?")}</h3>
                {t("Yes")}
            </div>
            <div className="section-text-wrapper">
                <h3>{t("Is it open source?")}</h3>
                {/* prettier-ignore */}
                <Trans i18nKey={'api-json-faq-open-source-p'}>
                    The source code for the API can be found here: <a href="https://github.com/the-hideout/tarkov-data-manager" target="_blank" rel="noopener noreferrer">github.com/the-hideout/tarkov-data-manager</a>.
                </Trans>
            </div>
            <div className="section-text-wrapper">
                <h3>{t("Is there a rate limit?")}</h3>
                {t("No")}
            </div>
            <div className="section-text-wrapper">
                <h3>{t("What about caching?")}</h3>
                {/* prettier-ignore */}
                <Trans i18nKey={'api-json-faq-caching-p'}>
                    Data is cached until new data is available.
                </Trans>
            </div>
            <div className="section-text-wrapper">
                <h3>{t("Where is the data from?")}</h3>
                {t("We source data from multiple places to build an API as complete as possible. We use data from:")}
                <ul>
                    <li>
                        <a href="https://tarkov-changes.com/" target="_blank" rel="noopener noreferrer">
                            Tarkov Changes
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://escapefromtarkov.fandom.com/wiki/Escape_from_Tarkov_Wiki"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Escape from Tarkov Wiki
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://github.com/TarkovTracker/tarkovdata/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            TarkovTracker/tarkovdata
                        </a>
                    </li>
                    <li>{t("Our network of scanners")}</li>
                </ul>
            </div>
            <h2>{t("Localization")}</h2>
            <div className="section-text-wrapper">
                <p>
                    {t(
                        'Localizations (translations) are available for the languages listed in the languages property of the endpoint response. To request localization strings for a particular request, take the base request url and append an underscore and the language code. For example, for English, append "_en".',
                    )}
                </p>
                <p>
                    {t(
                        "Each API response includes a `translations` property containing a list of JSON path strings that can be used with a translation file to localize the base response into a given language.",
                    )}
                </p>
            </div>
            <h3>{t("Examples")}</h3>
            <p>{t("Examples of using and localizing responses can be found in our code repositories:")}</p>
            <ul>
                <li>
                    <a
                        href="https://github.com/the-hideout/stash/blob/main/modules/json-api.mjs"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t("Stash Discord Bot")}
                    </a>
                </li>
                <li>
                    <a
                        href="https://github.com/the-hideout/tarkov-dev/blob/main/src/modules/api-request.mjs"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t("This website")}
                    </a>
                </li>
                <li>
                    <a
                        href="https://github.com/the-hideout/TarkovMonitor/blob/27ee738da2ef59410795791a9911ef985cefa67b/TarkovMonitor/TarkovDev.cs#L71"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t("TarkovMonitor")}
                    </a>
                </li>
            </ul>
        </div>,
    ];
}

export default APIDocs;
