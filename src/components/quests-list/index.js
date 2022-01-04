import { useTranslation } from 'react-i18next';

import QuestItemsCell from '../quest-items-cell';
import './index.css';

const getQuestList = (questList, t) => {
    let extraRow = false;

    if(questList.length <= 0){
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
                    {extraRow && <tr
                        className='quest-list-extra-row'
                    >
                        <td
                            colSpan={2}
                        >
                            {extraRow}
                        </td>
                    </tr>}
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
                                        alt={questData.giver.locale.en}
                                        loading='lazy'
                                        className = 'quest-giver-image'
                                        src={`${ process.env.PUBLIC_URL }/images/${questData.giver.locale.en.toLowerCase()}-icon.jpg`}
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
