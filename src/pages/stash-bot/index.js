import { Trans, useTranslation } from 'react-i18next';

import Contributors from '../../components/contributors/index.jsx';
import SEO from '../../components/SEO.jsx';
import useRepositoryContributors from '../../hooks/useRepositoryContributors.js';

import '../tarkov-monitor/index.css';
import './index.css';

const INVITE_URL = 'https://discord.com/api/oauth2/authorize?client_id=955521336904667227&permissions=309237664832&scope=bot%20applications.commands';
const REPOSITORY_URL = 'https://github.com/the-hideout/stash';
const ISSUE_URL = 'https://github.com/the-hideout/stash/issues';

const popularCommands = [
    { command: '/help', example: '/help or help <command>', description: 'The help command to view all available commands' },
    { command: '/about', example: '-', description: 'View details about the bot' },
    { command: '/ammo', example: '/ammo ammo_type: 5.45x39mm', description: 'Get a sorted ammo table for a certain ammo type' },
    { command: '/barter', example: '/barter name: <item>', description: 'Check barter details for an item' },
    { command: '/boss', example: '-', description: 'Get detailed information about a boss' },
    { command: '/changes', example: '-', description: 'Get the latest game changes from tarkov-changes.com' },
    { command: '/craft', example: '/craft name: <item>', description: 'Check crafting details for an item' },
    { command: '/gamemode', example: '-', description: 'Set the game mode (regular, PVE) for bot responses' },
    { command: '/goons', example: '-', description: 'Check or report the location of the Goons' },
    { command: '/invite', example: '-', description: 'Get a Discord invite link for the bot to join it to another server' },
    { command: '/issue', example: '/issue message: <text>', description: 'Report an issue with the bot' },
    { command: '/item', example: '-', description: 'Get price, craft, barter, etc. information about an item' },
    { command: '/key', example: '-', description: "Get a key's price and maps it is used on" },
    { command: '/map', example: '/map woods', description: 'View a map and some general info about it' },
    { command: '/patchnotes', example: '-', description: 'Get the latest official patchnotes for EFT' },
    { command: '/player', example: '-', description: 'Get player profile information' },
    { command: '/price', example: '/price name: <item>', description: "Get a detailed output on the price of an item, its price tier, and more!" },
    { command: '/progress', example: '-', description: 'Manage your customized hideout and trader progress' },
    { command: '/quest', example: '-', description: 'Get detailed information about a quest' },
    { command: '/restock', example: '-', description: 'Show or set alerts for trader restock timers' },
    { command: '/roulette', example: '-', description: 'Play a game of roulette to determine how you play your next raid' },
    { command: '/status', example: '-', description: 'Get the game/server/website status of Escape from Tarkov' },
    { command: '/stim', example: '-', description: 'Get information about a in-game stim' },
    { command: '/tier', example: '-', description: 'Show the criteria for loot tiers' },
    { command: '/uptime', example: '-', description: "Get the bot's uptime" },
];

function StashBotPage() {
    const { t } = useTranslation();
    const { contributors: stashContributors } = useRepositoryContributors('the-hideout/stash');

    return [
        <SEO 
            title={`${t('Stash Discord Bot')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('stash-page-description', 'Invite the Stash Discord bot, explore its commands, and see how it can help your community.')}
            key="seo-wrapper"
        />,
        <div className="page-wrapper tool-detail-page stash-page" key="stash-wrapper">
            <section className="tool-hero">
                <div>
                    <p className="eyebrow">{t('Discord companion')}</p>
                    <h1>{t('Stash Discord Bot')}</h1>
                    <p>
                        {t(
                            'stash-hero',
                            'Stash pipes the full Tarkov.dev dataset into Discord so your community can check prices, quest progress, hideout timers, and more without leaving chat.',
                        )}
                    </p>
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
                <p>
                    {t(
                        'stash-tech-note',
                        'Need developer-focused setup guides or self-hosting instructions? Review the README on GitHub for the latest technical documentation.',
                    )}
                </p>
            </section>
            {stashContributors.length > 0 && (
                <section className="project-contributors-block" aria-label={t('Contributors')}>
                    <h2>{t('Contributors')}</h2>
                    <div className="contributors-grid">
                        <Contributors size={48} data={stashContributors} />
                    </div>
                </section>
            )}
        </div>,
    ];
}

export default StashBotPage;
