import { useQuery } from 'react-query';
import doFetchBosses from '../../features/bosses/do-fetch-bosses';
import { Link } from 'react-router-dom';
import 'tippy.js/dist/tippy.css'; // optional
import './index.css';

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

function BossList() {
    const { data: bosses } = useBossesQuery();

    if (!bosses || bosses.length === 0) {
        return 'Loading...';
    }

    return (
        <>
            {bosses.maps.map((bossData) => {
                return (
                    <li key={`boss-link-${bossData.id}`}>
                        <Link to={`/boss/${bossData.name}`}>
                            {bossData.name}
                        </Link>
                    </li>
                )
            })}
        </>
    );


}

export default BossList;
