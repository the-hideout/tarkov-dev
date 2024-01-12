import { useMemo, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Tippy from '@tippyjs/react';
import { Icon } from '@mdi/react';
import { mdiCloseBox, mdiCheckboxMarked, mdiClipboardList } from '@mdi/js';

import ItemImage from '../item-image/index.js';

import formatPrice from '../../modules/format-price.js';

import { setCustomSellValue } from '../../features/items/index.js';

import './index.css';

function RewardCell({
    item,
    count,
    source,
    sellValue,
    sellTo,
    sellNote = false,
    valueTooltip,
    sellType,
    taskUnlock,
    isFIR,
}) {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [customPrice, setCustomPrice] = useState(sellValue);
    const [editingCustomPrice, setEditingCustomPrice] = useState(false);

    useEffect(() => {
        setCustomPrice(sellValue);
    }, [sellValue, setCustomPrice]);

    const taskTooltip = useMemo(() => {
        if (!taskUnlock) {
            return '';
        }
        const tooltipContent = (
            <Link to={`/task/${taskUnlock.normalizedName}`}>
                {t('Task: {{taskName}}', {taskName: taskUnlock.name})}
            </Link>
        );
        return (
            <span>
                <Tippy
                    content={tooltipContent}
                    placement="right"
                    interactive={true}
                >
                    <Icon
                        path={mdiClipboardList}
                        size={1}
                        className="icon-with-text no-click"
                    />
                </Tippy>
            </span>
        );
    }, [taskUnlock, t]);

    const displayValue = useMemo(() => {
        let shownPrice = t('N/A');
        let shownSellTo = '';
        if (sellValue) {
            shownPrice = formatPrice(sellValue);
            shownSellTo = ` @ ${sellTo}`;
        }
        return (
            <span>
                <span
                    className={editingCustomPrice ? 'hidden' : ''}
                    onClick={(event) => {
                        setEditingCustomPrice(true);
                    }}
                >
                    {shownPrice}{sellType === 'custom' ? '*' : ''}
                </span>
                <span
                    className={editingCustomPrice ? '' : 'hidden'}
                >
                    <input 
                        className="reward-custom-price" 
                        value={customPrice}
                        inputMode="numeric"
                        onChange={(e) => {
                            let sanitized = e.target.value.replaceAll(/[^0-9]/g, '');
                            if (sanitized) {
                                sanitized = parseInt(sanitized);
                            }
                            setCustomPrice(sanitized);
                        }}
                    />
                    <span> ₽</span>
                    <Icon
                        path={mdiCheckboxMarked}
                        size={1}
                        className="icon-with-text no-click reward-muted-green"
                        onClick={(event) => {
                            dispatch(
                                setCustomSellValue({
                                    itemId: item.id,
                                    price: customPrice
                                }),
                            );
                            setEditingCustomPrice(false);
                        }}
                    />
                    <Icon
                        path={mdiCloseBox}
                        size={1}
                        className="icon-with-text no-click reward-muted-red"
                        onClick={(event) => {
                            dispatch(
                                setCustomSellValue({
                                    itemId: item.id,
                                    price: false
                                }),
                            );
                            setEditingCustomPrice(false);
                        }}
                    />
                </span>
                <span>{shownSellTo}</span>
            </span>
        );
    }, [dispatch, item, sellValue, sellType, sellTo, customPrice, setCustomPrice, editingCustomPrice, setEditingCustomPrice, t]);

    if (sellNote) {
        sellNote = (<span> ({sellNote})</span>);
    }
    
    if (!valueTooltip) {
        valueTooltip = t('Sell value');
    }

    return (
        <div className="reward-wrapper">
            <ItemImage
                item={item}
                count={count}
                imageField={'iconLink'}
                isFIR={isFIR}
                linkToItem={true}
                style={{marginRight: '10px'}}
            />
            <div className="reward-info-wrapper">
                <div>
                    <Link className="reward-item-title" to={`/item/${item.normalizedName}`}>
                        {item.name}
                    </Link>
                </div>
                <div className="reward-info-source">{source}{taskTooltip}</div>
                <Tippy
                    content={valueTooltip}
                    placement="bottom"
                >
                    <div className="price-wrapper">
                        {displayValue}
                        {sellNote}
                    </div>
                </Tippy>
            </div>
        </div>
    );
}

export default RewardCell;
