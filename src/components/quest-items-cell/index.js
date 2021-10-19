import './index.css';

function QuestItemsCell({ questItems }) {
    return questItems.map((questItem, index) => {
        return <div
            className = 'quest-item-wrapper'
            key = {`quest-item-${index}`}
        >
            <div
                className = 'quest-image-wrapper'
            ><img
                    alt = {questItem.name}
                    loading = 'lazy'
                    height = '34'
                    width = '34'
                    src = {questItem.iconLink}
                /></div>
            <div
                className = 'quest-item-text-wrapper'
            >
                {questItem.name}
                <div className = 'amount-wrapper'>
                    Amount: {questItem.amount}
                </div>
                <div className = {`found-in-raid-wrapper ${questItem.findInRaid ? 'find-in-raid' : ''}`}>
                    Found In Raid: {questItem.findInRaid ? 'Yes' : 'No'}
                </div>
            </div>
        </div>
    })
};

export default QuestItemsCell;
