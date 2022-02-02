import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

import Loading from '../../components/loading';
import ErrorPage from '../../components/error-page';

function Guides() {
    let { guideKey } = useParams();
    // console.log(guideKey);
    let Guide = <ErrorPage />;

    try {
        Guide = React.lazy(() => import(`./${guideKey}.js`));
    } catch (loadError) {
        console.log(loadError);
    }

    return [
        <Helmet key={'guides-helmet'}>
            <meta charSet="utf-8" />
            <title>Escape from Tarkov Guides</title>
            <meta name="description" content="Escape from Tarkov Guides" />
        </Helmet>,
        <div className={'page-wrapper'} key="guides-page-wrapper">
            <Suspense fallback={Loading}>
                <Guide />
            </Suspense>
        </div>,
    ];
}

export default Guides;
