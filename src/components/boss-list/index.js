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

    var duplicateCheck = [];
    var bossArray = [];
    for (const map of bosses.maps) {
        for (const boss of map.bosses) {
            if (!duplicateCheck.includes(boss.name)) {
                bossArray.push(boss);
                duplicateCheck.push(boss.name);
            } 
        }
    }

    return (
        <>
            {bossArray.map((bossData) => {

                var key = bossData.name.toLowerCase().replace(/ /g, '-');

                return (
                    <li key={`boss-link-${key}`}>
                        <Link to={`/boss/${key}`}>
                            <img 
                                alt={bossData.name}
                                loading='lazy'
                                className="boss-icon"
                                src={`https://assets.tarkov.dev/${key}.jpg`}
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
