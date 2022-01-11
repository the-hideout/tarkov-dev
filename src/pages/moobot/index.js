import {useTranslation} from 'react-i18next';

import './index.css';

function Moobot() {
    const {t} = useTranslation();
    return <div
        className = {'page-wrapper moobot-page-wrapper'}
    >
        <h1>
            {t('Tarkov Tools Moobot integration')}
        </h1>
        <p>
            {t('You can add command to your moobot to get price check in your twitch chat')}
        </p>
        <h2>
            {t('Instructions')}
        </h2>
        <ul>
            <li>
                {t('Register at')} <a href="https://moo.bot/">moo.bot</a> {t('using your twitch account')}
            </li>
            <li>
                {t('Go to Custom commands')}
            </li>
        </ul>
        <p>
            <img
                alt = {'Moobot step 1'}
                loading='lazy'
                src = {`${process.env.PUBLIC_URL}/images/moobot-1.jpg`}
            />
        </p>
        <ul>
            <li>
                {t('Set what you want the command to be. Common is "p" or "price"')}
            </li>
            <li>
                {t('Press the "Create" button')}
            </li>
        </ul>
        <p>
            <img
                alt = {'Moobot step 2'}
                loading='lazy'
                src = {`${process.env.PUBLIC_URL}/images/moobot-2.jpg`}
            />
        </p>
        <ul>
            <li>
                {t('In response choose URL Fetch - Full (plain) response')}
            </li>
            <li>
                <pre>
                    https://tarkov-tools.com/webhook/moobot?q=
                </pre>
                {t('and after insert "Command arguments"')}
            </li>
        </ul>
        <p>
            <img
                alt = {'Moobot step 4'}
                loading='lazy'
                src = {`${process.env.PUBLIC_URL}/images/moobot-3.jpg`}
            />
        </p>
        <ul>
            <li>
                {t('Now press "Save" button')}
            </li>
        </ul>
        <p>
            <img
                alt = {'Moobot step 5'}
                loading='lazy'
                src = {`${process.env.PUBLIC_URL}/images/moobot-4.jpg`}
            />
        </p>
        <p>
            {t('Big thanks to')} <a href="https://www.twitch.tv/PhreakinPhil">PhreakinPhil</a> {t('for feedback')}
        </p>
    </div>;
};

export default Moobot;
