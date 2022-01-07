import {Helmet} from 'react-helmet';

import ID from '../../../components/ID.jsx';
import SmallItemTable from '../../../components/small-item-table';

function Containers(props) {
    return [<Helmet
        key = {'containers-table'}
    >
        <meta
            charSet='utf-8'
        />
        <title>
            Escape from Tarkov containers
        </title>
        <meta
            name = 'description'
            content = 'All containers in Escape from Tarkov sortable by price, slot-ratio, size etc'
        />
    </Helmet>,
    <div
        className="display-wrapper"
        key = {'display-wrapper'}
    >
        <div
            className='page-headline-wrapper'
        >
            <h1>
                Escape from Tarkov containers
            </h1>
        </div>
        <SmallItemTable
            typeFilter = 'container'
            fleaPrice
            gridSlots
            innerSize
            slotRatio
            pricePerSlot
            barterPrice
        />
    </div>,
    <ID
        key = {'session-id'}
        sessionID = {props.sessionID}
    />
    ];
};

export default Containers;
