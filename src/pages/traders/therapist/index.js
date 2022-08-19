import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import useStateWithLocalStorage from '../../../hooks/useStateWithLocalStorage';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
} from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';
import QueueBrowserTask from '../../../modules/queue-browser-task';
import TraderResetTime from '../../../components/trader-reset-time';

function Therapist() {
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [selectedTable, setSelectedTable] = useStateWithLocalStorage(
        'therapistSelectedTable',
        'level',
    );
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
        <Helmet key={'therapist-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Therapist Items')}</title>
            <meta
                name="description"
                content={`All Therapist items and barters in Escape from Tarkov`}
            />
        </Helmet>,
        <div className="page-wrapper" key={'page-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {t('Therapist Items')}
                    <cite>
                        <TraderResetTime trader="therapist" />
                    </cite>
                </h1>
                <Filter center>
                    <ButtonGroupFilter>
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {t(
                                        'Items with the best cash back prices for leveling when buying from flea',
                                    )}
                                </>
                            }
                            selected={selectedTable === 'level'}
                            content={t('Spending')}
                            type="text"
                            onClick={setSelectedTable.bind(undefined, 'level')}
                        />
                    </ButtonGroupFilter>
                    <ButtonGroupFilter>
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {`${t('Unlocks at Loyalty Level')} 1`}
                                </>
                            }
                            selected={selectedTable === 1}
                            content={'I'}
                            onClick={setSelectedTable.bind(undefined, 1)}
                        />
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {`${t('Unlocks at Loyalty Level')} 2`}
                                </>
                            }
                            selected={selectedTable === 2}
                            content={'II'}
                            onClick={setSelectedTable.bind(undefined, 2)}
                        />
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {`${t('Unlocks at Loyalty Level')} 3`}
                                </>
                            }
                            selected={selectedTable === 3}
                            content={'III'}
                            onClick={setSelectedTable.bind(undefined, 3)}
                        />
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {`${t('Unlocks at Loyalty Level')} 4`}
                                </>
                            }
                            selected={selectedTable === 4}
                            content={'IV'}
                            onClick={setSelectedTable.bind(undefined, 4)}
                        />
                    </ButtonGroupFilter>
                    <InputFilter
                        defaultValue={nameFilter}
                        onChange={handleNameFilterChange}
                        placeholder={t('Search...')}
                    />
                </Filter>
            </div>

            <SmallItemTable
                nameFilter={nameFilter}
                traderFilter="therapist"
                loyaltyLevelFilter={
                    Number.isInteger(selectedTable) ? selectedTable : false
                }
                traderPrice={selectedTable === 'level' ? false : true}
                fleaValue
                traderValue
                fleaPrice
                traderBuyback={selectedTable === 'level' ? true : false}
                traderBuybackFilter={selectedTable === 'level' ? true : false}
                maxItems={selectedTable === 'level' ? 50 : false}

                // instaProfit = {selectedTable === 'instaProfit' ? true : false}
                // maxItems = {selectedTable === 'instaProfit' ? 50 : false}
            />

            <div className="page-wrapper" style={{ minHeight: 0 }}>
                <p>
                    {"Background:"}<br/>
                    {"Head of the Trauma Care Department of the Tarkov Central City Hospital."}
                </p>
            </div>
        </div>,
    ];
}

export default Therapist;
