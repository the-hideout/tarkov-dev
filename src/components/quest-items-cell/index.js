import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import './index.css';

const rewardMap = {
    finishRewards: 'On Task Completion',
    startRewards: 'On Task Start'
};

const foundInRaidPart = (questItem, t) => {
    if (!questItem.rewardType) {
        return <div
            className={`found-in-raid-wrapper ${
                questItem.foundInRaid ? 'find-in-raid' : ''
            }`}
        >
            {t('Found In Raid')}
            <span>:</span>{' '}
            <span>{questItem.foundInRaid ? t('Yes') : t('No')}</span>
        </div>
    }
    return <div className={`found-in-raid-wrapper`}>
        {
        // t('On Task Completion')
        // t('On Task Start')
        }
        {t(rewardMap[questItem.rewardType])}
    </div>
};

function QuestItemsCell({ questItems }) {
    const { t } = useTranslation();
    return questItems.map((questItem, index) => {
        return (
            <div className="quest-item-wrapper" key={`quest-item-${index}`}>
                <div className="quest-image-wrapper">
                    <img
                        alt={questItem.item.name}
                        loading="lazy"
                        src={questItem.item.iconLink}
                    />
                </div>
                <div className="quest-item-text-wrapper">
                    <Link to={`/item/${questItem.item.normalizedName}`}>
                        {questItem.item.name}
                    </Link>
                    <div className="amount-wrapper">
                        {t('Amount')}
                        <span>:</span> {questItem.count}
                    </div>
                    {foundInRaidPart(questItem, t)}
                </div>
            </div>
        );
    });
}

export default QuestItemsCell;
