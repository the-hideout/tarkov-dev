import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import {mdiGasCylinder} from '@mdi/js';

import { Filter, InputFilter } from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';
import QueueBrowserTask from '../../../modules/queue-browser-task';

function Grenades() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const { t } = useTranslation();

    const handleNameFilterChange = useCallback(
        (e) => {
            if (typeof window !== 'undefined') {
                const name = e.target.value.toLowerCase();

                // schedule this for the next loop so that the UI
                // has time to update but we do the filtering as soon as possible
                QueueBrowserTask.task(() => {
                    setNameFilter(name);
                });
            }
        },
        [setNameFilter],
    );

    return [
        <Helmet key={'grenades-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Grenades')}</title>
            <meta
                name="description"
                content={`All the relevant information about Escape from Tarkov`}
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiGasCylinder} size={1.5} className="icon-with-text" /> 
                    {t('Grenades')}
                </h1>
                <Filter center>
                    <InputFilter
                        defaultValue={nameFilter}
                        onChange={handleNameFilterChange}
                        placeholder={t('Search...')}
                    />
                </Filter>
            </div>

            <SmallItemTable
                nameFilter={nameFilter}
                typeFilter="grenade"
                fleaValue
                traderValue
                traderPrice
            />

            <div className="page-wrapper items-page-wrapper">
                <p>
                    {"There are only a handful distinct types of grenades that may be thrown or launched in Escape from Tarkov, and each one has a unique effect: flash, smokes, high explosive, and fragmentation."}
                    <br/>
                    {"Grenades are situational, but when utilized properly, they can have deadly results. Any advantage from high-tier equipment can be fully negated by a single well-thrown grenade, whether it completely blinds the adversary, kills them instantly, or forces them out of cover and into your gunfire."}
                    <br/>
                    {"Five factors to think about while using throwable grenades include the fuse time, explosion radius, fragment damage, fragment count, and even the weight of the grenade. With specific uses arising from each component."}
                </p>
            </div>
        </div>,
    ];
}

export default Grenades;
