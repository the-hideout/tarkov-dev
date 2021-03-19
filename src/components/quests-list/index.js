const getQuestList = (questList) => {
    if(questList.length === 0){
        return <div>
            None
        </div>
    }

    return questList.map((questData) => {
        return <div
            key = {`quest-list-${questData.name}`}
        >
            <a
                href = {questData.wikiLink}
            >
                {questData.name}
            </a>
        </div>;
    })
};

function QuestsList(props) {
    const {itemQuests} = props;

    return <div>
        <h2>
            Quests
        </h2>
        {
            getQuestList(itemQuests)
        }
    </div>
};

export default QuestsList;