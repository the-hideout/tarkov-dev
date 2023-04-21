import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ReactComponent as GithubIcon } from '../supporter/Github.svg';
import { ReactComponent as DiscordIcon } from '../supporter/Discord.svg';
import { ReactComponent as TwitterIcon } from '../supporter/Twitter.svg';

import './index.css';
import UkraineButton from '../ukraine-button';
import OpenCollectiveButton from '../open-collective-button';

import rawVersion from '../../data/version.json';
import Contributors from '../contributors';

const version = rawVersion.version.slice(0, 7);

function Footer() {
    const { t } = useTranslation();

    return (
        <div className={'footer-wrapper'}>
            <div className="footer-section-wrapper about-section-wrapper">
                <h3>{t('Tarkov.dev')}</h3>
                <Trans i18nKey={'about-open-source-p'}>
                    <p>
                        The whole platform is open source and focused around developers. All code is available on <a href="https://github.com/the-hideout/tarkov-dev" target="_blank" rel="noopener noreferrer"><GithubIcon /> GitHub</a>.
                    </p>
                </Trans>
                <Trans i18nKey={'about-discord-p'}>
                    <p>
                        If you wanna have a chat, ask questions or request features, we have a <a href="https://discord.gg/XPAsKGHSzH" target="_blank" rel="noopener noreferrer"><DiscordIcon /> Discord</a> server.
                    </p>
                </Trans>
                <Trans i18nKey={'about-twitter-p'}>
                    <p>
                        Follow us on <a href="https://twitter.com/tarkov_dev" target="_blank" rel="noopener noreferrer"><TwitterIcon /> Twitter</a> for all the latest updates.
                    </p>
                </Trans>
                <p>
                    <Link to="/about">{t('About')} tarkov.dev</Link>
                </p>
                <h3>{t('Contributors')}</h3>
                <p>{t('Massive thanks to all the people who help build and maintain this project!')}</p>
                <p>{t('Made with ❤️ by:')}</p>
                <Contributors quality={20} />
            </div>
            <div className="footer-section-wrapper">
                <h3>{t('Supporters')}</h3>
                <Trans i18nKey={'about-support-ukraine-p'}>
                <p>
                    We encourage everyone who can to donate to support the people of Ukraine using the button below.
                </p>
                </Trans>
                <UkraineButton
                    linkStyle={{
                        width: '100%',
                    }}
                />
                <Trans i18nKey={'about-support-collective-p'}>
                <p>
                    If you'd also like to support this project, you can make a donation and/or become a backer on <a href="https://opencollective.com/tarkov-dev" target="_blank" rel="noopener noreferrer">Open Collective</a>.
                </p>
                </Trans>
                <OpenCollectiveButton />
                <h3>{t('Item Data')}</h3>
                <p>
                    {t(
                        'Fresh data on EFT item attribtues and hideout crafts courtesy of',
                    )}{' '}
                    <a href="https://tarkov-changes.com" target="_blank" rel="noopener noreferrer">
                        <span>Tarkov-Changes</span>
                    </a>
                </p>
                <p>
                    {t('Additional data courtesy of')} {' '}
                    <a href="https://www.sp-tarkov.com/" target="_blank" rel="noopener noreferrer">
                        <span>SPT-AKI</span>
                    </a>
                </p>

                {/*{supporters.map((supporter) => {*/}
                {/*    if (supporter.name === 'kokarn') {*/}
                {/*        return null;*/}
                {/*    }*/}

                {/*    if (!supporter.patreon) {*/}
                {/*        return null;*/}
                {/*    }*/}

                {/*    return (*/}
                {/*        <Supporter*/}
                {/*            key={`supporter-${supporter.name}`}*/}
                {/*            name={supporter.name}*/}
                {/*            github={supporter.github}*/}
                {/*            patreon={supporter.patreon}*/}
                {/*            link={supporter.link}*/}
                {/*        />*/}
                {/*    );*/}
                {/*})}*/}
            </div>
            <div className="footer-section-wrapper">
                <h3>{t('Resources')}</h3>
                <p>
                    <Link to={'/api/'}>{t('Tarkov.dev API')}</Link>
                </p>
                <p>
                    <Link to={'/nightbot/'}>{t('{{bot}} integration', { bot: 'Nightbot' })}</Link>
                </p>
                <p>
                    <Link to={'/streamelements/'}>{t('{{bot}} integration', { bot: 'StreamElements' })}</Link>
                </p>
                <p>
                    <Link to={'/moobot'}>{t('{{bot}} integration', { bot: 'Moobot' })}</Link>
                </p>
                {/*<p>*/}
                {/*    <Link to={'/api-users/'}>{t('API Users')}</Link>*/}
                {/*</p>*/}
                <p>
                    <a
                        href={
                            'https://discord.com/api/oauth2/authorize?client_id=955521336904667227&permissions=309237664832&scope=bot%20applications.commands'
                        }
                    >
                        {t('Discord bot for your Discord')}
                    </a>
                </p>
                <h3>{t('External resources')}</h3>
                <p>
                    <a href="https://developertracker.com/escape-from-tarkov/" target="_blank" rel="noopener noreferrer">
                        Escape from Tarkov Dev tracker
                    </a>
                </p>
                <p>
                    <a href="https://github.com/RatScanner/RatScanner" target="_blank" rel="noopener noreferrer">
                        RatScanner
                    </a>
                </p>
                <p>
                    <a href="https://tarkovtracker.io/" target="_blank" rel="noopener noreferrer">TarkovTracker</a>
                </p>
                <p>
                    <a className="stellate-wrapper" href="https://stellate.co/?ref=powered-by" target="_blank" rel="noopener noreferrer">
                        <img src={`${process.env.PUBLIC_URL}/images/stellate-light.svg`} alt="Powered by Stellate, the GraphQL Edge Cache" width={200} />
                    </a>
                </p>
                <p>
                    <iframe className='discord' title="discord-iframe" src="https://discord.com/widget?id=956236955815907388&theme=dark" loading="lazy" allowtransparency="true" frameBorder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
                </p>
            </div>
            <div className="copyright-wrapper">
                {t(
                    'Tarkov.dev is a fork of the now shut-down tarkov-tools.com | Big thanks to kokarn for all his work building Tarkov Tools and the community around it.',
                )}
            </div>
            <div className="copyright-wrapper">
                {t(
                    'Game content and materials are trademarks and copyrights of Battlestate Games and its licensors. All rights reserved.',
                )}
            </div>
            <div className="copyright-wrapper">
                {t('version')} {': '}
                <a href="https://github.com/the-hideout/tarkov-dev/commits/main" target="_blank" rel="noopener noreferrer">{version}</a>
            </div>
        </div>
    );
}

export default Footer;
