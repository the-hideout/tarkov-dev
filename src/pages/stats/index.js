import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { useQuery } from 'react-query';

import './index.css';

const twitch_url = "https://dev-api.tarkov.dev/twitch";

function GetTwitchViewers() {
    const { status, data } = useQuery(
        `twitch-viewers`,
        () =>
            fetch(twitch_url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }
            }).then((response) => response.json()),
        {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        },
    );

    // var allData = data["data"];
    // var arrayLength = allData.length;

    // var totalViewers = 0;
    // for (var i = 0; i < arrayLength; i++) {
    //     totalViewers += allData[i]["viewer_count"];
    // }

    console.log(status);
    console.log(data);

    // Placeholder for now
    var totalViewers = "123";

    return (
        <p>{`Total Twitch Viewers: ${totalViewers}`}</p>
    );
}

function Stats() {
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
            <h1 className="center-title">{t('Statistics')}</h1>
            <div className="center-title">
                <h3>Total Twitch.tv viewers</h3>
                <p>Total Twitch viewers aggregated from top 100 current EFT streamers</p>
                <h4>{GetTwitchViewers()}</h4>
            </div>
            { }
        </div>,
    ];
}

export default Stats;
