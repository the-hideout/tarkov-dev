import { useTranslation } from 'react-i18next';

import './index.css';

function Nightbot() {
    const { t } = useTranslation();
    return (
        <div className={'page-wrapper nightbot-page-wrapper'}>
            <h1>{t('Tarkov.dev Nightbot integration')}</h1>
            <p>
                {t('You can add command to your nightbot to get price check in your twitch / youtube channel chat')}
            </p>
            <h2>{t('Instructions')}</h2>
            <ul>
                <li>
                    {t('Register at')} <a href="https://nightbot.tv">nightbot.tv</a> {t('using your twitch / youtube account')}
                </li>
                <li>
                    {t('Go to dashboard')} <a href="https://nightbot.tv/dashboard">nightbot.tv/dashboard</a>
                </li>
                <li>{t('Click the "Join Channel" button')}</li>
            </ul>
            <p>
                <img
                    alt={'Nightbot step 1'}
                    height={452}
                    src={`${process.env.PUBLIC_URL}/images/nightbot-1.jpg`}
                    width={900}
                    loading="lazy"
                />
            </p>
            <ul>
                <li>
                    {t('Make bot - moderator, just type /mod nightbot in your chat')}
                </li>
                <li>
                    {t('Go to custom commands')} <a href="https://nightbot.tv/commands/custom">nightbot.tv/commands/custom</a>
                </li>
                <li>{t('Press the "Add command" button')}</li>
            </ul>
            <p>
                <img
                    alt={'Nightbot step 2'}
                    height={375}
                    loading="lazy"
                    src={`${process.env.PUBLIC_URL}/images/nightbot-2.jpg`}
                    width={900}
                />
            </p>
            <ul>
                <li>{t('Command: !p or anything you like')}</li>
                <li>
                    {t('Message:')}
                    <pre>
                        $(urlfetch
                        https://tarkov.dev/webhook/nightbot?q=$(querystring))
                    </pre>
                </li>
                <li>{t('Press "Submit"')}</li>
            </ul>
            <p>
                <img
                    alt={'Nightbot step 3'}
                    loading="lazy"
                    height={579}
                    src={`${process.env.PUBLIC_URL}/images/nightbot-3.jpg`}
                    width={900}
                />
            </p>
            <p>
                {t('Big thanks to')} <a href="https://www.twitch.tv/PhreakinPhil">PhreakinPhil</a> {t('for feedback')}
            </p>
        </div>
    );
}

export default Nightbot;
