import { Trans, useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { ReactComponent as DiscordIcon } from "#src/images/Discord.svg";
import { ReactComponent as GithubIcon } from "#src/images/Github.svg";
import { ReactComponent as XIcon } from "#src/images/X.svg";

import Contributors from "#src/components/contributors/index.jsx";
import OpenCollectiveButton from "#src/components/open-collective-button/index.jsx";
import UkraineButton from "#src/components/ukraine-button/index.jsx";

import "./index.css";

function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  if (location.pathname.startsWith("/map/")) {
    return "";
  }

  return (
    <div className={"footer-wrapper"}>
      <div className="footer-section-wrapper about-section-wrapper">
        <h3>{t("Tarkov.dev")}</h3>
        <Trans i18nKey={"about-open-source-p"}>
          <p>
            The whole platform is open source and focused around developers. All
            code is available on{" "}
            <a
              href="https://github.com/the-hideout/tarkov-dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon /> GitHub
            </a>
            .
          </p>
        </Trans>
        <Trans i18nKey={"about-discord-p"}>
          <p>
            If you wanna have a chat, ask questions or request features, we have
            a{" "}
            <a
              href="https://discord.gg/WwTvNe356u"
              target="_blank"
              rel="noopener noreferrer"
            >
              <DiscordIcon /> Discord
            </a>{" "}
            server.
          </p>
        </Trans>
        <Trans i18nKey={"about-x-p"}>
          <p>
            Follow us on{" "}
            <a
              href="https://x.com/tarkov_dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              <XIcon /> X
            </a>{" "}
            for all the latest updates.
          </p>
        </Trans>
        <p>
          <Link to="/about">{t("About")} tarkov.dev</Link>
        </p>
        <h3>{t("Contributors")}</h3>
        <p>
          {t(
            "Massive thanks to all the people who help build and maintain this project!",
          )}
        </p>
        <p>{t("Made with ❤️ by:")}</p>
        <Contributors size={20} />
      </div>
      <div className="footer-section-wrapper">
        <h3>{t("Supporters")}</h3>
        <Trans i18nKey={"about-support-ukraine-p"}>
          <p>
            We encourage everyone who can to donate to support the people of
            Ukraine using the button below.
          </p>
        </Trans>
        <UkraineButton large={true} linkStyle={{}} />
        <Trans i18nKey={"about-support-collective-p"}>
          <p>
            If you'd also like to support this project, you can make a donation
            and/or become a backer on{" "}
            <a
              href="https://opencollective.com/tarkov-dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Collective
            </a>
            .
          </p>
        </Trans>
        <OpenCollectiveButton large={true} linkStyle={{}} />
        <h3>{t("Item Data")}</h3>
        <p>
          {t("Fresh EFT data courtesy of")}{" "}
          <a
            href="https://tarkov-changes.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Tarkov-Changes</span>
          </a>
        </p>
        <p>
          {t("Additional data courtesy of")}{" "}
          <a
            href="https://www.sp-tarkov.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>SPT</span>
          </a>
        </p>
        <h3>{t("Map Icons")}</h3>
        <p>
          {t("Map marker icons by")}{" "}
          <a
            href="https://escapefromtarkov.fandom.com/wiki/Escape_from_Tarkov_Wiki"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{t("The Official Escape From Tarkov Wiki")}</span>
          </a>
        </p>
      </div>
      <div className="footer-section-wrapper">
        <h3>{t("Resources")}</h3>
        <p>
          <Link to={"/api/"}>{t("Tarkov.dev API")}</Link>
        </p>
        <p>
          <a
            href="https://github.com/the-hideout/TarkovMonitor"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tarkov Monitor
          </a>
        </p>
        <p>
          <Link to={"/moobot"}>
            {t("{{bot}} integration", { bot: "Moobot" })}
          </Link>
        </p>
        <p>
          <Link to={"/nightbot/"}>
            {t("{{bot}} integration", { bot: "Nightbot" })}
          </Link>
        </p>
        <p>
          <Link to={"/streamelements/"}>
            {t("{{bot}} integration", { bot: "StreamElements" })}
          </Link>
        </p>
        <p>
          <a
            href={
              "https://discord.com/api/oauth2/authorize?client_id=955521336904667227&permissions=309237664832&scope=bot%20applications.commands"
            }
          >
            {t("Discord bot for your Discord")}
          </a>
        </p>
        <h3>{t("External resources")}</h3>
        <p>
          <a
            href="https://tarkovtracker.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            TarkovTracker.io
          </a>
        </p>
        <p>
          <a
            href="https://github.com/RatScanner/RatScanner"
            target="_blank"
            rel="noopener noreferrer"
          >
            RatScanner
          </a>
        </p>
        <p>
          <iframe
            className="discord"
            title="discord-iframe"
            src="https://discord.com/widget?id=956236955815907388&theme=dark"
            loading="lazy"
            // @ts-ignore
            allowtransparency="true"
            frameBorder="0"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          ></iframe>
        </p>
      </div>
      <div className="copyright-wrapper">
        {t(
          "Tarkov.dev is a fork of the now shut-down tarkov-tools.com | Big thanks to kokarn for all his work building Tarkov Tools and the community around it.",
        )}
      </div>
      <div className="copyright-wrapper">
        {t(
          "Game content and materials are trademarks and copyrights of Battlestate Games and its licensors. All rights reserved.",
        )}
      </div>
      <div className="copyright-wrapper">
        {t("version")} {": "}
        {}
        <a
          href={`https://github.com/the-hideout/tarkov-dev/commits/${__COMMIT_HASH__}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {__COMMIT_HASH__}
        </a>
      </div>
    </div>
  );
}

export default Footer;
