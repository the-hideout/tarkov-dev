import {
    Link
} from 'react-router-dom';
import {Helmet} from 'react-helmet';

import Icon from '@mdi/react'
import {
    mdiAccountGroup,
} from '@mdi/js';

import './index.css';

function Traders(props) {
    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta
                charSet='utf-8'
            />
            <title>
                Escape from Tarkov Traders
            </title>
            <meta
                name = 'description'
                content = 'Escape from Tarkov Trader items, unlocks and spending guides'
            />
        </Helmet>,
        <div
            className = {'page-wrapper'}
            key = 'traders-page-wrapper'
        >
            <h1
                className = 'center-title'
            >
                <Icon
                    path={mdiAccountGroup}
                    size={1.5}
                    className = 'icon-with-text'
                />
                Escape from Tarkov Traders
            </h1>
            <div
                className = 'traders-list-wrapper'
            >
                <Link
                    to = {`/traders/prapor`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        Prapor
                    </h2>
                    <img
                        alt = {'Prapor'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/prapor-icon.jpg`}
                    />
                </Link>
                <Link
                    to = {`/traders/therapist`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        Therapist
                    </h2>
                    <img
                        alt = {'Therapist'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/therapist-icon.jpg`}
                    />
                </Link>
                <Link
                    to = {`/traders/skier`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        Skier
                    </h2>
                    <img
                        alt = {'Skier'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/skier-icon.jpg`}
                    />
                </Link>
                <Link
                    to = {`/traders/peacekeeper`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        Peacekeeper
                    </h2>
                    <img
                        alt = {'Peacekeeper'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/peacekeeper-icon.jpg`}
                    />
                </Link>
                <Link
                    to = {`/traders/mechanic`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        Mechanic
                    </h2>
                    <img
                        alt = {'Mechanic'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/mechanic-icon.jpg`}
                    />
                </Link>
                <Link
                    to = {`/traders/ragman`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        Ragman
                    </h2>
                    <img
                        alt = {'Ragman'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/ragman-icon.jpg`}
                    />
                </Link>
                <Link
                    to = {`/traders/jaeger`}
                    className = 'screen-link'
                >
                    <h2
                        className = 'center-title'
                    >
                        Jaeger
                    </h2>
                    <img
                        alt = {'Jaeger'}
                        loading='lazy'
                        src = {`${process.env.PUBLIC_URL}/images/jaeger-icon.jpg`}
                    />
                </Link>
            </div>
        </div>,
    ];
};

export default Traders;
