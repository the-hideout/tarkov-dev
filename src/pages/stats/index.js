import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { useQuery } from 'react-query';

import TwitchIcon from '../../components/supporter/Twitch.svg';

import './index.css';

const twitch_url = "https://api.tarkov.dev/twitch";

const fetchTwitchData = async () => {
    const res = await fetch(twitch_url);
    return res.json();
};

function Stats() {
    const { data, status } = useQuery("twitch-data", fetchTwitchData);

    var totalViewers = 0;
    if (status === "success") {
        for (var i = 0; i < data["data"].length; i++) {
            totalViewers += data["data"][i]["viewer_count"];
        }
    } else if (status === "loading") {
        totalViewers = "Loading...";
    } else {
        totalViewers = "error";
    }

    totalViewers = totalViewers.toLocaleString('en-US')

    const { t } = useTranslation();
    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Statistics - tarkov.dev')}</title>
            <meta
                name="description"
                content="Statistics about the Escape from Tarkov game and tarkov.dev"
            />
        </Helmet>,
        <div className={'page-wrapper'}>
            <h1 className="center-title">{t('Statistics')} 📊</h1>
            <div className="center-title">
                <img
                    src={TwitchIcon}
                    style={{ height: '3em', width: '3em', display: 'inline' }}
                    alt="Twitch logo"
                />
                <h3>Twitch - Escape from Tarkov</h3>
                <p>Total Twitch viewers aggregated from top 100 current EFT streamers</p>
                <p>Twitch Viewers: {totalViewers} 🟢</p>
                <br/>
                <p>More stats to come soon! Consider contributing to see whatever stats about EFT here!</p>
            </div>
            { }
        </div>,
    ];
}

export default Stats;
