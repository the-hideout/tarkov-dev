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
                                    href = {`https://tarkovtracker.io/quest/${questData.id}/`}
                                >
                                    {questData.name}
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
