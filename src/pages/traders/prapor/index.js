import { useCallback, useState } from 'react';
import {Helmet} from 'react-helmet';

import useStateWithLocalStorage from '../../../hooks/useStateWithLocalStorage';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
} from '../../../components/filter';
import SmallItemTable from '../../../components/small-item-table';
import QueueBrowserTask from '../../../modules/queue-browser-task';

function Prapor() {
    const defaultQuery = new URLSearchParams(window.location.search).get('search');
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [selectedTable, setSelectedTable] = useStateWithLocalStorage('praporSelectedTable', 'level');

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
            key = {'prapor-helmet'}
        >
            <meta charSet="utf-8" />
            <title>
                {`Tarkov Tools - Escape from Tarkov`}
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
                    Escape from Tarkov Prapor items
                </h1>
                <Filter
                    center
                >
                    <ButtonGroupFilter>
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <div>
                                    {'Items with the best cash back prices for leveling when buying from flea'}
                                </div>
                            }
                            selected = { selectedTable === 'level' }
                            content = { 'Spending' }
                            type = 'text'
                            onClick={setSelectedTable.bind(undefined, 'level')}
                        />
                    </ButtonGroupFilter>
                    <ButtonGroupFilter>
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <div>
                                    {'Unlocks at Loyalty Level 1'}
                                </div>
                            }
                            selected = { selectedTable === 1 }
                            content = { 'I' }
                            onClick={setSelectedTable.bind(undefined, 1)}
                        />
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <div>
                                    {'Unlocks at Loyalty Level 2'}
                                </div>
                            }
                            selected = { selectedTable === 2 }
                            content = { 'II' }
                            onClick={setSelectedTable.bind(undefined, 2)}
                        />
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <div>
                                    {'Unlocks at Loyalty Level 3'}
                                </div>
                            }
                            selected = { selectedTable === 3 }
                            content = { 'III' }
                            onClick={setSelectedTable.bind(undefined, 3)}
                        />
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <div>
                                    {'Unlocks at Loyalty Level 4'}
                                </div>
                            }
                            selected = { selectedTable === 4 }
                            content = { 'IV' }
                            onClick={setSelectedTable.bind(undefined, 4)}
                        />
                    </ButtonGroupFilter>
                    <InputFilter
                        defaultValue = {nameFilter}
                        onChange = {handleNameFilterChange}
                        placeholder = 'Search...'
                    />
                </Filter>
            </div>
            <SmallItemTable
                nameFilter = {nameFilter}
                traderFilter = 'prapor'
                loyaltyLevelFilter = {Number.isInteger(selectedTable) ? selectedTable : false}
                traderPrice = {selectedTable === 'level' ? false : true}
                fleaValue
                traderValue
                fleaPrice
                traderBuyback = {selectedTable === 'level' ? true : false}
                traderBuybackFilter = {selectedTable === 'level' ? true : false}


                // instaProfit = {selectedTable === 'instaProfit' ? true : false}
                // maxItems = {selectedTable === 'instaProfit' ? 50 : false}
            />
        </div>,
    ];
};

export default Prapor;