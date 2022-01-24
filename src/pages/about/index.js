import { useTranslation } from 'react-i18next';
import SupportersList from '../../components/supporters-list';

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
            </a>.
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
            {t('Gold supporters')}
        </h3>
            <SupportersList
                tierFilter={'Gold supporter'}
            />
        <h3>
            {t('Silver supporters')}
        </h3>
            <SupportersList
                tierFilter={'Silver supporter'}
            />
        <h3>
            {t('Godly thing supporters')}
        </h3>
            <SupportersList
                tierFilter={'God among supporters'}
            />
        <h3>
            {t('Supporters')}
        </h3>
            <SupportersList
                tierFilter={'Basic+'}
            />
            <SupportersList
                tierFilter={'Basic'}
                type={'inline'}
            />
        <h3>
            {t('Contributors')}
        </h3>
            <SupportersList
                typeFilter={'github'}
            />
    </div>;
};

export default About;
