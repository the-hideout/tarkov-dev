import { useTranslation } from 'react-i18next';

import QuestItemsCell from '../quest-items-cell';
import './index.css';

const getQuestList = (questList, t) => {
    if(questList.length === 0){
        return <div>
            {t('None')}
        </div>
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
                    {questList.map((questData) => {
                        return <tr
                            key = {`quest-list-${questData.name}`}
                        >
                            <td>
                                <a
                                    className = "quest-name-wrapper"
                                    href = {`https://tarkovtracker.io/quest/${questData.id}/`}
                                >
                                    <img
                                        className = 'quest-giver-image'
                                        src={`${ process.env.PUBLIC_URL }/images/${questData.giver.locale.en.toLowerCase()}-icon.jpg`}
                                        alt={questData.giver.locale.en}
                                    />
                                    <div>
                                        {questData.name}
                                    </div>
                                </a>
                            </td>
                            <td>
                                <QuestItemsCell
                                    questItems = {questData.objectives}
                                />
                            </td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    );
};

function QuestsList(props) {
    const {itemQuests} = props;
    const {t} = useTranslation();

    return <div>
        <h2>
            {t('Quests')}
        </h2>
        {
            getQuestList(itemQuests, t)
        }
    </div>
};

export default QuestsList;
