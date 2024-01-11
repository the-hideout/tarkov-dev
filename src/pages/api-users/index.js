import { Trans, useTranslation } from 'react-i18next';

import SEO from '../../components/SEO.jsx';

import apiUsers from '../../data/api-users.json';

import './index.css';

function ApiUsers() {
    const { t } = useTranslation();
    return (
        <SEO 
            title={`${t('API Users')} - ${t('Tarkov.dev')}`}
            description={t('api-users-page-description', 'This page contains a list of all users of public API on Tarkov.dev and their projects.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper api-users-page-wrapper'}>
            <h1>{t('API Users')} - {t('Tarkov.dev')}</h1>
            <Trans i18nKey={'api-users-p'}>
                <p>
                    Want to be included on this page? Join the <a href="https://discord.gg/XPAsKGHSzH" target="_blank" rel="noopener noreferrer">Discord</a> and tell us about what you've made!
                </p>
            </Trans>
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
                            <a href={apiUser.link} target="_blank" rel="noopener noreferrer">{apiUser.title}</a>
                        </h2>
                        <div className="api-user-data-wrapper">
                            {apiUser.text}
                        </div>
                        <div className="api-user-data-wrapper">
                            <img
                                alt={apiUser.title}
                                loading="lazy"
                                src={`${process.env.PUBLIC_URL}/images/api-users/${projectKey}_thumb.${apiUser.imageType || 'png'}`}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ApiUsers;
