import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import Icon from '@mdi/react';
import {mdiMagazineRifle} from '@mdi/js';

import { Filter, InputFilter } from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';
import QueueBrowserTask from '../../../modules/queue-browser-task';

function Mods() {
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
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Mods')}</title>
            <meta
                name="description"
                content={`All the relevant information about Escape from Tarkov`}
            />
        </Helmet>,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiMagazineRifle} size={1.5} className="icon-with-text" /> 
                    {t('Mods')}
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
                typeFilter="mods"
                fleaValue
                traderValue
                traderPrice
                autoScroll
                maxItems={50}
            />

            <div className="page-wrapper items-page-wrapper">
                <p>
                    {"In Escape from Tarkov, the performance and functioning of a weapon are controlled by elaborate mechanisms organized into five categories:"}
                    <ul>
                        <li>{"Functional Mods"}</li>
                        <li>{"Muzzle devices (Functional Mods)"}</li>
                        <li>{"Sights (Functional Mods)"}</li>
                        <li>{"Gear Mods"}</li>
                        <li>{"Vital parts"}</li>
                    </ul>
                </p>
            </div>
        </div>,
    ];
}

export default Mods;
