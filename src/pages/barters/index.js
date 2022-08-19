import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import BartersTable from '../../components/barters-table';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
    ToggleFilter,
} from '../../components/filter';
import capitalizeTheFirstLetterOfEachWord from '../../modules/capitalize-first';

import Icon from '@mdi/react';
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
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [selectedTrader, setSelectedTrader] = useStateWithLocalStorage(
        'selectedTrader',
        'all',
    );
    const [hideDogtags, setHideDogtags] = useStateWithLocalStorage(
        'hideDogtagBarters',
        true,
    );
    const { t } = useTranslation();

    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('Escape from Tarkov')} - {t('Barter Profits')}</title>
            <meta name="description" content="Barter Profits" />
        </Helmet>,
        <div className={'page-wrapper'} key="barters-page-wrapper">
            <div className="barters-headline-wrapper" key="barters-headline">
                <h1 className="barters-page-title">
                    <Icon path={mdiAccountSwitch} size={1.5} className="icon-with-text"/>
                    {t('Barter Profits')}
                </h1>
                <Filter>
                    <ToggleFilter
                        checked={hideDogtags}
                        label={t('Hide dogtags')}
                        onChange={(e) => setHideDogtags(!hideDogtags)}
                        tooltipContent={
                            <>
                                {t(
                                    'Dogtags are very hard to calulcate values for as they depend on level. Most calculations with them are wrong',
                                )}
                            </>
                        }
                    />
                    <ButtonGroupFilter>
                        {traders.map((traderName) => {
                            return (
                                <ButtonGroupFilterButton
                                    key={`trader-tooltip-${traderName}`}
                                    tooltipContent={
                                        <>
                                            {t(capitalizeTheFirstLetterOfEachWord(
                                                traderName.replace('-', ' '),
                                            ))}
                                        </>
                                    }
                                    selected={traderName === selectedTrader}
                                    content={
                                        <img
                                            alt={traderName}
                                            loading="lazy"
                                            title={traderName}
                                            src={`${process.env.PUBLIC_URL}/images/${traderName}-icon.jpg`}
                                        />
                                    }
                                    onClick={setSelectedTrader.bind(
                                        undefined,
                                        traderName,
                                    )}
                                />
                            );
                        })}
                        <ButtonGroupFilterButton
                            tooltipContent={<>{t('Show all barters')}</>}
                            selected={selectedTrader === 'all'}
                            content={t('All')}
                            onClick={setSelectedTrader.bind(undefined, 'all')}
                        />
                    </ButtonGroupFilter>
                    <InputFilter
                        defaultValue={nameFilter || ''}
                        label={t('Item filter')}
                        type={'text'}
                        placeholder={t('filter on item')}
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
                </Filter>
            </div>

            <BartersTable
                nameFilter={nameFilter}
                selectedTrader={selectedTrader}
                key="barters-page-barters-table"
                removeDogtags={hideDogtags}
            />

            <div className="page-wrapper barters-page-wrapper">
                <p>
                    {"Except for Fence, every trader in Escape from Tarkov offers goods by barter rather than for purchase outright."}<br/>
                    <br/>
                    {"In exchange for a variety of inexpensive things, the player can frequently trade them for more valuable objects that can be utilized or sold for a profit or higher level gear at lower loyalty levels."}<br/>
                    <br/>
                    {"Be sure to check back after reset for your favorite transactions because the majority of these valued trades have strict limits per trader reset and frequently sell out."}
                </p>
            </div>
        </div>,
    ];
}

export default Barters;
