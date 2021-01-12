import Supporter from '../../components/menu/Supporter';

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
            If you wanna have a chat, ask questions or request features, we have a <a href="https://discord.gg/SwpAe48d">
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
        <p>
            <Supporter
                name = {'Gyran'}
                patreon
                github
            />
            <Supporter
                name = {'KilobyteKeith'}
                patreon
            />
        </p>
        <h2>
            External resources
        </h2>
        <p>
            All pricing data is courtesy of <a href="https://tarkov-market.com">Tarkov Market</a>
        </p>
        <p>
            Some icons are linked from the amazing <a href="https://github.com/RatScanner/EfTIcons">EFTIcons library</a>
        </p>
    </div>;
};

export default About;
