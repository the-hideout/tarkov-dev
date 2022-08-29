import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';

import doFetchBosses from '../../features/bosses/do-fetch-bosses';
import formatBossData from '../../modules/format-boss-data';
import MenuItem from '../menu/MenuItem';
import LoadingSmall from '../loading-small';

import './index.css';

// Query for bosses
export const useBossesQuery = (queryOptions) => {
    const bossesQuery = useQuery('bosses', () => doFetchBosses(), {
        refetchInterval: 600000,
        placeholderData: [],
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        ...queryOptions,
    });

    return bossesQuery;
};

// BossPageList component for the main boss page
export function BossPageList() {
    // Fetch bosses
    const { data: bosses } = useBossesQuery();

    // If no bosses have been returned yet, return 'loading'
    if (!bosses || bosses.length === 0) {
        return <LoadingSmall />;
    }

    // Format the boss data
    const bossArray = formatBossData(bosses);

    // Return the home page boss React component
    return (
        <>
            {bossArray.map((boss) => {

                // Format the boss name for links
                var key = boss.normalizedName.toLowerCase().replace(/ /g, '-');

                return (
                    <Link to={`/boss/${key}`} className="screen-link" key={`boss-${key}`}>
                        <h2 className="center-title">{boss.name}</h2>
                        <img
                            alt={boss.name}
                            loading='lazy'
                            src={`https://assets.tarkov.dev/${key}.jpg`}
                        />
                    </Link>
                )
            })}
        </>
    );
}

// BossListNav component for homepage nav bar
export function BossListNav(onClick) {
    // Fetch bosses
    const { data: bosses } = useBossesQuery();

    // If no bosses have been returned yet, return 'loading'
    if (!bosses || bosses.length === 0) {
        return null;
    }

    // Format the boss data
    const bossArray = formatBossData(bosses);

    // Return the home page nav boss React component
    return (
        <>
            <ul>
                {bossArray.map((boss) => {
                    // Format the boss name for links
                    var key = boss.normalizedName.toLowerCase().replace(/ /g, '-');

                    return (
                        <MenuItem
                            displayText={boss.name}
                            key={key}
                            to={`/boss/${key}`}
                            onClick={onClick.onClick}
                        />
                    )
                })}
            </ul>
        </>
    );
}

// BossList component for homepage
function BossList() {
    // Fetch bosses
    const { data: bosses } = useBossesQuery();

    // If no bosses have been returned yet, return 'loading'
    if (!bosses || bosses.length === 0) {
        return <LoadingSmall />;
    }

    // Format the boss data
    const bossArray = formatBossData(bosses);

    // Return the home page boss React component
    return (
        <>
            {bossArray.map((boss) => {

                // Format the boss name for links
                var key = boss.normalizedName.toLowerCase().replace(/ /g, '-');

                return (
                    <li key={`boss-link-${key}`}>
                        <Link to={`/boss/${key}`} key={`boss-${key}`}>
                            <img
                                alt={boss.name}
                                loading='lazy'
                                className="boss-icon"
                                src={`https://assets.tarkov.dev/${key}-icon.jpg`}
                            />
                            {boss.name}
                        </Link>
                    </li>
                )
            })}
        </>
    );
}

export default BossList;
