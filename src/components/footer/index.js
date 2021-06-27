import Supporter from '../supporter';
import {ReactComponent as GithubIcon} from '../supporter/Github.svg';
import {ReactComponent as DiscordIcon} from '../supporter/Discord.svg';

import './index.css';

function Footer() {
    return <div
        className = {'footer-wrapper'}
    >
        <div
            className = 'footer-section-wrapper'
        >
            <h3>
                Tarkov Tools
            </h3>
            <p>
                The whole platform is open source, and the code is available on <a href="https://github.com/kokarn/tarkov-tools">
                    <GithubIcon /> GitHub
                </a>
            </p>
            <p>
                <a href="https://travis-ci.com/github/kokarn/tarkov-tools">
                    <img
                        src="https://travis-ci.com/kokarn/tarkov-tools.svg?branch=master"
                        alt="Build status"
                    />
                </a>
            </p>
            <p>
                If you wanna have a chat, ask questions or request features, we have a <a href="https://discord.gg/B2xM8WZyVv">
                    <DiscordIcon /> Discord
                </a> server
            </p>
        </div>
        <div
            className = 'footer-section-wrapper'
        >
            <h3>
                Supporters
            </h3>
            <p>
                <a
                    href="https://www.patreon.com/bePatron?u=26501878"
                    data-patreon-widget-type="become-patron-button"
                >
                    Become a Patron!
                </a>
            </p>
            <Supporter
                name = {'The Hideout'}
                patreon
                link = 'https://play.google.com/store/apps/details?id=com.austinhodak.thehideout'
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
            />
            <Supporter
                name = {'MrWelshLlama'}
                patreon
            />
            <Supporter
                name = {'Gyran'}
                patreon
                github
            />
        </div>
        <div
            className = 'footer-section-wrapper'
        >
            <h3>
                Resources
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
    </div>;
};

export default Footer;
