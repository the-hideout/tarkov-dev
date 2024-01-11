import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import useHideoutData from '../../features/hideout/index.js';

import './index.css';

function ItemsForHideout(props) {
    const { itemFilter, showAll } = props;
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings);

    const { data: hideout } = useHideoutData();

    // Data manipulation section
    const data = useMemo(() => {
        return hideout.reduce((acc, curr) => {
            curr.levels.map((level) => {
                return acc.push(
                    ...level.itemRequirements
                    .filter((c) => {
                        if (!c) {
                            return false;
                        }

                        return c.item.id === itemFilter;
                    })
                    .map((c) => {
                        return {
                            ...c,
                            moduleName: curr.name,
                            normalizedName: curr.normalizedName,
                            level: level.level,
                        };
                    }),
                )
            });

            return acc;
        }, []);
    }, [hideout, itemFilter]);

    // Visual rendering section

    // if (data.length <= 0) {
    //     return <div>
    //         {t('None')}
    //     </div>
    // }

    const unbuilt = useMemo(() => {
        return data.filter(module => settings[module.normalizedName] < module.level);
    }, [data, settings]);

    let extraRow = false;

    if (data.length <= 0) {
        extraRow = t('No hideout modules requires this item');
    } else if (unbuilt.length !== data.length && !showAll) {
        extraRow = (
            <>
                {t('No unbuilt hideout modules for selected filters but some were hidden by ')}<Link to="/settings/">{t('your settings')}</Link>
            </>
        );
    }

    let displayList = showAll ? data : unbuilt;

    return (
        <div className="table-wrapper">
            <table className="hideout-item-list">
                <thead>
                    <tr className="hideout-item-list-row">
                        <th>{t('Hideout Module')}</th>
                        <th>{t('Item')}</th>
                    </tr>
                </thead>
                <tbody>
                    {extraRow && (
                        <tr className="hideout-item-list-row hideout-item-list-extra-row">
                            <td
                                colSpan={2}
                                className="hideout-item-list-column"
                            >
                                {extraRow}
                            </td>
                        </tr>
                    )}
                    {displayList.map((item, k) => {
                        return (
                            <tr key={k} className="hideout-item-list-row">
                                <td className="hideout-item-list-column">
                                    <div className="hideout-name-wrapper">
                                        <img
                                            alt={item.moduleName}
                                            className="quest-giver-image"
                                            loading="lazy"
                                            src={`${process.env.PUBLIC_URL}/images/stations/${item.normalizedName}-icon.png`}
                                        />
                                        <div>
                                            {item.moduleName}
                                            <div>
                                                {t('Level')} {item.level}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="hideout-item-list-column">
                                    <div className="hideout-item-wrapper">
                                        <div className="hideout-item-image-wrapper">
                                            <img
                                                alt={item.item.name}
                                                loading="lazy"
                                                src={item.item.iconLink}
                                            />
                                        </div>
                                        <div className="hideout-item-text-wrapper">
                                            {item.item.name}
                                            <div className="amount-wrapper">
                                                {t('Amount')}: {item.quantity}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default ItemsForHideout;
