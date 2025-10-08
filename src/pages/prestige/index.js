import { useMemo, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ImageViewer from 'react-simple-image-viewer';

import { Icon } from '@mdi/react';
import { 
    mdiFormatListCheckbox,
    mdiGift,
    mdiRedo,
    mdiArrowLeftBold,
    mdiArrowRightBold,
} from '@mdi/js';

import SEO from '../../components/SEO.jsx';
import ErrorPage from '../error-page/index.js';
import PropertyList from '../../components/property-list/index.js';

import useQuestsData, { usePrestigeData, useAchievementsData } from '../../features/quests/index.js';
import useTradersData from '../../features/traders/index.js';
import useItemsData, { useHandbookData } from '../../features/items/index.js';
import useMapsData from '../../features/maps/index.js';
import useHideoutData from '../../features/hideout/index.js';
import useBossesData from '../../features/bosses/index.js';

import { TaskObjective, TaskRewards } from '../../modules/task-elements.mjs';
import ItemImage from '../../components/item-image/index.js';

import './index.css';

function Prestige() {
    const settings = useSelector((state) => state.settings[state.settings.gameMode]);
    const gameMode = useSelector(state => state.settings.gameMode);
    const { prestigeLevel } = useParams();
    const { t } = useTranslation();

    const loadingData = useMemo(() => {
        return {
            name: t('Loading...'),
            prestigeLevel: '',
            conditions: [],
            objectives: [],
            rewards: [],
            transferSettings: [],
        };
    }, [t]);

    const { data: traders } = useTradersData();

    const { data: items } = useItemsData();

    const { data: maps } = useMapsData();

    const { data: prestiges, status: prestigesStatus } = usePrestigeData();

    const { data: quests } = useQuestsData();

    const { data: achievements } = useAchievementsData();

    const { data: stations } = useHideoutData();

    const { data: bosses } = useBossesData();

    const { data: handbook } = useHandbookData();

    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const openImageViewer = useCallback(() => {
        setIsViewerOpen(true);
        }, []);
    const closeImageViewer = () => {
        setIsViewerOpen(false);
    };
    const backgroundStyle = {
        backgroundColor: 'rgba(0,0,0,.9)',
        zIndex: 20,
    };

    const currentPrestige = useMemo(() => {
        const p = prestiges.find((prestige) => {
            return String(prestige.prestigeLevel) === prestigeLevel;
        });
        if (!p && (prestigesStatus === 'idle' || prestigesStatus === 'loading')) {
            return loadingData;
        }
        return p;

    }, [prestiges, prestigesStatus, prestigeLevel, loadingData]);

    const prevPrestige = useMemo(() => {
        if (!currentPrestige || currentPrestige.prestigeLevel === '' || currentPrestige.prestigeLevel === 1) {
            return;
        }
        const prev = prestiges.find(p => p.prestigeLevel === currentPrestige.prestigeLevel - 1);
        if (!prev) {
            return;
        }
        return (
            <div className="related-quests" key={'prev-prestige'}>
                <h3><Icon path={mdiArrowLeftBold} size={1} className="icon-with-text" /> {t('Previous Prestige')}</h3>
                <div key={`req-task-${prev.id}`}>
                    <Link to={`/prestige/${prev.prestigeLevel}`}><img src={prev.iconLink} alt="" className="prestige-icon"/>{prev.name}</Link>
                </div>
            </div>
        );
    }, [currentPrestige, prestiges, t]);

    const nextPrestige = useMemo(() => {
        if (prestiges.length < 1) {
            return;
        }
        const maxPrestige = prestiges[prestiges.length - 1];
        if (!currentPrestige || currentPrestige.prestigeLevel === '' || currentPrestige.prestigeLevel >= maxPrestige.prestigeLevel) {
            return;
        }
        const next = prestiges.find(p => p.prestigeLevel === currentPrestige.prestigeLevel + 1);
        if (!next) {
            return;
        }
        return (
            <div className="related-quests" key={'next-prestige'}>
                <h3><Icon path={mdiArrowRightBold} size={1} className="icon-with-text" /> {t('Next Prestige')}</h3>
                <div key={`req-task-${next.id}`}>
                    <Link to={`/prestige/${next.prestigeLevel}`}><img src={next.iconLink} alt="" className="prestige-icon"/>{next.name}</Link>
                </div>
            </div>
        );
    }, [currentPrestige, prestiges, t]);

    const gameModeWarning = useMemo(() => {
        if (gameMode === 'regular') {
            return '';
        }
        return <p className="game-mode-warning">{t(`Prestige conditions may not display properly while viewing in {{gameModeName}} mode.`, {gameModeName: t(`game_mode_${gameMode}`)})}</p>
    }, [gameMode, t]);

    const stashTransferSettings = useMemo(() => {
        const stashTransfer = currentPrestige?.transferSettings.find(t => !!t.itemFilters);
        if (!stashTransfer) {
            return '';
        }
        return <>
            <h3>{t('Item Transfer')}: {`${stashTransfer.gridWidth} x ${stashTransfer.gridHeight}`}</h3>
            <div key="item-transfer-settings">
                <h4>{t('Allowed Categories')}</h4>
                <ul>
                    {stashTransfer.itemFilters.allowedCategories.map(allowedCat => {
                        const category = handbook.itemCategories.find(cat => cat.id === allowedCat.id);
                        if (!category) {
                            return false;
                        }
                        if (stashTransfer.itemFilters.excludedCategories.some(excludedCat => category.id === excludedCat.id)) {
                            return false;
                        }
                        return category;
                    }).filter(Boolean).sort((a,b) => a.name.localeCompare(b.name)).map((category, index) => {
                        return <li key={`allowed-category-${index}`}><Link to={`/items/${category.normalizedName}`}>{category.name}</Link></li>
                    })}
                </ul>
                <h4>{t('Allowed Items')}</h4>
                <ul className="quest-item-list">
                    {stashTransfer.itemFilters.allowedItems.map(allowedItem => {
                        const item = items.find(it => it.id === allowedItem.id);
                        if (!item) {
                            return false;
                        }
                        if (stashTransfer.itemFilters.excludedItems.some(excludedItem => excludedItem.id === item.id)) {
                            return false;
                        }
                        if (stashTransfer.itemFilters.excludedCategories.some(excludedCat => item.categories.some(cat => cat.id === excludedCat.id))) {
                            return false;
                        }
                        return item;
                    }).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)).map((item, index) => {
                        return <li
                            key={`allowed-item-${item.id}-${index}`}
                        >
                            <ItemImage
                                key={`allowed-item-${item.id}-${index}`}
                                item={item}
                                imageField="baseImageLink"
                                linkToItem={true}
                            />
                        </li>
                    })}
                </ul>
                {!!stashTransfer.itemFilters.excludedItems.length && (<>
                    <h4>{t('Excluded Items')}</h4>
                    <ul className="quest-item-list">
                        {stashTransfer.itemFilters.excludedItems.map(excludedItem => {
                            const item = items.find(it => it.id === excludedItem.id);
                            if (!item) {
                                return false;
                            }
                            return item;
                        }).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)).map((item, index) => {
                            return <li
                                key={`excluded-item-${item.id}-${index}`}
                            >
                                <ItemImage
                                    key={`excluded-item-${item.id}-${index}`}
                                    item={item}
                                    imageField="baseImageLink"
                                    linkToItem={true}
                                />
                            </li>
                        })}
                    </ul>
                </>)}
            </div>
        </>
    }, [currentPrestige, items, t, handbook])

    if (!currentPrestige && (prestigesStatus === 'succeeded' || prestigesStatus === 'failed')) {
        return <ErrorPage />;
    }

    return [
        <SEO 
            title={`${currentPrestige.name} - ${t('Escape from Tarkov')} - ${t('Tarkov.dev')}`}
            description={t('task-page-description', 'This page includes information on the conditions and rewards for obtaining {{prestigeName}}.', { prestigeName: currentPrestige.name })}
            url={`https://tarkov.dev/prestige/${currentPrestige.prestigeLevel}`}
            key="seo-wrapper"
        />,
        <div className="display-wrapper" key={'display-wrapper'}>
            <div className={'entity-page-wrapper'} key={'quest-page-display-wrapper'}>
                <div className="entity-information-wrapper">
                  <div className="entity-top-content">
                    <div className="entity-information-images">
                        <img
                            alt={currentPrestige.name}
                            className={'entity-information-image'}
                            loading="lazy"
                            src={currentPrestige.imageLink}
                            onClick={() => openImageViewer(0)}
                        />
                    </div>
                    <div className="title-bar">
                      <span className="type">{t('Prestige')}</span>
                      <h1>{currentPrestige.name}</h1>
                        <span className="wiki-link-wrapper">
                            <a href={'https://escapefromtarkov.fandom.com/wiki/Prestige'} target="_blank" rel="noopener noreferrer">
                                {t('Wiki')}
                            </a>
                        </span>
                    </div>
                    <div className="main-content">
                      {gameModeWarning}
                    </div>
                    <div className="entity-properties">
                      <PropertyList properties={{}} />
                    </div>
                    <div className="task-connections">
                        {prevPrestige}
                        {nextPrestige}
                    </div>
                  </div>
                  <div className="entity-icon-cont">
                    <div className="entity-icon-and-link-wrapper"
                      onClick={() => openImageViewer(0)}
                      style={{ backgroundImage: `url(${currentPrestige.imageLink})` }}
                    >
                    </div>
                  </div>
                </div>
                {isViewerOpen && (
                  <ImageViewer
                    src={[currentPrestige.imageLink]}
                    currentIndex={0}
                    backgroundStyle={backgroundStyle}
                    disableScroll={true}
                    closeOnClickOutside={true}
                    onClose={closeImageViewer}
                  />
                )}
                <div className="information-section has-table">
                    <h2><Icon path={mdiFormatListCheckbox} size={1.5} className="icon-with-text" /> {t('Conditions')}</h2>
                    <div className="information-content">
                        {currentPrestige.conditions.map((objective) => {
                            return TaskObjective({objective, items, bosses, quests, traders, maps, settings, t, handbook, stations});
                        })}
                    </div>
                </div>

                {Object.keys(currentPrestige.rewards).some(r => currentPrestige.rewards[r]?.length) && (
                    <div key="task-start-rewards" className="information-section has-table">
                        <h2><Icon path={mdiGift} size={1.5} className="icon-with-text" /> {t('Rewards')}</h2>
                        <div key="task-start-rewards-content" className="information-content">
                            {TaskRewards({rewards: currentPrestige.rewards, t, items, settings, traders, stations, handbook, achievements})}
                        </div>
                    </div>
                )}
                <div className="information-section has-table">
                    <h2><Icon path={mdiRedo} size={1.5} className="icon-with-text" /> {t('Transfer Settings')}</h2>
                    <div className="information-content">
                        <h3>{t('Skill Transfer')}</h3>
                        <div key="transfer-settings-skills">
                            <ul>
                                {currentPrestige.transferSettings.filter(t => !!t.skillType).map(skillTransfer => {
                                    return <li key={`skill-transfer-${skillTransfer.skillType}`}>{skillTransfer.name}: {skillTransfer.transferRate * 100}%</li>
                                })}
                            </ul>
                        </div>
                        {stashTransferSettings}
                    </div>
                </div>
            </div>
        </div>,
    ];
}

export default Prestige;
