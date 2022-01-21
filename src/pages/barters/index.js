import {useState} from 'react';
import {Helmet} from 'react-helmet';
import { useTranslation } from 'react-i18next';

import BartersTable from '../../components/barters-table';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage'
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter,
} from '../../components/filter';
import capitalizeTheFirstLetterOfEachWord from '../../modules/capitalize-first';

import Icon from '@mdi/react'
import { mdiAccountSwitch } from '@mdi/js';

import './index.css';

const traders = [
    'prapor',
    'therapist',
    'skier',
    'peacekeeper',
    'mechanic',
    'ragman',
    'jaeger',
];

function Barters() {
    const defaultQuery = new URLSearchParams(window.location.search).get('search');
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [selectedTrader, setSelectedTrader] = useStateWithLocalStorage('selectedTrader', 'all');
    const [hideDogtags, setHideDogtags] = useStateWithLocalStorage('hideDogtagBarters', true);
    const {t} = useTranslation();

    return [
        <Helmet
            key = {'loot-tier-helmet'}
        >
            <meta
                charSet='utf-8'
            />
            <title>
                Escape from Tarkov barter profits
            </title>
            <meta
                name = 'description'
                content = 'Escape from Tarkov barter profits'
            />
        </Helmet>,
        <div
            className = 'barters-headline-wrapper'
            key = 'barters-headline'
        >
            <h1
                className = 'barters-page-title'
            >
                <Icon
                    path={mdiAccountSwitch}
                    size={1.5}
                    className = 'icon-with-text'
                />
                {t('Barter profits')}
            </h1>
            <Filter>
                <ToggleFilter
                    checked = {hideDogtags}
                    label = {t('Hide dogtags')}
                    onChange = {e => setHideDogtags(!hideDogtags)}
                    tooltipContent = {
                        <div>
                            {t('Dogtags are very hard to calulcate values for as they depend on level. Most calculations with them are wrong')}
                        </div>
                    }
                />
                <ButtonGroupFilter>
                    {traders.map((traderName) => {
                        return <ButtonGroupFilterButton
                            key = {`trader-tooltip-${traderName}`}
                            tooltipContent = {
                                <div>
                                    {capitalizeTheFirstLetterOfEachWord(traderName.replace('-', ' '))}
                                </div>
                            }
                            selected = {traderName === selectedTrader}
                            content = {<img
                                alt = {traderName}
                                loading='lazy'
                                title = {traderName}
                                src={`${process.env.PUBLIC_URL}/images/${traderName}-icon.jpg`}
                            />}
                            onClick = {setSelectedTrader.bind(undefined, traderName)}
                        />
                    })}
                    <ButtonGroupFilterButton
                        tooltipContent = {
                            <div>
                                {t('Show all barters')}
                            </div>
                        }
                        selected = {selectedTrader === 'all'}
                        content = {t('All')}
                        onClick = {setSelectedTrader.bind(undefined, 'all')}
                    />
                </ButtonGroupFilter>
                <InputFilter
                    defaultValue = {nameFilter || ''}
                    label = {t('Item filter')}
                    type = {'text'}
                    placeholder = {t('filter on item')}
                    onChange = {e => setNameFilter(e.target.value)}
                />
            </Filter>
        </div>,
        <BartersTable
            nameFilter = {nameFilter}
            selectedTrader = {selectedTrader}
            key = 'barters-page-barters-table'
            removeDogtags = {hideDogtags}
        />
    ];
};

export default Barters;