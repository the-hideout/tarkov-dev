import {
    Link
} from 'react-router-dom';
import {Helmet} from 'react-helmet';

import ID from '../../components/ID.jsx';
import './index.css';

function Guides(props) {
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
                    to = {`/gear/armor`}
                >
                    <h2>
                        Armor
                    </h2>
                    <img
                        alt = {'Armor table'}
                        src = {`${process.env.PUBLIC_URL}/images/armor-table.jpg`}
                    />
                </Link>
                <Link
                    to = {`/gear/backpacks`}
                >
                    <h2>
                        Backpacks
                    </h2>
                    <img
                        alt = {'Backpacks table'}
                        src = {`${process.env.PUBLIC_URL}/images/backpacks-table.jpg`}
                    />
                </Link>
                <Link
                    to = {`/gear/helmets`}
                >
                    <h2>
                        Helmet
                    </h2>
                    <img
                        alt = {'Helmet table'}
                        src = {`${process.env.PUBLIC_URL}/images/helmet-table.jpg`}
                    />
                </Link>
                <Link
                    to = {`/gear/glasses`}
                >
                    <h2>
                        Glasses
                    </h2>
                    <img
                        alt = {'Glasses table'}
                        src = {`${process.env.PUBLIC_URL}/images/glasses-table.jpg`}
                    />
                </Link>
            </div>
        </div>,
        <ID
            key = {'session-id'}
            sessionID = {props.sessionID}
        />
    ];
};

export default Guides;
