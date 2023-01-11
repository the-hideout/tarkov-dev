import { useTranslation } from 'react-i18next';

import './index.css';

function Moobot() {
    const { t } = useTranslation();
    return (
        <div className={'page-wrapper moobot-page-wrapper'}>
            <h1>{t('Tarkov.dev Moobot integration')}</h1>
            <p>
                {t('You can add command to your moobot to get price check in your twitch chat')}
            </p>
            <h2>{t('Instructions')}</h2>
            <ul>
                <li>
                    {t('Register at')} <a href="https://moo.bot/" target="_blank" rel="noopener noreferrer">moo.bot</a> {t('using your twitch account')}
                </li>
                <li>{t('Go to Custom commands')}</li>
            </ul>
            <p>
                <img
                    alt={'Moobot step 1'}
                    height={361}
                    src={`${process.env.PUBLIC_URL}/images/moobot-1.jpg`}
                    width={900}
                    loading="lazy"
                />
            </p>
            <ul>
                <li>
                    {t('Set what you want the command to be. Common is "p" or "price"')}
                </li>
                <li>{t('Press the "Create" button')}</li>
            </ul>
            <p>
                <img
                    alt={'Moobot step 2'}
                    loading="lazy"
                    height={469}
                    src={`${process.env.PUBLIC_URL}/images/moobot-2.jpg`}
                    width={900}
                />
            </p>
            <ul>
                <li>
                    {t('In response choose URL Fetch - Full (plain) response')}
                </li>
                <li>
                    <pre>https://api.tarkov.dev/webhook/moobot?q=</pre>
                    {t('and after insert "Command arguments"')}
                </li>
            </ul>
            <p>
                <img
                    alt={'Moobot step 3'}
                    loading="lazy"
                    height={551}
                    src={`${process.env.PUBLIC_URL}/images/moobot-3.jpg`}
                    width={900}
                />
            </p>
            <ul>
                <li>{t('Now press "Save" button')}</li>
            </ul>
            <p>
                <img
                    alt={'Moobot step 4'}
                    loading="lazy"
                    height={286}
                    src={`${process.env.PUBLIC_URL}/images/moobot-4.jpg`}
                    width={900}
                />
            </p>
            <p>
                {t('Big thanks to')} <a href="https://www.twitch.tv/PhreakinPhil" target="_blank" rel="noopener noreferrer">PhreakinPhil</a> {t('for feedback')}
            </p>
        </div>
    );
}

export default Moobot;
