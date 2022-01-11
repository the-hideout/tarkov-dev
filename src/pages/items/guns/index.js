import { useCallback, useState } from 'react';
import {Helmet} from 'react-helmet';
import { useTranslation } from 'react-i18next';

import { Filter, InputFilter } from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';
import QueueBrowserTask from '../../../modules/queue-browser-task';

function Guns() {
    const defaultQuery = new URLSearchParams(window.location.search).get('search');
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const {t} = useTranslation();

    const handleNameFilterChange = useCallback((e) => {
        if (typeof window !== 'undefined') {
            const name = e.target.value.toLowerCase();

            // schedule this for the next loop so that the UI
            // has time to update but we do the filtering as soon as possible
            QueueBrowserTask.task(() => {
                setNameFilter(name);
            });
        }
    }, [setNameFilter]);

    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta charSet="utf-8" />
            <title>
                {t('Escape from Tarkov Guns')}
            </title>
            <meta
                name="description"
                content= {`All the relevant information about Escape from Tarkov`}
            />
        </Helmet>,
        <div
            className="page-wrapper"
            key = {'display-wrapper'}
        >
            <div
                className='page-headline-wrapper'
            >
                <h1>
                    {t('Escape from Tarkov Guns')}
                </h1>
                <Filter
                    center
                >
                    <InputFilter
                        defaultValue = {nameFilter}
                        onChange = {handleNameFilterChange}
                        placeholder = {t('Search...')}
                    />
                </Filter>
            </div>

            <SmallItemTable
                nameFilter = {nameFilter}
                typeFilter = 'gun'
                fleaValue
                traderValue
                traderPrice
            />
        </div>,
    ];
};

export default Guns;