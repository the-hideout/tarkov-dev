import { Trans, useTranslation } from 'react-i18next';

import SEO from '../../components/SEO.jsx';

import './index.css';

const RELEASE_URL = 'https://github.com/the-hideout/TarkovMonitor/releases/latest';
const REPOSITORY_URL = 'https://github.com/the-hideout/TarkovMonitor';
const DISCORD_URL = 'https://discord.gg/XPAsKGHSzH';
const TARKOV_TRACKER_URL = 'https://tarkovtracker.io';

function TarkovMonitorPage() {
    const { t } = useTranslation();

    return [
        <SEO 
            title={`${t('TarkovMonitor')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t(
                'tarkov-monitor-page-description',
                'Learn how to install TarkovMonitor, connect it to TarkovTracker, and use it to control Tarkov.dev maps.',
            )}
            key="seo-wrapper"
        />,
        <div className="page-wrapper tool-detail-page tarkov-monitor-page" key="tarkov-monitor-wrapper">
            <section className="tool-hero">
                <div>
                    <p className="eyebrow">{t('Companion app')}</p>
                    <h1>{t('TarkovMonitor')}</h1>
                    <Trans i18nKey="tarkov-monitor-hero">
                        <p>
                            TarkovMonitor watches your Escape from Tarkov logs to trigger audio alerts, capture queue times,
                            and sync your quest progress with TarkovTracker while also unlocking Tarkov.dev map integrations.
                        </p>
                    </Trans>
                    <div className="tool-cta-group">
                        <a className="tool-cta primary" href={RELEASE_URL} target="_blank" rel="noreferrer">
                            {t('Download latest release')}
                        </a>
                        <a className="tool-cta secondary" href={REPOSITORY_URL} target="_blank" rel="noreferrer">
                            {t('View on GitHub')}
                        </a>
                        <a className="tool-cta secondary" href={DISCORD_URL} target="_blank" rel="noreferrer">
                            {t('Join the community')}
                        </a>
                    </div>
                </div>
                <figure>
                    <img
                        src={`${process.env.PUBLIC_URL}/images/other-tools/tarkov-monitor-overview.png`}
                        alt={t('Screenshot of TarkovMonitor showing timers and integrations')}
                        loading="lazy"
                    />
                    <figcaption>{t('Visual timers, raid state, and integration health in TarkovMonitor.')}</figcaption>
                </figure>
            </section>

            <section className="tool-card-grid" aria-label={t('Feature highlights')}>
                <article>
                    <h2>{t('Audio & visual alerts')}</h2>
                    <ul>
                        <li>{t('Match found and raid start notifications')}</li>
                        <li>{t('Run-through, scav timer, and air filter reminders')}</li>
                        <li>{t('Customizable sounds for every trigger')}</li>
                    </ul>
                </article>
                <article>
                    <h2>{t('Map + remote control')}</h2>
                    <ul>
                        <li>{t('Automatically opens the correct Tarkov.dev map as you load a raid')}</li>
                        <li>{t('Drop screenshots to plot your position and rotation on interactive maps')}</li>
                        <li>{t('Submit anonymous queue times to help the community')}</li>
                    </ul>
                </article>
                <article>
                    <h2>{t('Quest automation')}</h2>
                    <ul>
                        <li>{t('Mark quests complete on TarkovTracker the moment they finish')}</li>
                        <li>{t('Optional past-log reprocessing to backfill wiped progress')}</li>
                        <li>{t('Keep everything local—only your API token leaves the machine')}</li>
                    </ul>
                </article>
            </section>

            <section id="installation">
                <h2>{t('Installation')}</h2>
                <Trans i18nKey="tarkov-monitor-installation">
                    <p>
                        Head to the <a href={RELEASE_URL} target="_blank" rel="noreferrer">latest release</a> and download the <code>TarkovMonitor.zip</code> asset.
                        Extract the archive anywhere on your PC and run the bundled <code>TarkovMonitor.exe</code>.
                        The application uses Microsoft&apos;s WebView2 runtime. If Windows reports that WebView2 is missing, install it from Microsoft before relaunching.
                    </p>
                </Trans>
                <figure>
                    <img
                        src={`${process.env.PUBLIC_URL}/images/other-tools/tarkov-monitor-release.png`}
                        alt={t('Screenshot of the TarkovMonitor GitHub release assets')}
                        loading="lazy"
                    />
                    <figcaption>{t('Download the ZIP asset from the Releases page, then extract and run the EXE.')}</figcaption>
                </figure>
            </section>

            <section id="tarkovtracker-integration">
                <h2>{t('Quest tracking with TarkovTracker')}</h2>
                <Trans i18nKey="tarkov-monitor-tracker">
                    <p>
                        Log in to <a href={TARKOV_TRACKER_URL} target="_blank" rel="noreferrer">TarkovTracker</a> and open the settings page.
                        Create an API token that can <strong>get progression</strong> and <strong>write progression</strong>,
                        copy it, and paste it into the TarkovMonitor settings panel. Use the <em>Test token</em> button—once it passes,
                        TarkovMonitor will mark quests complete as soon as the corresponding log entries appear.
                    </p>
                </Trans>
                <p>
                    {t('Need to sync older quests? Use the “Read past logs” action inside TarkovMonitor to replay previous wipe logs and backfill progress.')}
                </p>
            </section>

            <section id="website-integration">
                <h2>{t('Tarkov.dev website integration')}</h2>
                <Trans i18nKey="tarkov-monitor-remote">
                    <p>
                        Open Tarkov.dev in the browser you want to control and click the <strong>Click to connect</strong> badge in the lower corner.
                        Copy the <strong>ID for remote control</strong> value and paste it into the TarkovMonitor Remote ID field.
                        When TarkovMonitor is running it will switch the controlled browser to the map you are queueing for and,
                        after you capture a screenshot, plot your live position directly on the map.
                    </p>
                </Trans>
                <p>
                    {t('If you reload Tarkov.dev, repeat the connect flow so the app can keep driving the site.') }
                </p>
            </section>

            <section>
                <h2>{t('FAQ')}</h2>
                <div className="faq-grid">
                    <details>
                        <summary>{t('Is TarkovMonitor a cheat?')}</summary>
                        <p>
                            {t('No. The app passively reads Battlestate log files that already live on your PC. Logs are not updated mid-raid, so TarkovMonitor can only react to events after they occur.')}
                        </p>
                    </details>
                    <details>
                        <summary>{t('What information ever leaves my machine?')}</summary>
                        <p>
                            {t('Only the data required for the features you enable (for example, queue durations, TarkovTracker API calls, or remote-control actions). All statistics the app shows stay on disk locally.')}
                        </p>
                    </details>
                    <details>
                        <summary>{t('TarkovMonitor is running but nothing happens—why?')}</summary>
                        <p>
                            {t('The app must be open before a log line is written. Start TarkovMonitor before you enter the queue so it can hear match events.')}
                        </p>
                    </details>
                </div>
            </section>
        </div>,
    ];
}

export default TarkovMonitorPage;
