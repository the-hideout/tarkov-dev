import { useCallback, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
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
import { selectAllTraders, fetchTraders } from '../../../features/traders/tradersSlice';
import ErrorPage from '../../../components/error-page';

const descriptions = {
    jaeger: "Before the conflict, he worked as a hunter in the Priozersk Natural Reserve under the State Hunting Service. A professional hunter and survival specialist. Even now, he still guards the reserve's hunting grounds from various aggressive individuals.",
    mechanic: "A former chemical plant foreman, who from the very beginning of the conflict took to weapon modification, repairs, and maintenance of complex equipment and technology. He prefers clandestine solo living and operates discreetly, while placing complicated and challenging tasks above all else.",
    peacekeeper: "UN peacekeeping Force supply officer, based in one of the central checkpoints leading to the Tarkov port zone. The blue helmets have been seen poking their heads into small deals from the very beginning of the conflict, buying everything of value in exchange for western weapons, ammo, and all kinds of military equipment.",
    prapor: "The Warrant officer in charge of supply warehouses on the sustaining base enforcing the Norvinsk region blockade. Secretly supplied the BEAR PMC operators with weapons, ammunition, and various other provisions he had at his disposal during the Contract Wars.",
    ragman: "Previously, he worked as a director in a shopping center located in the suburbs of Tarkov. Now dealing in mostly clothing- and gear-related items, anywhere from sunglasses to body armor.",
    skier: "Previously a port zone customs terminal employee, who initially oversaw dealings of the terminal's goods. Over the course of the conflict, he put together a gang of thugs in order to grab everything of value that he could lay his hands on in the vicinity of the terminal.",
    therapist: "Head of the Trauma Care Department of the Tarkov Central City Hospital.",
};

const romanLevels = {
    0: '0',
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
    10: 'X'
};

function Trader() {
    const { traderName } = useParams();
    const defaultQuery = new URLSearchParams(window.location.search).get(
        'search',
    );
    const [nameFilter, setNameFilter] = useState(defaultQuery || '');
    const [selectedTable, setSelectedTable] = useStateWithLocalStorage(
        `${traderName}SelectedTable`,
        'level',
    );
    //const [showAllTraders, setShowAllTraders] = useState(false);
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
    const dispatch = useDispatch();
    const traders = useSelector(selectAllTraders);
    const tradersStatus = useSelector((state) => {
        return state.traders.status;
    });
    useEffect(() => {
        let timer = false;
        if (tradersStatus === 'idle') {
            dispatch(fetchTraders());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchTraders());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [tradersStatus, dispatch]);

    if (traders.length === 0) 
        return loadingPage(traderName, t);
    
    const trader = traders.find(tr => tr.normalizedName === traderName);
    if (!trader) 
        return <ErrorPage />;
    
    return [
        <Helmet key={`${traderName}-helmet`}>
            <meta charSet="utf-8" />
            <title>{trader.name} {t('Items')}</title>
            <meta
                name="description"
                content={`All ${trader.name} items and barters in Escape from Tarkov`}
            />
        </Helmet>,
        <div className="page-wrapper" key={'page-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {trader.name} {t('Items')}
                    <cite>
                        <TraderResetTime timestamp={trader.resetTime} />
                    </cite>
                </h1>
                <Filter center>
                    <ButtonGroupFilter>
                        <ButtonGroupFilterButton
                            tooltipContent={
                                <>
                                    {t('Items with the best cash back prices for leveling when buying from flea')}
                                </>
                            }
                            selected={selectedTable === 'level'}
                            content={t('Spending')}
                            type="text"
                            onClick={setSelectedTable.bind(undefined, 'level')}
                        />
                    </ButtonGroupFilter>
                    <ButtonGroupFilter>
                        {trader.levels.map(level => (
                            <ButtonGroupFilterButton
                                key={level.level}
                                tooltipContent={
                                    <>
                                        {`${t('Unlocks at Loyalty Level')} ${level.level}`}
                                    </>
                                }
                                selected={selectedTable === level.level}
                                content={romanLevels[level.level]}
                                onClick={setSelectedTable.bind(undefined, level.level)}
                            />
                        ))}
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
                traderFilter={traderName}
                loyaltyLevelFilter={Number.isInteger(selectedTable) ? selectedTable : false}
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
                    {descriptions[traderName]}
                </p>
            </div>
        </div>,
    ];
}

const loadingPage = (traderName, t) => {
    const capitalized = traderName.charAt(0).toUpperCase() + traderName.slice(1);
    return [
        <Helmet key={`${traderName}-helmet`}>
            <meta charSet="utf-8" />
            <title>{capitalized+' '+t('Items')}</title>
            <meta
                name="description"
                content={`All ${capitalized} items and barters in Escape from Tarkov`}
            />
        </Helmet>,
        <div className="page-wrapper" key={'page-wrapper'}>
            <div className="page-headline-wrapper">
                <h1>
                    {capitalized} {t('Items')}
                    <cite>
                        Loading...
                    </cite>
                </h1>
            </div>
        </div>,
    ];
};

export default Trader;
