import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';

import SEO from '../../components/SEO';
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
        <SEO 
            title={`Escape from Tarkov Guides`}
            description={`Escape from Tarkov Guides`}
        />,
        <div className={'page-wrapper'} key="guides-page-wrapper">
            <Suspense fallback={Loading}>
                <Guide />
            </Suspense>
        </div>,
    ];
}

export default Guides;
