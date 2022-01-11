import { useTranslation } from 'react-i18next';

import Supporter from '../../components/supporter';

import './index.css';

function About() {
    const {t} = useTranslation();
    return <div
        className = {'page-wrapper'}
    >
        <h1>
            {t('About')}
        </h1>
        <h2>
            {t('Open source')}
        </h2>
        <p>
            {t('The whole platform is open source, and the code is available on')} <a href="https://github.com/kokarn/tarkov-tools">
                GitHub
            </a>
        </p>
        <p>
            <a href="https://travis-ci.com/github/kokarn/tarkov-tools">
                <img
                    alt="Build status"
                    loading='lazy'
                    src="https://travis-ci.com/kokarn/tarkov-tools.svg?branch=master"
                />
            </a>
        </p>
        <h2>
            {t('Discussions & feedback')}
        </h2>
        <p>
            {t('If you wanna have a chat, ask questions or request features, we have a')} <a href="https://discord.gg/B2xM8WZyVv">
                Discord
            </a> {t('server')}
        </p>
        <h2>
            {t('Support')}
        </h2>
        <p>
            {t('The best way to support is either by becoming a')} <a
                href = 'https://www.patreon.com/kokarn'
            >
                Patreon
            </a> {t('supporter or by posting bugs, suggesting or implementing new features, improving maps or anything else you can think of that would improve the site')}
        </p>
        <h3>
            {t('Current supporters')}
        </h3>
        <Supporter
            name = {'Gyran'}
            patreon
            github
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
        <h2>
            Cool resources
        </h2>
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
        <h2>
            External resources
        </h2>
        <p>
            Pricing data is from our <a href="https://tarkov-tools.com/___graphql">API</a>
        </p>
        <p>
            Some icons are linked from the amazing <a href="https://github.com/RatScanner/EfTIcons">EFTIcons library</a>
        </p>
    </div>;
};

export default About;
