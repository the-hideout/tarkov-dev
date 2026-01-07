import { Icon } from "@mdi/react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { mdiTools, mdiTextSearch, mdiRobot } from "@mdi/js";

import SEO from "../../components/SEO.jsx";

import Contributors from "../../components/contributors/index.jsx";
import useRepositoryContributors from "../../hooks/useRepositoryContributors.js";

import "./index.css";

function OtherTools() {
  const { t } = useTranslation();
  const { contributors: monitorContributors } = useRepositoryContributors(
    "the-hideout/TarkovMonitor",
  );
  const { contributors: stashContributors } =
    useRepositoryContributors("the-hideout/stash");

  const cards = [
    {
      id: "tarkov-monitor",
      title: "TarkovMonitor",
      icon: mdiTextSearch,
      description: t(
        "card-tarkov-monitor-desc",
        "Automate TarkovTracker progress, capture queue timers, and drive Tarkov.dev maps with a single Windows companion app.",
      ),
      screenshot: `${process.env.PUBLIC_URL}/images/other-tools/tarkov-monitor-overview.png`,
      ctaLabel: t("Read more"),
      ctaLink: "/tarkov-monitor",
      repository: "the-hideout/TarkovMonitor",
      secondaryAction: {
        label: t("Download"),
        href: "https://github.com/the-hideout/TarkovMonitor/releases/latest",
      },
      contributors: monitorContributors,
    },
    {
      id: "stash",
      title: t("Stash Discord Bot"),
      icon: mdiRobot,
      description: t(
        "card-stash-desc",
        "Slash commands for price checks, quest help, hideout progress, and restock timers sourced directly from Tarkov.dev.",
      ),
      screenshot: "https://avatars.githubusercontent.com/u/101240793?s=200&v=4",
      ctaLabel: t("Read more"),
      ctaLink: "/stash-discord-bot",
      repository: "the-hideout/stash",
      secondaryAction: {
        label: t("Invite now"),
        href: "https://discord.com/api/oauth2/authorize?client_id=955521336904667227&permissions=309237664832&scope=bot%20applications.commands",
      },
      contributors: stashContributors,
    },
  ];

  return [
    <SEO
      title={`${t("More Tools")} - ${t("Escape from Tarkov")} - ${t("Tarkov.dev")}`}
      description={t(
        "other-tools-page-description",
        "Discover companion apps built by the Tarkov.dev team, including TarkovMonitor and the Stash Discord bot.",
      )}
      key="seo-wrapper"
    />,
    <div
      className="page-wrapper other-tools-page"
      key="other-tools-page-wrapper"
    >
      <h1>
        <Icon path={mdiTools} size={1.5} className="icon-with-text" />
        {t("More Tools")}
      </h1>
      {/* prettier-ignore */}
      <Trans i18nKey="other-tools-body">
        <p className="page-intro">
          Tarkov.dev is more than a website. These tools extend your raids,
          streams, and Discord communities using the same open-source data set.
          Dive into each tool to see screenshots, setup guides, and support
          links.
        </p>
      </Trans>
      <div className="tool-grid">
        {cards.map((card) => (
          <article className="tool-card" key={card.id} id={card.id}>
            <div className="tool-card-header">
              <Icon path={card.icon} size={1.2} className="icon-with-text" />
              <div>
                <h2>{card.title}</h2>
              </div>
            </div>
            <p>{card.description}</p>
            <img
              src={card.screenshot}
              alt={`${card.title} screenshot`}
              loading="lazy"
            />
            <div className="tool-card-actions">
              <Link to={card.ctaLink} className="tool-link">
                {card.ctaLabel}
              </Link>
              {card.secondaryAction && (
                <a
                  href={card.secondaryAction.href}
                  className="tool-link secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  {card.secondaryAction.label}
                </a>
              )}
            </div>
            {card.contributors && card.contributors.length > 0 && (
              <div className="tool-card-contributors">
                <p>{t("Contributors")}</p>
                <Contributors size={28} stack data={card.contributors} />
              </div>
            )}
          </article>
        ))}
      </div>
    </div>,
  ];
}

export default OtherTools;
