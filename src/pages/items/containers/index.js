import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import {mdiArchive} from '@mdi/js';

import SmallItemTable from '../../../components/small-item-table';

function Containers(props) {
    const { t } = useTranslation();
    return [
        <Helmet key={'containers-table'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Containers')}</title>
            <meta
                name="description"
                content="All containers in Escape from Tarkov sortable by price, slot-ratio, size etc"
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiArchive} size={1.5} className="icon-with-text" /> 
                    {t('Containers')}
                </h1>
            </div>
            <SmallItemTable
                typeFilter="container"
                fleaPrice
                gridSlots
                innerSize
                slotRatio
                pricePerSlot
                barterPrice
                showContainedItems
            />
        </div>,
    ];
}

export default Containers;
