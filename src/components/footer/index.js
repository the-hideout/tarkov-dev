import { useTranslation } from 'react-i18next';

import Supporter from '../supporter';
import {ReactComponent as GithubIcon} from '../supporter/Github.svg';
import {ReactComponent as DiscordIcon} from '../supporter/Discord.svg';

import './index.css';

function Footer() {
    const { t } = useTranslation();

    return <div
        className = {'footer-wrapper'}
    >
        <div
            className = 'footer-section-wrapper about-section-wrapper'
        >
            <h3>
                {t('Tarkov Tools')}
            </h3>
            <p>
                {t('The whole platform is open source, and the code is available on')} <a href="https://github.com/kokarn/tarkov-tools">
                    <GithubIcon /> GitHub
                </a>
                <a
                    href="https://github.com/kokarn/tarkov-tools/actions"
                >
                    <img
                        alt="Build Status"
                        src="https://img.shields.io/github/workflow/status/kokarn/tarkov-tools/Deploy?style=flat-square"
                    />
                </a>
            </p>
            <p>
                {t('If you wanna have a chat, ask questions or request features, we have a')} <a href="https://discord.gg/B2xM8WZyVv">
                    <DiscordIcon /> Discord server
                </a>
            </p>
        </div>
        <div
            className = 'footer-section-wrapper'
        >
            <h3>
                {t('Supporters')}
            </h3>
            <p
                className = 'become-supporter-wrapper'
            >
                <a
                    href="https://www.patreon.com/bePatron?u=26501878"
                    data-patreon-widget-type="become-patron-button"
                >
                    {t('Become a Patron!')}
                </a>
            </p>
            <Supporter
                name = {'The Hideout'}
                patreon
                link = 'https://play.google.com/store/apps/details?id=com.austinhodak.thehideout'
            />
            <Supporter
                name = {'KilobyteKeith'}
                patreon
            />
            <Supporter
                name = {'teebles'}
                patreon
            />
            <Supporter
                name = {'Trontus'}
                patreon
            />
            <Supporter
                name = {'Thaddeus'}
                patreon
                github
                link = 'https://tarkovtracker.io/'
            />
            <Supporter
                name = {'RatScanner'}
                patreon
                link = 'https://ratscanner.com/'
            />
            <Supporter
                name = {'Razzmatazz'}
                patreon
                github
                link = 'https://tarkov.guru/'
            />
            <Supporter
                name = {'tarkov-gunsmith'}
                patreon
                link = 'https://tarkov-gunsmith.com/'
            />
            <Supporter
                name = {'Veldmuus'}
                patreon
            />
            <Supporter
                name = {'Gyran'}
                patreon
                github
            />
            <Supporter
                name = {'MypowerHD'}
                patreon
            />
            <Supporter
                name = {'lipowskm'}
                github
            />
            <Supporter
                name = {'Hiltuska'}
                github
            />
        </div>
        <div
            className = 'footer-section-wrapper'
        >
            <h3>
                {t('Resources')}
            </h3>
            <p>
                <a href="https://tarkov-tools.com/___graphql">Tarkov Tools API</a>
            </p>
            <p>
                <a
                    href="https://developertracker.com/escape-from-tarkov/"
                >
                    Escape from Tarkov Dev tracker
                </a>
            </p>
            <p>
                <a href="https://tarkovbitcoinprice.com/">
                    Tarkov Bitcoin Price
                </a>
            </p>
            <p>
                <a href="https://github.com/RatScanner/RatScanner">
                    RatScanner
                </a>
            </p>
            <p>
                <a href="https://tarkovtracker.io/">
                    TarkovTracker
                </a>
            </p>
        </div>
        <div
            className = 'copyright-wrapper'
        >
            Game content and materials are trademarks and copyrights of Battlestate Games and its licensors. All rights reserved.
        </div>
    </div>;
};

export default Footer;
