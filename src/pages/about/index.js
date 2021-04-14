import Supporter from '../../components/Supporter';

import './index.css';

function About() {
    return <div
        className = {'page-wrapper'}
    >
        <h1>
            About
        </h1>
        <h2>
            Open source
        </h2>
        <p>
            The whole platform is open source, and the code is available on <a href="https://github.com/kokarn/tarkov-tools">
                GitHub
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
        <h2>
            Discussions & feedback
        </h2>
        <p>
            If you wanna have a chat, ask questions or request features, we have a <a href="https://discord.gg/B2xM8WZyVv">
                Discord
            </a> server
        </p>
        <h2>
            Support
        </h2>
        <p>
            The best way to support is either by becoming a <a
                href = 'https://www.patreon.com/kokarn'
            >
                Patreon
            </a> supporter or by posting bugs, suggesting or implementing new features, improving maps or anything else you can think of that would improve the site
        </p>
        <h3>
            Current supporters
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
