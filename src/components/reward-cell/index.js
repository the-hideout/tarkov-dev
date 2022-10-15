import { useMemo, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Tippy from '@tippyjs/react';
import Icon from '@mdi/react';
import { mdiCloseBox, mdiCheckboxMarked } from '@mdi/js';

import RewardImage from '../reward-image';

import formatPrice from '../../modules/format-price';

import { setRewardValue as setCraftRewardValue } from '../../features/crafts/craftsSlice';
import { setRewardValue as setBarterRewardValue } from '../../features/barters/bartersSlice';

import './index.css';

function RewardCell({
    id,
    count,
    iconLink,
    itemLink,
    name,
    source,
    sellValue,
    sellTo,
    sellNote = false,
    valueTooltip,
    sellType,
}) {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [customPrice, setCustomPrice] = useState(sellValue);
    const [editingCustomPrice, setEditingCustomPrice] = useState(false);

    useEffect(() => {
        setCustomPrice(sellValue);
    }, [sellValue, setCustomPrice]);

    const displayValue = useMemo(() => {
        let shownPrice = 'N/A';
        if (sellValue) {
            shownPrice = formatPrice(sellValue);
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
                    className={editingCustomPrice ? '' : ' hidden'}
                >
                    <input 
                        className="custom-price" 
                        value={customPrice}
                        onChange={(e) => {
                            let sanitized = e.target.value.replaceAll(/[^0-9]/g, '');
                            if (sanitized) {
                                sanitized = parseInt(sanitized);
                            }
                            setCustomPrice(sanitized);
                        }}
                    ></input>
                    <span> ₽</span>
                    <Icon
                        path={mdiCheckboxMarked}
                        size={1}
                        color={'#6a9a66'}
                        className="icon-with-text no-click"
                        onClick={(event) => {
                            dispatch(
                                setBarterRewardValue({
                                    itemId: id,
                                    price: customPrice
                                }),
                            );
                            dispatch(
                                setCraftRewardValue({
                                    itemId: id,
                                    price: customPrice
                                }),
                            );
                            setEditingCustomPrice(false);
                        }}
                    />
                    <Icon
                        path={mdiCloseBox}
                        size={1}
                        color={'#9a6666'}
                        className="icon-with-text no-click"
                        onClick={(event) => {
                            dispatch(
                                setBarterRewardValue({
                                    itemId: id,
                                    price: false
                                }),
                            );
                            dispatch(
                                setCraftRewardValue({
                                    itemId: id,
                                    price: false
                                }),
                            );
                            setEditingCustomPrice(false);
                        }}
                    />
                </span>
                <span> @ {sellTo}</span>
            </span>
        );
    }, [dispatch, id, sellValue, sellType, sellTo, customPrice, setCustomPrice, editingCustomPrice, setEditingCustomPrice]);

    if (sellNote) {
        sellNote = (<span> ({sellNote})</span>);
    }
    
    if(!valueTooltip) {
        valueTooltip = t('Sell value');
    }

    return (
        <div className="reward-wrapper">
            <RewardImage count={count} iconLink={iconLink} />
            <div className="reward-info-wrapper">
                <div>
                    <Link className="reward-item-title" to={itemLink}>
                        {name}
                    </Link>
                </div>
                <div className="source-wrapper">{source}</div>
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
