import { Icon } from '@mdi/react';
import { Trans, useTranslation } from 'react-i18next';

import { mdiTextSearch, mdiTools } from '@mdi/js';

import SEO from '../../components/SEO.jsx';
import { ReactComponent as DiscordIcon } from '../../images/Discord.svg';

import './index.css';

function OtherTools(props) {
    const { t } = useTranslation();
    return [
        <SEO 
            title={`${t('More Tools')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('other-tools-page-description', 'This page includes information the additional tools available through Tarkov.dev.')}
            key="seo-wrapper"
        />,
        <div className={'page-wrapper'} key="other-tools-page-wrapper">
            <h1 className="center-title">
                <Icon
                    path={mdiTools}
                    size={1.5}
                    className="icon-with-text"
                />
                {t('More Tools')}
            </h1>
            <div className="information-section map-block" id="tarkov-monitor">
                <h2>
                    <span className="icon">
                        <Icon 
                        path={mdiTextSearch} 
                        size={1}
                        className="icon-with-text"
                        />
                    </span>
                    <a href="https://github.com/the-hideout/TarkovMonitor" target="_blank" rel="noreferrer">TarkovMonitor</a>
                </h2>
                <div className="page-wrapper other-tools-page-wrapper">
                    <Trans>
                        <p>
                        Tarkov Monitor is an open-source application that automates certain features (such as marking quests complete on Tarkov Tracker), 
                        provides audio notifications on certain events (e.g., when you've matched into a raid), 
                        and enables additional functionality on the Tarkov.dev website, such as showing your position on the maps when you take a screenshot. 
                        More information, including installation and setup instructions, is available at the <a href="https://github.com/the-hideout/TarkovMonitor" target="_blank" rel="noreferrer">TarkovMonitor repository</a>.
                        </p>
                    </Trans>
                </div>
            </div>
            <div className="information-section map-block" id="stash">
                <h2>
                    <span className="icon">
                        <DiscordIcon className="icon-with-text"/>
                    </span>
                    {t('Stash Discord Bot')}
                </h2>
                <div className="page-wrapper other-tools-page-wrapper">
                    <Trans>
                        <p>
                        Stash is Tarkov.dev's <a href="https://github.com/the-hideout/stash" target="_blank" rel="noreferrer">open source</a> Discord bot. The bot has commands 
                        for looking up item prices, barter and craft details, quest information, and more. There's also a toggle for game mode (PVP/PVE). 
                        <a href="https://discord.com/api/oauth2/authorize?client_id=955521336904667227&permissions=309237664832&scope=bot%20applications.commands" target="_blank" rel="noreferrer">Add Stash to your server</a>!
                        </p>
                    </Trans>
                </div>
            </div>
        </div>,
    ];
}

export default OtherTools;
