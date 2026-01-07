import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon } from '@mdi/react';
import {mdiGasCylinder} from '@mdi/js';

import SEO from '../../../components/SEO.jsx';
import { Filter, InputFilter, ToggleFilter } from '../../../components/filter/index.jsx';
import SmallItemTable from '../../../components/small-item-table/index.jsx';

import QueueBrowserTask from '../../../modules/queue-browser-task.js';

function Grenades() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [showAllItemSources, setShowAllItemSources] = useState(false);
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
        <SEO 
            title={`${t('Grenades')} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('grenades-page-description', 'This page includes a sortable table with information on the different types of grenades available in the game, including their price, damage, and other characteristics.')}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Escape from Tarkov')}
                    <Icon path={mdiGasCylinder} size={1.5} className="icon-with-text" /> 
                    {t('Grenades')}
                </h1>
                <Filter center>
                    <ToggleFilter
                        checked={showAllItemSources}
                        label={t('Ignore settings')}
                        onChange={(e) =>
                            setShowAllItemSources(!showAllItemSources)
                        }
                        tooltipContent={
                            <>
                                {t('Shows all sources of items regardless of your settings')}
                            </>
                        }
                    />
                    <InputFilter
                        defaultValue={nameFilter}
                        onChange={handleNameFilterChange}
                        placeholder={t('filter on item')}
                    />
                </Filter>
            </div>

            <SmallItemTable
                nameFilter={nameFilter}
                typeFilter="grenade"
                showAllSources={showAllItemSources}
                traderValue={1}
                fleaValue={2}
                cheapestPrice={3}
            />

            <div className="page-wrapper grenades-page-wrapper">
                {/* prettier-ignore */}
                <Trans i18nKey={'grenades-page-p'}>
                    <p>
                        {"There are only a handful distinct types of grenades that may be thrown or launched in Escape from Tarkov, and each one has a unique effect: flash, smokes, high explosive, and fragmentation."}
                        <br/>
                        {"Grenades are situational, but when utilized properly, they can have deadly results. Any advantage from high-tier equipment can be fully negated by a single well-thrown grenade, whether it completely blinds the adversary, kills them instantly, or forces them out of cover and into your gunfire."}
                        <br/>
                        {"Five factors to think about while using throwable grenades include the fuse time, explosion radius, fragment damage, fragment count, and even the weight of the grenade. With specific uses arising from each component."}
                    </p>
                </Trans>
            </div>
        </div>,
    ];
}

export default Grenades;
