import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { Filter, ToggleFilter } from '../../components/filter';
import QuestItemsCell from '../quest-items-cell';
import './index.css';

const getQuestList = (questList, t, showAll, settings) => {
    let extraRow = false;

    const shownQuests = questList.filter(quest => showAll || !settings.completedQuests.some(stringId => parseInt(stringId) === quest.tarkovDataId));
    if (questList.length <= 0) {
        extraRow = t('No quest requires this item');
    } else if (questList.length !== shownQuests.length) {
        extraRow = (
            <>
                {t('Some completed quests hidden by ')}<Link to="/settings/">{t('your settings')}</Link>
            </>
        );
    }

    return (
        <div className="quest-list table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>{t('Quest')}</th>
                        <th>{t('Item')}</th>
                    </tr>
                </thead>
                <tbody>
                    {extraRow && (
                        <tr className="quest-list-extra-row">
                            <td colSpan={2}>{extraRow}</td>
                        </tr>
                    )}
                    {shownQuests.map((questData) => {
                        return (
                            <tr key={`quest-list-${questData.id}`}>
                                <td>
                                    <div className="quest-link-wrapper">
                                        <Link
                                            to={`/traders/${questData.trader.normalizedName}`}
                                        >
                                            <img
                                                alt={questData.trader.name}
                                                loading="lazy"
                                                className="quest-giver-image"
                                                src={`${
                                                    process.env.PUBLIC_URL
                                                }/images/${questData.trader.normalizedName}-icon.jpg`}
                                            />
                                        </Link>
                                        <a
                                            className="quest-name-wrapper"
                                            href={`https://tarkovtracker.io/quest/${questData.tarkovDataId}/`}
                                        >
                                            <div>{questData.name + (questData.factionName !== 'Any' ? ` (${questData.factionName})` : '') }</div>
                                        </a>
                                    </div>
                                </td>
                                <td>
                                    <QuestItemsCell
                                        questItems={questData.neededItems || questData.rewardItems}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

function QuestsList(props) {
    const { itemQuests } = props;
    const { t } = useTranslation();
    const [showAllQuests, setShowAllQuests] = useState(false);
    const settings = useSelector((state) => state.settings);
    let title = t('Quests Requiring');
    if (itemQuests.length > 0 && itemQuests[0].rewardItems) title = t('Quests Providing');
    let toggleFilter = '';
    if (settings.completedQuests?.length > 0) toggleFilter = (
        <Filter>
            <ToggleFilter
                checked={showAllQuests}
                label={t('Show completed')}
                onChange={(e) =>
                    setShowAllQuests(!showAllQuests)
                }
                tooltipContent={
                    <div>
                        {t(
                            'Shows all quests regardless of if you\'ve completed them',
                        )}
                    </div>
                }
            />
        </Filter>
    );
    return (
        <div>
            <div className="item-quest-headline-wrapper">
                <h2>
                    {title}
                </h2>
                {toggleFilter}
            </div>
            {getQuestList(itemQuests, t, showAllQuests, settings)}
        </div>
    );
}

export default QuestsList;
