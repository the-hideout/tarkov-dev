import { Trans, useTranslation } from "react-i18next";

import Contributors from "../../components/contributors/index.jsx";
import SEO from "../../components/SEO.jsx";
import useRepositoryContributors from "../../hooks/useRepositoryContributors.js";

import "./index.css";

const RELEASE_URL =
  "https://github.com/the-hideout/TarkovMonitor/releases/latest";
const REPOSITORY_URL = "https://github.com/the-hideout/TarkovMonitor";
const DISCORD_URL = "https://discord.gg/XPAsKGHSzH";
function TarkovMonitorPage() {
  const { t } = useTranslation();
  const { contributors: monitorContributors } = useRepositoryContributors(
    "the-hideout/TarkovMonitor",
  );

  return [
    <SEO
      title={`${t("TarkovMonitor")} - ${t("Escape from Tarkov")} - ${t("Tarkov.dev")}`}
      description={t(
        "tarkov-monitor-page-description",
        "Learn how to install TarkovMonitor, connect it to TarkovTracker, and use it to control Tarkov.dev maps.",
      )}
      key="seo-wrapper"
    />,
    <div
      className="page-wrapper tool-detail-page tarkov-monitor-page"
      key="tarkov-monitor-wrapper"
    >
      <section className="tool-hero">
        <div>
          <p className="eyebrow">{t("Companion app")}</p>
          <h1>{t("TarkovMonitor")}</h1>
          <Trans i18nKey="tarkov-monitor-hero">
            <p>
              {t(
                "tarkov-monitor-summary",
                "TarkovMonitor provides helpful alerts and timers for Escape From Tarkov so you can manage raids without interrupting gameplay.",
              )}
            </p>
          </Trans>
          <div className="tool-cta-group">
            <a
              className="tool-cta primary"
              href={RELEASE_URL}
              target="_blank"
              rel="noreferrer"
            >
              {t("Download latest release")}
            </a>
            <a
              className="tool-cta secondary"
              href={REPOSITORY_URL}
              target="_blank"
              rel="noreferrer"
            >
              {t("View on GitHub")}
            </a>
            <a
              className="tool-cta secondary"
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
            >
              {t("Join the community")}
            </a>
          </div>
        </div>
        <figure>
          <img
            src={`${process.env.PUBLIC_URL}/images/other-tools/tarkov-monitor-overview.png`}
            alt={t(
              "Screenshot of TarkovMonitor showing timers and integrations",
            )}
            loading="lazy"
          />
          <figcaption>
            {t(
              "Visual timers, raid state, and integration health in TarkovMonitor.",
            )}
          </figcaption>
        </figure>
      </section>
      <section
        id="features"
        className="feature-list"
        aria-label={t("Main Features")}
      >
        <h2>{t("Main Features")}</h2>
        <ul>
          <li>
            {t(
              "tarkov-monitor-feature-audio",
              "Audio alerts for matchmaking, raid start, runthrough timer, scav cooldown, and air filter notifications.",
            )}
          </li>
          <li>
            {t(
              "tarkov-monitor-feature-map",
              "Automatic map opening on Tarkov.dev based on the location you are joining.",
            )}
          </li>
          <li>
            {t(
              "tarkov-monitor-feature-screenshot",
              "Optional screenshot-activated position display for quick location sharing.",
            )}
          </li>
          <li>
            {t(
              "tarkov-monitor-feature-quests",
              "Automatic quest updates to TarkovTracker whenever completions are detected.",
            )}
          </li>
          <li>
            {t(
              "tarkov-monitor-feature-stats",
              "Local statistics such as flea market income, queue durations, and map play frequency.",
            )}
          </li>
          <li>
            {t(
              "tarkov-monitor-feature-timers",
              "Visible timers for time in raid plus scav cooldowns so you can plan the next run.",
            )}
          </li>
        </ul>
      </section>

      <section id="download">
        <h2>{t("Download")}</h2>
        <ol>
          <li>
            {t(
              "tarkov-monitor-download-1",
              "Grab the latest TarkovMonitor.zip release from GitHub.",
            )}
          </li>
          <li>
            {t(
              "tarkov-monitor-download-2",
              "Extract the archive anywhere on your PC.",
            )}
          </li>
          <li>
            {t(
              "tarkov-monitor-download-3",
              "Run TarkovMonitor.exe and keep it open while you play.",
            )}
          </li>
        </ol>
      </section>

      <section id="community-support">
        <h2>{t("Community support")}</h2>
        <p>
          {t(
            "tarkov-monitor-community",
            "Have questions or want to chat with other users? Join the Discord server for tips, troubleshooting, and feature discussions.",
          )}
        </p>
        <a
          className="tool-cta secondary"
          href={DISCORD_URL}
          target="_blank"
          rel="noreferrer"
        >
          {t("Join the Discord")}
        </a>
      </section>

      <section id="security-note">
        <h2>{t("Security")}</h2>
        <p>
          {t(
            "tarkov-monitor-security",
            "TarkovMonitor is not a cheat. It only reads the Escape From Tarkov log files stored on your PC and never modifies the game or injects code.",
          )}
        </p>
      </section>
      {monitorContributors.length > 0 && (
        <section
          className="project-contributors-block"
          aria-label={t("Contributors")}
        >
          <h2>{t("Contributors")}</h2>
          <div className="contributors-grid">
            <Contributors size={48} data={monitorContributors} />
          </div>
        </section>
      )}
    </div>,
  ];
}

export default TarkovMonitorPage;
