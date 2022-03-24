import { useTranslation } from 'react-i18next';

import apiUsers from '../../data/api-users.json';
import './index.css';

function ApiUsers() {
    const { t } = useTranslation();
    return (
        <div className={'page-wrapper api-users-page-wrapper'}>
            <h1>{t('Tarkov Tools API Users')}</h1>
            <p>
                {t('Want to be included on this page? Join the')}{' '}
                <a href="https://discord.gg/XPAsKGHSzH">Discord</a>{' '}
                {t("and tell us about what you've made!")}
            </p>
            {apiUsers.map((apiUser) => {
                const projectKey = apiUser.title
                    .toLowerCase()
                    .replace(/\s/g, '-');
                return (
                    <div
                        className="api-user-wrapper"
                        key={`api-user-${projectKey}`}
                    >
                        <h2>
                            <a href={apiUser.link}>{apiUser.title}</a>
                        </h2>
                        <div className="api-user-data-wrapper">
                            {apiUser.text}
                        </div>
                        <div className="api-user-data-wrapper">
                            <img
                                alt={apiUser.title}
                                loading="lazy"
                                src={`${
                                    process.env.PUBLIC_URL
                                }/images/api-users/${projectKey}.${
                                    apiUser.imageType || 'png'
                                }`}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ApiUsers;
