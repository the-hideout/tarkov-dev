import { Trans, useTranslation } from 'react-i18next';

import SEO from '../../components/SEO.jsx';

import '../tarkov-monitor/index.css';
import './index.css';

const INVITE_URL = 'https://discord.com/api/oauth2/authorize?client_id=955521336904667227&permissions=309237664832&scope=bot%20applications.commands';
const REPOSITORY_URL = 'https://github.com/the-hideout/stash';
const ISSUE_URL = 'https://github.com/the-hideout/stash/issues';

const popularCommands = [
    {
        command: '/price',
        example: '/price name: LedX',
        description: 'Get instant price, tier, and trader data for any item.',
    },
    {
        command: '/quest',
        example: '/quest name: Spa Tour',
        description: 'View requirements, rewards, and needed items for a task.',
    },
    {
        command: '/ammo',
        example: '/ammo ammo_type: 5.45x39mm',
        description: 'Pull a filtered ammo table matching the Tarkov.dev data.',
    },
    {
        command: '/goons',
        example: '/goons',
        description: 'Report or check the latest community sightings.',
    },
    {
        command: '/map',
        example: '/map woods',
        description: 'Send a high-resolution map preview directly to chat.',
    },
];

function StashBotPage() {
    const { t } = useTranslation();

    return [
        <SEO 
            title={`${t('Stash Discord Bot')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('stash-page-description', 'Invite the official Tarkov.dev Discord bot, explore its commands, and learn how to self-host it.')}
            key="seo-wrapper"
        />,
        <div className="page-wrapper tool-detail-page stash-page" key="stash-wrapper">
            <section className="tool-hero">
                <div>
                    <p className="eyebrow">{t('Discord companion')}</p>
                    <h1>{t('Stash Discord Bot')}</h1>
                    <Trans i18nKey="stash-hero">
                        <p>
                            Stash pipes the full Tarkov.dev dataset into Discord so your community can check prices,
                            quest progress, hideout timers, and more without leaving chat.
                        </p>
                    </Trans>
                    <div className="tool-cta-group">
                        <a className="tool-cta primary" href={INVITE_URL} target="_blank" rel="noreferrer">
                            {t('Invite Stash')}
                        </a>
                        <a className="tool-cta secondary" href={REPOSITORY_URL} target="_blank" rel="noreferrer">
                            {t('View on GitHub')}
                        </a>
                        <a className="tool-cta secondary" href={ISSUE_URL} target="_blank" rel="noreferrer">
                            {t('Report an issue')}
                        </a>
                    </div>
                </div>
                <figure>
                    <img
                        src={`${process.env.PUBLIC_URL}/images/api-users/stash.png`}
                        alt={t('Screenshots of the Stash Discord bot responding to commands')}
                        loading="lazy"
                    />
                    <figcaption>{t('Deliver Tarkov data straight into your Discord channels.')}</figcaption>
                </figure>
            </section>

            <section className="tool-card-grid" aria-label={t('Highlights')}>
                <article>
                    <h2>{t('Item intelligence')}</h2>
                    <ul>
                        <li>{t('Instant prices with flea, trader, and craft context.')}</li>
                        <li>{t('Craft/barter lookups reuse Tarkov.dev profitability data.')}</li>
                        <li>{t('Toggle PVE or PMC game modes to match your server rules.')}</li>
                    </ul>
                </article>
                <article>
                    <h2>{t('Progress tracking')}</h2>
                    <ul>
                        <li>{t('Quest command lists requirements, turn-ins, and rewards.')}</li>
                        <li>{t('Progress command mirrors the hideout and trader upgrades you have saved on Tarkov.dev.')}</li>
                        <li>{t('Restock and status alerts keep everyone informed between raids.')}</li>
                    </ul>
                </article>
                <article>
                    <h2>{t('Community tools')}</h2>
                    <ul>
                        <li>{t('Goons tracker for spotting the Rogue Boss trio.')}</li>
                        <li>{t('Roulette mini-game for fun raid modifiers.')}</li>
                        <li>{t('Slash commands, autocomplete, and localized responses.')}</li>
                    </ul>
                </article>
            </section>

            <section id="command-overview">
                <h2>{t('Frequently used commands')}</h2>
                <p>
                    {t('Stash exposes dozens of slash commands. Here are a few that most servers rely on:')}
                </p>
                <div className="scroll-table">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('Command')}</th>
                                <th>{t('Example')}</th>
                                <th>{t('Description')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {popularCommands.map((command) => (
                                <tr key={command.command}>
                                    <td>{command.command}</td>
                                    <td>
                                        <code>{command.example}</code>
                                    </td>
                                    <td>{t(command.description)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section id="self-hosting">
                <h2>{t('Self-host or contribute')}</h2>
                <Trans i18nKey="stash-self-host">
                    <p>
                        Want your own instance? Clone the repository, duplicate the <code>config-dev.example.json</code> file to <code>config-dev.json</code>,
                        and fill in your Discord application details. Create an application + bot user inside the Discord Developer Portal,
                        copy the client ID into <code>clientId</code>, your test guild ID into <code>guildId</code>, and paste the bot token into both the config and <code>.env</code>.
                    </p>
                </Trans>
                <figure>
                    <img
                        src={`${process.env.PUBLIC_URL}/images/other-tools/stash-app-setup.png`}
                        alt={t('Screenshot showing how to create a Discord application for Stash')}
                        loading="lazy"
                    />
                    <figcaption>{t('Create a Discord application, then grab the application ID for config-dev.json.')}</figcaption>
                </figure>
                <Trans i18nKey="stash-env">
                    <p>
                        The <code>.env</code> file needs your <code>DISCORD_API_TOKEN</code>, <code>ADMIN_ID</code>, and (optionally) a <code>WEBHOOK_URL</code> for aggregating error reports.
                        Once configured, run <code>npm install</code>, deploy slash commands with <code>npm run dev-commands</code>, and start the bot locally using <code>npm run dev</code>.
                        Docker users can leverage the included <code>docker-compose.yml</code> for one-command deployments.
                    </p>
                </Trans>
                <figure>
                    <img
                        src={`${process.env.PUBLIC_URL}/images/other-tools/stash-bot-token.png`}
                        alt={t('Discord screenshot showing how to copy a bot token')}
                        loading="lazy"
                    />
                    <figcaption>{t('Copy the bot token once—store it safely in your .env file.')}</figcaption>
                </figure>
            </section>

            <section id="support">
                <h2>{t('Support & feedback')}</h2>
                <Trans i18nKey="stash-support">
                    <p>
                        Stash is maintained by the Tarkov.dev team. Bugs or feature ideas? Open an issue on <a href={ISSUE_URL} target="_blank" rel="noreferrer">GitHub</a> or chat with the developers inside the <a href="https://discord.gg/WwTvNe356u" target="_blank" rel="noreferrer">Tarkov.dev Discord</a>.
                        If you are syncing Tarkov.dev and the bot data, include screenshots plus reproduction steps so we can help faster.
                    </p>
                </Trans>
                <p>
                    {t('Need the privacy policy or terms of service for your server security review? They live inside the /assets folder of the repository and stay up-to-date with every release.')}
                </p>
            </section>
        </div>,
    ];
}

export default StashBotPage;
