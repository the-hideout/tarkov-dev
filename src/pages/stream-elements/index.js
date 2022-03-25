import { useTranslation } from 'react-i18next';

import './index.css';

function StreamElements() {
    const { t } = useTranslation();
    return (
        <div className={'page-wrapper stream-elements-page-wrapper'}>
            <h1>{t('Tarkov.dev StreamElements integration')}</h1>
            <p>
                {t(
                    'You can add command to your StreamElements bot to get price check in your twitch / youtube channel chat',
                )}
            </p>
            <h2>{t('Instructions')}</h2>
            <ul>
                <li>
                    {t('Register at')}{' '}
                    <a href="https://streamelements.com/">streamelements.com</a>{' '}
                    {t('using your twitch / youtube account')}
                </li>
                <li>
                    {t('Go to dashboard')}{' '}
                    <a href="https://streamelements.com/dashboard">
                        streamelements.com/dashboard
                    </a>
                </li>
                <li>{t('Click the "Join Channel" button')}</li>
            </ul>
            <p>
                <img
                    alt="StreamElements step 1"
                    height={487}
                    src={`${process.env.PUBLIC_URL}/images/streamelements-1.jpg`}
                    width={900}
                />
            </p>
            <ul>
                <li>
                    {t(
                        'Make bot - moderator, just type /mod streamelements in your chat',
                    )}
                </li>
                <li>
                    {t('Go to custom commands')}{' '}
                    <a href="https://streamelements.com/dashboard/bot/commands/custom">
                        streamelements.com/dashboard/bot/commands/custom
                    </a>
                </li>
                <li>{t('Press the "Add new command" button')}</li>
            </ul>
            <p>
                <img
                    alt="StreamElements step 2"
                    loading="lazy"
                    height={322}
                    src={`${process.env.PUBLIC_URL}/images/streamelements-2.jpg`}
                    width={900}
                />
            </p>
            <ul>
                <li>{t('Command: !p or anything you like')}</li>
                <li>
                    {t('Message:')}
                    <pre>
                        {
                            // eslint-disable-next-line no-template-curly-in-string
                            '${urlfetch https://tarkov.dev/webhook/stream-elements?q=${queryencode ${1:}}}'
                        }
                    </pre>
                </li>
                <li>{t('Press "Activate Command"')}</li>
            </ul>
            <p>
                <img
                    alt="StreamElements part 3"
                    loading="lazy"
                    height={502}
                    src={`${process.env.PUBLIC_URL}/images/streamelements-3.jpg`}
                    width={900}
                />
            </p>
            <p>
                {t('Big thanks to')}{' '}
                <a href="https://www.twitch.tv/PhreakinPhil">PhreakinPhil</a>{' '}
                {t('for feedback')}
            </p>
        </div>
    );
}

export default StreamElements;
