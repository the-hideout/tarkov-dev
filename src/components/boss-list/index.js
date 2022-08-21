import { useQuery } from 'react-query';
import doFetchBosses from '../../features/bosses/do-fetch-bosses';
import formatBossData from '../../modules/format-boss-data';
import { Link } from 'react-router-dom';
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
        return 'Loading...';
    }

    // Format the boss data
    const bossArray = formatBossData(bosses);

    // Return the home page boss React component
    return (
        <>
            {bossArray.map((bossData) => {

                // Format the boss name for links
                var key = bossData.name.toLowerCase().replace(/ /g, '-');

                return (
                    <Link to={`/boss/${key}`} className="screen-link" key={`boss-${key}`}>
                        <h2 className="center-title">{bossData.name}</h2>
                        <img
                            alt={bossData.name}
                            loading='lazy'
                            className="boss-icon"
                            src={`https://assets.tarkov.dev/${key}.jpg`}
                        />
                    </Link>
                )
            })}
        </>
    );
}

// BossList component for homepage
function BossList() {
    // Fetch bosses
    const { data: bosses } = useBossesQuery();

    // If no bosses have been returned yet, return 'loading'
    if (!bosses || bosses.length === 0) {
        return 'Loading...';
    }

    // Format the boss data
    const bossArray = formatBossData(bosses);

    // Return the home page boss React component
    return (
        <>
            {bossArray.map((bossData) => {

                // Format the boss name for links
                var key = bossData.name.toLowerCase().replace(/ /g, '-');

                return (
                    <li key={`boss-link-${key}`}>
                        <Link to={`/boss/${key}`} key={`boss-${key}`}>
                            <img
                                alt={bossData.name}
                                loading='lazy'
                                className="boss-icon"
                                src={`https://assets.tarkov.dev/${key}-icon.jpg`}
                            />
                            {bossData.name}
                        </Link>
                    </li>
                )
            })}
        </>
    );
}

export default BossList;
