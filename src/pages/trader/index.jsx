import { useCallback, useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageViewer from 'react-simple-image-viewer';
import { Icon } from '@mdi/react';
import {
    mdiArmFlex,
    mdiCashSync,
    mdiChartLine,
} from '@mdi/js';

import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';

import SEO from '../../components/SEO.jsx';
import {
    Filter,
    InputFilter,
    ButtonGroupFilter,
    ButtonGroupFilterButton,
} from '../../components/filter/index.jsx';
import SmallItemTable from '../../components/small-item-table/index.jsx';
import QuestTable from '../../components/quest-table/index.jsx';
import TraderResetTime from '../../components/trader-reset-time/index.jsx';
import ErrorPage from '../error-page/index.jsx';
import Loading from '../../components/loading/index.jsx';
import LoadingSmall from '../../components/loading-small/index.jsx';
import PropertyList from '../../components/property-list/index.jsx';
import formatPrice from '../../modules/format-price.js';

import QueueBrowserTask from '../../modules/queue-browser-task.js';

import useTradersData from '../../features/traders/index.js';

import i18n from '../../i18n.js';


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
    const [searchParams, setSearchParams] = useSearchParams();
    const [nameFilter, setNameFilter] = useState(searchParams.get('search') ?? '');
    const [selectedTable, setSelectedTable] = useStateWithLocalStorage(
        `${traderName.toLowerCase()}SelectedTable`,
        searchParams.get('tab') ?? 'spending',
    );
    useEffect(() => {
        // set local storage value on initial page load
        if (!searchParams.get('tab')) {
          return;
        }
        setSelectedTable(searchParams.get('tab'));
    }, [searchParams, setSelectedTable]);
    const { t } = useTranslation();

    const setPathFilters = useCallback((filtervalues) => {
        const params = {
            search: nameFilter,
            tab: selectedTable,
        };
        for (const paramName in filtervalues) {
            params[paramName] = filtervalues[paramName];
        }
        if (params.search === '') {
            delete params.search;
        }
        setSearchParams(params, { replace: true });
    }, [setSearchParams, nameFilter, selectedTable]);

    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const openImageViewer = useCallback(() => {
        setIsViewerOpen(true);
      }, []);
    const closeImageViewer = () => {
        setIsViewerOpen(false);
    };
    const [traderImageExtension, setTraderImageExtension] = useState('jpg');
    const backgroundStyle = {
        backgroundColor: 'rgba(0,0,0,.9)',
        zIndex: 20,
    };

    const handleNameFilterChange = useCallback(
        (e) => {
            if (typeof window !== 'undefined') {
                const name = e.target.value.toLowerCase();

                // schedule this for the next loop so that the UI
                // has time to update but we do the filtering as soon as possible
                QueueBrowserTask.task(() => {
                    setNameFilter(name);
                    setPathFilters({search: name});
                });
            }
        },
        [setNameFilter, setPathFilters],
    );

    const handleTableChange = useCallback((tableName) => {
        setSelectedTable(String(tableName));
        setPathFilters({tab: tableName});
    }, [setSelectedTable, setPathFilters]);

    const { data: traders, status } = useTradersData();
    
    const trader = useMemo(() => {
        return traders.find(tr => tr.normalizedName === traderName.toLowerCase());;
    }, [traders, traderName]);

    const traderImagePath = useMemo(() => {
      if (!trader) {
        return '';
      }
      return `${process.env.PUBLIC_URL}/images/traders/${trader.normalizedName}.${traderImageExtension}`;
    }, [trader, traderImageExtension]);

    const levelProperties = useMemo(() => {
        const props = {};
        if (!trader) {
            return props;
        }
        if (isNaN(selectedTable)) {
            return props;
        }
        const levelInfo = trader.levels.find(l => l.level === parseInt(selectedTable));
        if (levelInfo.requiredPlayerLevel > 1) {
            props.requiredPlayerLevel = {value: levelInfo.requiredPlayerLevel, label: <span>{t('Player level')} <Icon path={mdiArmFlex} size={1} className="icon-with-text"/></span>};
        }
        props.requiredReputation = {value: levelInfo.requiredReputation, label: <span>{t('Reputation')} <Icon path={mdiChartLine} size={1} className="icon-with-text"/></span>};
        if (levelInfo.requiredCommerce > 0) {
            props.requiredCommerce = {value: formatPrice(levelInfo.requiredCommerce, trader.currency.normalizedName), label: <span>{t('Commerce')} <Icon path={mdiCashSync} size={1} className="icon-with-text"/></span>};
        }
        return props;
    }, [trader, selectedTable, t]);

    const buyBackTableEnabled = useMemo(() => {
        return trader?.levels.some(l => l.requiredCommerce > 0);
    }, [trader]);

    const traderOffersTableEnabled = useMemo(() => {
        return trader?.barters.length > 0;
    }, [trader]);

    if (!trader && (status === 'idle' || status === 'loading')) {
        return <Loading/>;
    }
    if (!trader)
        return <ErrorPage />;
    
    let resetTime = (<LoadingSmall/>);
    if (trader.resetTime && trader.barters.length) {
        resetTime = (
            <TraderResetTime timestamp={trader.resetTime} locale={i18n.language} />
        );
    } else if (trader.resetTime) {
        resetTime = '';
    }
    return [
        <SEO 
            title={`${t('Trader {{trader}}', { trader: trader.name })} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('trader-page-description', 'Get the latest information on the trader {{trader}} in Escape from Tarkov. Learn about the items he sells on certain Loyalty level and how to maximize your cash back money to level Loyalty.', { trader: trader.name })}
            image={`${window.location.origin}${process.env.PUBLIC_URL}/images/traders/${trader.normalizedName}-portrait.png`}
            card='summary_large_image'
            key="seo-wrapper"
        />,
        <div className="display-wrapper">
          <div className={'entity-page-wrapper'} key={'trader-page-display-wrapper'}> 
            <div className="entity-information-wrapper">
              <div className="entity-top-content">
                <img
                  alt={trader.name}
                  className={'entity-information-icon'}
                  loading="lazy"
                  src={`${process.env.PUBLIC_URL}/images/traders/${trader.normalizedName}-portrait.png`}
                  onClick={() => openImageViewer(0)}
                />
                <div className="title-bar">
                  <span className="type">
                    {t('Trader')}
                  </span>
                  <h1>
                    {trader.name}
                  </h1>
                  <span className="wiki-link-wrapper">
                    <a href={`https://escapefromtarkov.fandom.com/wiki/${trader.normalizedName}`} target="_blank" rel="noopener noreferrer">
                      {t('Wiki')}
                    </a>
                  </span>
                </div>
                <div className="main-content">
                  <p className="entity-details">
                    {trader.description}
                  </p>
                </div>
                <div className="entity-properties">
                  <PropertyList properties={levelProperties} />
                </div>
              </div>
              <div className="entity-icon-cont">
                <div className="entity-icon-and-link-wrapper"
                  onClick={() => openImageViewer(0)}
                  style={{ backgroundImage: `url(${traderImagePath})` }}
                />
                <img src={`${traderImagePath}`} style={{display: 'none'}} alt="" onError={() => {
                  if (traderImageExtension !== 'jpg') {
                    return;
                  }
                  setTraderImageExtension('webp');
                }}/>
              </div>
            </div>

            {isViewerOpen && (
                <ImageViewer
                    src={[`${traderImagePath}`]}
                    currentIndex={0}
                    backgroundStyle={backgroundStyle}
                    disableScroll={true}
                    closeOnClickOutside={true}
                    onClose={closeImageViewer}
                />
            )}

            <div className="page-headline-wrapper">
              <h1>
                <cite>
                  {resetTime}
                </cite>
              </h1>
              <Filter center>
                {buyBackTableEnabled ? (
                  <ButtonGroupFilter>
                    <ButtonGroupFilterButton
                      tooltipContent={
                        <>
                          {t('Items with the best cash back prices for leveling')}
                        </>
                        }
                      selected={selectedTable === 'spending'}
                      content={t('Spending')}
                      type="text"
                      onClick={handleTableChange.bind(undefined, 'spending')}
                    />
                    </ButtonGroupFilter>
                  ) : ''}
                  {traderOffersTableEnabled ? (
                    <ButtonGroupFilter>
                      {trader.levels.map(level => (
                        <ButtonGroupFilterButton
                          key={level.level}
                          tooltipContent={
                            <>
                              {t('Unlocks at Loyalty Level {{level}}', { level: level.level})}
                            </>
                          }
                          selected={selectedTable === String(level.level)}
                          content={romanLevels[level.level]}
                          onClick={handleTableChange.bind(undefined, String(level.level))}
                        />
                      ))}
                    </ButtonGroupFilter>
                  ) : ''}
                  <ButtonGroupFilter>
                  <ButtonGroupFilterButton
                    tooltipContent={
                      <>
                        {t('Tasks given by {{traderName}}', {traderName: trader.name})}
                      </>
                    }
                    selected={selectedTable === 'tasks'}
                    content={t('Tasks')}
                    type="text"
                    onClick={handleTableChange.bind(undefined, 'tasks')}
                  />
                  </ButtonGroupFilter>
                  <InputFilter
                    defaultValue={nameFilter}
                    onChange={handleNameFilterChange}
                    placeholder={t('filter on item')}
                  />
              </Filter>
          </div>

          {selectedTable !== 'tasks' && (
            <SmallItemTable
              nameFilter={nameFilter}
              traderFilter={trader.normalizedName}
              loyaltyLevelFilter={isNaN(selectedTable) ? false : parseInt(selectedTable)}
              traderBuybackFilter={selectedTable === 'spending' ? true : false}
              maxItems={selectedTable === 'spending' ? 50 : false}
              fleaPrice={selectedTable === 'spending' ? false : 1}
              traderOffer={selectedTable === 'spending' ? false : 2}
              cheapestPrice={selectedTable === 'spending' ? 1 : false}
              traderValue={selectedTable === 'spending' ? 2 : false}
              traderBuyback={selectedTable === 'spending' ? 3 : false}
              sortBy={selectedTable === 'spending' ? 'traderBuyback' : null}
              sortByDesc={true}
              showAllSources={selectedTable === 'spending' ? false : true}
            />
          )}
          {selectedTable === 'tasks' && (
            <QuestTable
              giverFilter={trader.normalizedName}
              nameFilter={nameFilter}
              questRequirements={1}
              minimumLevel={2}
            />
          )}
      </div>
    </div>,
    ];
}

export default Trader;
