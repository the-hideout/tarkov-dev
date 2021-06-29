import { useTranslation } from 'react-i18next';

const getQuestList = (questList, t) => {
    if(questList.length === 0){
        return <div>
            {t('None')}
        </div>
    }

    return questList.map((questData) => {
        return <div
            key = {`quest-list-${questData.name}`}
        >
            <a
                href = {`https://tarkovtracker.io/quest/${questData.id}/`}
            >
                {questData.name}
            </a>
        </div>;
    })
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