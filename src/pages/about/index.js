import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
// import SupportersList from '../../components/supporters-list';

import UkraineButton from '../../components/ukraine-button';

import './index.css';

function About() {
    const { t } = useTranslation();
    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('About the tarkov.dev project')}</title>
            <meta
                name="description"
                content="Learn more about the-hideout and tarkov.dev. A free, community made, open source Escape from Tarkov ecosystem! Use our tools to help you play the game, or build your own projects with our free API."
            />
        </Helmet>,
        <div className={'page-wrapper'}>
            <h1>{t('About')}</h1>
            <h2>{t('Open source')}</h2>
            <p>
                {t(
                    'The whole platform is open source and focused around developers. All code is available on',
                )}{' '}
                <a href="https://github.com/the-hideout/tarkov-dev">GitHub</a>
                <span>.</span>
            </p>
            <h2>{t('Discussions & feedback')}</h2>
            <p>
                {t(
                    'If you wanna have a chat, ask questions or request features, we have a',
                )}{' '}
                <a href="https://discord.gg/XPAsKGHSzH">Discord</a>{' '}
                {t('server')}
            </p>
            <h2>{t('Support')}</h2>
            <p>
                {t(
                    'We encourage everyone who can to donate to support the people of Ukraine using the button below',
                )}<span>.</span>
            </p>
            <UkraineButton/>
            <p>
                {t("If you'd also like to support this project, you can make a donation and/or become a backer on")}{' '}
                <a href="https://opencollective.com/tarkov-dev" target="_blank" rel="noreferrer">Open Collective</a><span>.</span>
            </p>
            <p>
                {t(
                    'You can also help by posting bugs, suggesting or implementing new features, improving maps or anything else you can think of that would improve the site.',
                )}
            </p>
            <h2>{t('API')}</h2>
            <p>
                {t(
                    'We offer a 100% free and publically accessible API for all your Tarkov development needs - ',
                )}{' '}
                <a href="/api/">API</a>{' '}
            </p>
            <h2>{t('History')}</h2>
            <p>
                {t('This project is a fork of')}
                {' '}
                <a href="https://github.com/kokarn/tarkov-tools">
                    tarkov-tools.com
                </a>
                {'. '}
                {t('The original creator')}{' '}
                <a href="https://github.com/kokarn">@kokarn</a>{' '}
                {t(
                    'decided to shut the site down. In the spirit of open source, a group of developers came together to revive the site in order to continue providing a great website for the Tarkov community and an API to power further development for creators. This project is now 100% open source and developer first. Our GitHub Organization',
                )}
                {' ('}
                <a href="https://github.com/the-hideout">the-hideout</a>
                {') '}
                {t(
                    'contains all the repos which power the API, this website, the community Discord bot, server infrastructure, and much more! We are passionate about open source and love pull requests to improve our ecosystem for all.',
                )}{' '}
            </p>
            <h2>{t('Core Contributors')}</h2>
            <p>
                {t(
                    'The core contributors to this project (in no particular order) are:',
                )}{' '}
                <ul>
                    <li>
                        <a href="https://github.com/Razzmatazzz">
                            @Razzmatazzz
                        </a>{' '}
                    </li>
                    <li>
                        <a href="https://github.com/austinhodak">
                            @austinhodak
                        </a>{' '}
                    </li>
                    <li>
                        <a href="https://github.com/GrantBirki">@GrantBirki</a>{' '}
                    </li>
                    <li>
                        <a href="https://github.com/Blightbuster">
                            @Blightbuster
                        </a>{' '}
                    </li>
                    <li>
                        <a href="https://github.com/johndongus">@johndongus</a>{' '}
                    </li>
                    <li>
                        <a href="https://github.com/Shebuka">@Shebuka</a>
                    </li>
                </ul>
            </p>
            {/* <h3>{t('Gold supporters')}</h3>
            <SupportersList tierFilter={'Gold supporter'} />
            <h3>{t('Silver supporters')}</h3>
            <SupportersList tierFilter={'Silver supporter'} />
            <h3>{t('Expert supporters')}</h3>
            <SupportersList tierFilter={'Expert'} />
            <h3>{t('Advanced Supporters')}</h3>
            <SupportersList tierFilter={'Advanced'} />
            <h3>{t('Basic Supporters')}</h3>
            <SupportersList tierFilter={'Basic'} type={'inline'} />
            <h3>{t('Contributors')}</h3>
            <SupportersList typeFilter={'github'} type={'inline'} /> */}
        </div>,
    ];
}

export default About;
