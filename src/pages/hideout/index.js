import { useEffect } from 'react';
import {Helmet} from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';
import ItemsSummaryTable from '../../components/items-summary-table';
import { selectAllHideoutModules, fetchHideout } from '../../features/hideout/hideoutSlice';
import {
    Filter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
} from '../../components/filter';
import capitalizeTheFirstLetterOfEachWord from '../../modules/capitalize-first';

const stations = [
    'air-filtering-unit',
    'bitcoin-farm',
    'booze-generator',
    // 'christmas-tree',
    'generator',
    'heating',
    'illumination',
    'intelligence-center',
    'lavatory',
    'library',
    'medstation',
    'nutrition-unit',
    'rest-space',
    'scav-case',
    'security',
    'shooting-range',
    'solar-power',
    'stash',
    'vents',
    'water-collector',
    'workbench',
];

function Hideout() {
    const [selectedStation, setSelectedStation] = useStateWithLocalStorage('selectedStation', 'all');
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const hideout = useSelector(selectAllHideoutModules);
    const hideoutStatus = useSelector((state) => {
        return state.hideout.status;
    });

    useEffect(() => {
        let timer = false;
        if (hideoutStatus === 'idle') {
            dispatch(fetchHideout());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchHideout());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        }
    }, [hideoutStatus, dispatch]);

    return [
        <Helmet
            key = {'hideout-helmet'}
        >
            <meta charSet="utf-8" />
            <title>
                {t('Escape from Tarkov Hideout')}
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
                    {t('Escape from Tarkov Hideout')}
                </h1>
            </div>
            <Filter>
                <ButtonGroupFilter>
                    {stations.map((stationName) => {
                        return <ButtonGroupFilterButton
                            key = {`station-tooltip-${stationName}`}
                            tooltipContent={
                                <div>
                                    {capitalizeTheFirstLetterOfEachWord(stationName.replace(/-/g, ' '))}
                                </div>
                            }
                            selected = { stationName === selectedStation }
                            content = { <img
                                alt = {stationName}
                                loading='lazy'
                                title = {stationName}
                                src={`${process.env.PUBLIC_URL}/images/${stationName}-icon.png`}
                            /> }
                            onClick={setSelectedStation.bind(undefined, stationName)}
                        />
                    })}
                    <ButtonGroupFilterButton
                        tooltipContent = {
                            <div>
                                {t('Show all stations & modules')}
                            </div>
                        }
                        selected = {selectedStation === 'all'}
                        content = {t('All')}
                        onClick={setSelectedStation.bind(undefined, 'all')}
                    />
                 </ButtonGroupFilter>
            </Filter>
            {hideout.map((hideoutModule, index) => {
                if(hideoutModule.itemRequirements.length === 0){
                    return null;
                }

                if(hideoutModule.name === 'Christmas Tree'){
                    return null;
                }

                if(selectedStation && selectedStation !== 'all' && hideoutModule.name.toLowerCase().replace(/ /g, '-') !== selectedStation){
                    return null;
                }

                return <div
                    key = {`hideout-module-cost-${hideoutModule.name}-${hideoutModule.level}`}
                >
                    <h2>
                        {hideoutModule.name} {hideoutModule.level}
                    </h2>
                    <ItemsSummaryTable
                        includeItems = {hideoutModule.itemRequirements.map(itemRequirement => {
                            return {
                                ...itemRequirement.item,
                                quantity: itemRequirement.quantity,
                            };
                        })}
                    />
                </div>
            })}
        </div>,
    ];
};

export default Hideout;