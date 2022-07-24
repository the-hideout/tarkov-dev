import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import {
    selectAllHideoutModules,
    fetchHideout,
} from '../../features/hideout/hideoutSlice';

import './index.css';

function ItemsForHideout(props) {
    const { itemFilter } = props;
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const hideout = useSelector(selectAllHideoutModules);
    const hideoutStatus = useSelector((state) => {
        return state.hideout.status;
    });

    useEffect(() => {
        let timer = false;
        if (hideoutStatus === 'idle') {
            dispatch(fetchHideout());
        }

        if (!timer) {
            timer = setInterval(() => {
                dispatch(fetchHideout());
            }, 600000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [hideoutStatus, dispatch]);

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
                                level: level.level,
                            };
                        }),
                );
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

    let extraRow = false;

    if (data.length <= 0) {
        extraRow = t('No hideout modules requires this item');
    }

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
                    {data.map((item, k) => {
                        return (
                            <tr key={k} className="hideout-item-list-row">
                                <td className="hideout-item-list-column">
                                    <div className="hideout-name-wrapper">
                                        <img
                                            alt={item.moduleName}
                                            className="quest-giver-image"
                                            loading="lazy"
                                            src={`${
                                                process.env.PUBLIC_URL
                                            }/images/${item.moduleName
                                                .toLowerCase()
                                                .replace(/\s/, '-')}-icon.png`}
                                        />
                                        <div>
                                            <div>{item.moduleName}</div>
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
                                                height="34"
                                                width="34"
                                                src={item.item.iconLink}
                                            />
                                        </div>
                                        <div className="hideout-item-text-wrapper">
                                            {item.item.name}
                                            <div className="amount-wrapper">
                                                {t('Amount')}:{' '}
                                                {new Intl.NumberFormat().format(
                                                    item.quantity,
                                                )}
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
