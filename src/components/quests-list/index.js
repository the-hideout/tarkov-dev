import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import QuestItemsCell from '../quest-items-cell';
import './index.css';

const getQuestList = (questList, t) => {
    let extraRow = false;

    if (questList.length <= 0) {
        extraRow = t('No quest requires this item');
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
                    {questList.map((questData) => {
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
    let title = t('Quests Requiring');
    if (itemQuests.length > 0 && itemQuests[0].rewardItems) title = t('Quests Providing');
    return (
        <div>
            <h2>{title}</h2>
            {getQuestList(itemQuests, t)}
        </div>
    );
}

export default QuestsList;
