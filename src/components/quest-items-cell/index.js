import { useTranslation } from 'react-i18next';

import './index.css';

function QuestItemsCell({ questItems }) {
    const { t } = useTranslation();
    return questItems.map((questItem, index) => {
        return (
            <div className="quest-item-wrapper" key={`quest-item-${index}`}>
                <div className="quest-image-wrapper">
                    <img
                        alt={questItem.name}
                        loading="lazy"
                        height="34"
                        width="34"
                        src={questItem.iconLink}
                    />
                </div>
                <div className="quest-item-text-wrapper">
                    {questItem.name}
                    <div className="amount-wrapper">
                        {t('Amount')}: {questItem.amount}
                    </div>
                    <div
                        className={`found-in-raid-wrapper ${questItem.findInRaid ? 'find-in-raid' : ''}`}>
                        {t('Found In Raid')}<span>:</span> <span>{questItem.findInRaid ? t('Yes') : t('No')}</span>
                    </div>
                </div>
            </div>
        );
    });
}

export default QuestItemsCell;
