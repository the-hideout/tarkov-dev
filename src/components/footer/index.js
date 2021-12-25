import { useTranslation } from 'react-i18next';
import {
    Link,
} from "react-router-dom";

import Supporter from '../supporter';
import {ReactComponent as GithubIcon} from '../supporter/Github.svg';
import {ReactComponent as DiscordIcon} from '../supporter/Discord.svg';
import PatreonButton from '../patreon-button';
import supporters from '../../supporters';

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
            </p>
            <p>
                {t('If you wanna have a chat, ask questions or request features, we have a')} <a href="https://discord.gg/B2xM8WZyVv">
                    <DiscordIcon /> Discord server
                </a>
            </p>
            <h3>
                {t('External resources')}
            </h3>
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
            className = 'footer-section-wrapper'
        >
            <h3>
                {t('Supporters')}
            </h3>
            <PatreonButton />
            {
                supporters.map((supporter) => {
                    if(supporter.name === 'kokarn'){
                        return null;
                    }

                    return <Supporter
                        key = {`supporter-${supporter.name}`}
                        name = {supporter.name}
                        github = {supporter.github}
                        patreon = {supporter.patreon}
                        link = {supporter.link}
                    />;
                })
            }
        </div>
        <div
            className = 'footer-section-wrapper'
        >
            <h3>
                {t('Resources')}
            </h3>
            <p>
                <Link
                    to = {'/api/'}
                >
                    Tarkov Tools API
                </Link>
            </p>
            <p>
                <Link
                    to = {'/nightbot/'}
                >
                    Nightbot integration
                </Link>
            </p>
            <p>
                <Link
                    to = {'/streamelements/'}
                >
                    StreamElements integration
                </Link>
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
