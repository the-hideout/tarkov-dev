import {
    Link
} from 'react-router-dom';
import {Helmet} from 'react-helmet';

import './index.css';

import armorTableImage from '../../images/armor-table.png';
import helmetTableImage from '../../images/helmet-table.png';
import glassesTableImage from '../../images/glasses-table.png';

function Guides() {
    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta
                charSet='utf-8'
            />
            <title>
                Escape from Tarkov gear guides and graphs
            </title>
            <meta
                name = 'description'
                content = 'Escape from Tarkov gear guides and graphs'
            />
        </Helmet>,
        <div
            className = {'page-wrapper'}
            key = 'map-page-wrapper'
        >
            <h1>
                Escape from Tarkov gear guides and graphs
            </h1>
            <div
                className = 'guides-list-wrapper'
            >
                <Link
                    to = {`/guides/armor`}
                >
                    <h2>
                        Armor
                    </h2>
                    <img
                        alt = {'Armor table'}
                        src = {armorTableImage}
                    />
                </Link>
                <Link
                    to = {`/guides/headwear`}
                >
                    <h2>
                        Helmet
                    </h2>
                    <img
                        alt = {'Helmet table'}
                        src = {helmetTableImage}
                    />
                </Link>
                <Link
                    to = {`/guides/glasses`}
                >
                    <h2>
                        Glasses
                    </h2>
                    <img
                        alt = {'Glasses table'}
                        src = {glassesTableImage}
                    />
                </Link>
            </div>
        </div>
    ];
};

export default Guides;
