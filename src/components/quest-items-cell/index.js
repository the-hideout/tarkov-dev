import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import ItemImage from '../item-image';

import './index.css';

const rewardMap = {
    finishRewards: 'On Task Completion',
    startRewards: 'On Task Start',
};

function QuestItemsCell({ questItems }) {
    const { t } = useTranslation();
    return questItems.map((questItem, index) => {
        return (
            <div className="quest-item-wrapper" key={`quest-item-${index}`}>
                <div className="quest-image-wrapper">
                    <ItemImage
                        item={questItem.item}
                        nonFunctionalOverlay={false}
                        isFIR={questItem.foundInRaid || questItem.rewardType}
                        imageField="iconLink"
                        linkToItem={true}
                    />
                </div>
                <div className="quest-item-text-wrapper">
                    <Link to={`/item/${questItem.item.normalizedName}`}>{questItem.item.name}</Link>
                    <div className="amount-wrapper">
                        {t('Amount')}
                        <span>:</span> {questItem.count.toLocaleString()}
                    </div>
                    <div className="reward-type-wrapper">{t(rewardMap[questItem.rewardType])}</div>
                </div>
            </div>
        );
    });
}

export default QuestItemsCell;
