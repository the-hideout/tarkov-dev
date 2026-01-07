import { Link } from "react-router-dom";
import { Trans, useTranslation } from 'react-i18next';
import { Avatar, ThemeProvider, createTheme } from "@mui/material";

import { ReactComponent as GithubIcon } from '../../images/Github.svg';
import { ReactComponent as DiscordIcon } from '../../images/Discord.svg';
import { ReactComponent as XIcon } from '../../images/X.svg';

import SEO from '../../components/SEO.jsx';
import UkraineButton from '../../components/ukraine-button/index.jsx';
import OpenCollectiveButton from "../../components/open-collective-button/index.jsx";
import Contributors from '../../components/contributors/index.jsx';

import './index.css';

function About() {
    const { t } = useTranslation();

    const coreAvatarTheme = createTheme({
        components: {
            // Name of the component
            MuiAvatar: {
                styleOverrides: {
                    // Name of the slot
                    root: {
                        // Some CSS
                        width: 24,
                        height: 24,
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        border: 1,
                        borderStyle: 'solid',
                    },
                },
            },
        },
    });

    return [
        <SEO 
            title={`${t('About the tarkov.dev project')} - ${t('Tarkov.dev')}`}
            description={t('about-page-description', 'Learn more about the-hideout and tarkov.dev. A free, community made, open source Escape from Tarkov ecosystem! Use our tools to help you play the game, or build your own projects with our free API.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'} key="about-page-content">
            <h1>{t('About')}</h1>
            <h2>{t('Open source')}</h2>
            {/* prettier-ignore */}
            <Trans i18nKey={'about-open-source-p'}>
                <p>
                    The whole platform is open source and focused around developers. All code is available on <a href="https://github.com/the-hideout/tarkov-dev" target="_blank" rel="noopener noreferrer"><GithubIcon /> GitHub</a>.
                </p>
            </Trans>
            <h2>{t('Discussions & feedback')}</h2>
            {/* prettier-ignore */}
            <Trans i18nKey={'about-discord-p'}>
                <p>
                    If you wanna have a chat, ask questions or request features, we have a <a href="https://discord.gg/WwTvNe356u" target="_blank" rel="noopener noreferrer"><DiscordIcon /> Discord</a> server.
                </p>
            </Trans>
            {/* prettier-ignore */}
            <Trans i18nKey={'about-x-p'}>
                <p>
                    Follow us on <a href="https://x.com/tarkov_dev" target="_blank" rel="noopener noreferrer"><XIcon /> X</a> for all the latest updates.
                </p>
            </Trans>
            <h2>{t('Support')}</h2>
            {/* prettier-ignore */}
            <Trans i18nKey={'about-support-ukraine-p'}>
            <p>
                We encourage everyone who can to donate to support the people of Ukraine using the button below.
            </p>
            </Trans>
            <UkraineButton large={false}/>
            {/* prettier-ignore */}
            <Trans i18nKey={'about-support-collective-p'}>
            <p>
                If you'd also like to support this project, you can make a donation and/or become a backer on <a href="https://opencollective.com/tarkov-dev" target="_blank" rel="noopener noreferrer">Open Collective</a>.
            </p>
            </Trans>
            <OpenCollectiveButton large={false}/>
            {/* prettier-ignore */}
            <Trans i18nKey={'about-support-more-p'}>
            <p>
                You can also help by posting bugs, suggesting or implementing new features, improving maps or anything else you can think of that would improve the site.
            </p>
            </Trans>
            <h2>{t('API')}</h2>
            {/* prettier-ignore */}
            <Trans i18nKey={'about-api-p'}>
            <p>
                We offer a 100% free and publically accessible API for all your Tarkov development needs - <Link to="/api/">API</Link>.
            </p>
            </Trans>
            <h2>{t('History')}</h2>
            {/* prettier-ignore */}
            <Trans i18nKey={'about-history-p'}>
            <p>
                This project is a fork of <a href="https://github.com/kokarn/tarkov-tools" target="_blank" rel="noopener noreferrer">tarkov-tools.com</a>.
                The original creator <a href="https://github.com/kokarn">@kokarn</a> decided to shut the site down.
                In the spirit of open source, a group of developers came together to revive the site in order to continue providing a great website for the Tarkov community and an API to power further development for creators.
                This project is now 100% open source and developer first.
                Our GitHub Organization (<a href="https://github.com/the-hideout" target="_blank" rel="noopener noreferrer">the-hideout</a>) contains all the repos which power the API, this website, the community Discord bot, server infrastructure, and much more! We are passionate about open source and love pull requests to improve our ecosystem for all.
            </p>
            </Trans>
            <h2>{t('Core Contributors')}</h2>
            {/* prettier-ignore */}
            <Trans i18nKey={'about-core-contributors-p'}>
            <p>
                The core contributors to this project (in no particular order) are:
            </p>
            </Trans>
            <ThemeProvider theme={coreAvatarTheme}>
                <ul>
                    <li>
                        <a href="https://github.com/Razzmatazzz" target="_blank" rel="noopener noreferrer">
                            <Avatar src="https://avatars.githubusercontent.com/Razzmatazzz?size=24" />
                            {' @Razzmatazzz'}
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/austinhodak" target="_blank" rel="noopener noreferrer">
                            <Avatar src="https://avatars.githubusercontent.com/austinhodak?size=24" />
                            {' @austinhodak'}
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/GrantBirki" target="_blank" rel="noopener noreferrer">
                            <Avatar src="https://avatars.githubusercontent.com/GrantBirki?size=24" />
                            {' @GrantBirki'}
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/Blightbuster" target="_blank" rel="noopener noreferrer">
                            <Avatar src="https://avatars.githubusercontent.com/Blightbuster?size=24" />
                            {' @Blightbuster'}
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/thaddeus" target="_blank" rel="noopener noreferrer">
                            <Avatar src="https://avatars.githubusercontent.com/thaddeus?size=24" />
                            {' @thaddeus'}
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/johndongus" target="_blank" rel="noopener noreferrer">
                            <Avatar src="https://avatars.githubusercontent.com/johndongus?size=24" />
                            {' @johndongus'}
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/Shebuka" target="_blank" rel="noopener noreferrer">
                            <Avatar src="https://avatars.githubusercontent.com/Shebuka?size=24" />
                            {' @Shebuka'}
                        </a>
                    </li>
                </ul>
            </ThemeProvider>
            <h2>{t('All Contributors')}</h2>
            {/* prettier-ignore */}
            <Trans i18nKey={'about-all-contributors-p'}>
            <p>
                Massive thank you to all the people that have contributed to this project to make it possible! ❤️
            </p>
            </Trans>
            <Contributors size={36} />
        </div>,
    ];
}

export default About;
