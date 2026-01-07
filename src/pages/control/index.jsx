import { useRef, useMemo } from 'react';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';

import SEO from '../../components/SEO.jsx';

import { caliberArrayWithSplit } from '../../modules/format-ammo.mjs';

import useItemsData from '../../features/items/index.js';
import { useMapImagesSortedArray } from '../../features/maps/index.js';

import Connect from './Connect.jsx';

import './index.css';

const ammoTypes = caliberArrayWithSplit();

const selectFilterStyle = {
    menu: (provided) => ({
        ...provided,
        backgroundColor: 'var(--color-gunmetal-dark)',
        border: '2px solid var(--color-gold-two)',
        borderRadius: 0,
    }),
    control: (provided) => ({
        ...provided,
        backgroundColor: 'var(--color-gunmetal-dark)',
        border: '2px solid var(--color-gold-two)',
        borderRadius: 0,
    }),
    menuList: (provided) => ({
        ...provided,
        color: 'var(--color-yellow-light)',
        borderRadius: 0,
    }),
    option: (provided) => ({
        ...provided,
        color: 'var(--color-yellow-light)',
        backgroundColor: 'var(--color-gunmetal-dark)',

        borderRadius: 0,
        '&:hover': {
            backgroundColor: 'var(--color-gold-two)',
            color: 'var(--color-gunmetal-dark)',
            fontweight: 700,
        },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: 'var(--color-gold-one)',
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: 'var(--color-white)',
        color: 'var(--color-white)',
    }),
};

function Control(props) {
    const { data: items } = useItemsData();

    const uniqueMaps = useMapImagesSortedArray();

    const socketConnected = useSelector((state) => state.sockets.connected);
    const { t } = useTranslation();

    const itemList = useMemo(() => {
        return items
            .map((item) => {
                return {
                    label: item.name,
                    value: item.id,
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [items]);

    const typeRefs = {
        ammo: useRef(null),
        map: useRef(null),
        lootTier: useRef(null),
    };

    const handleMapChange = () => {
        handleViewChange('map', typeRefs['map'].current.value);
    };

    const handleAmmoChange = () => {
        const ammoValues = [];

        for (const option of typeRefs['ammo'].current.children) {
            if (!option.selected) {
                continue;
            }

            ammoValues.push(option.value);
        }

        ammoValues.sort();
        handleViewChange('ammo', ammoValues.join(','));
    };

    // const handleLootTierChange = () => {
    //     handleViewChange('loot-tier', typeRefs['lootTier'].current.value);
    // };

    const handleViewChange = (view, eventOrValue) => {
        let value = eventOrValue.target?.value || eventOrValue;

        if (!props.send) {
            return false;
        }

        props.send({
            type: 'command',
            data: {
                type: view,
                value: value,
            },
        });
    };

    const handleSelectChange = (event) => {
        handleViewChange('item', event.value);
    };

    return (
        <SEO 
            title={`${t('Remote Control')} - ${t('Tarkov.dev')}`}
            description={t('remote-control-page-description', 'This page contains all necessary tools to remote control another instance of Tarkov.dev website.')}
            key="seo-wrapper"
        />,
        <div className="control-wrapper" key="">
            <h1>{t('Remote Control')}</h1>
            <div className={'control-section'}>
                <span>{t('View Map')}:</span>
                <select
                    disabled={!socketConnected}
                    name="map"
                    onChange={handleMapChange}
                    ref={typeRefs['map']}
                >
                    {uniqueMaps.map((map) => (
                        <option key={map.key} value={map.key}>
                            {map.displayText}
                        </option>
                    ))}
                </select>
                <button disabled={!socketConnected} onClick={handleMapChange}>
                    {t('Go')}
                </button>
            </div>
            <div className={'control-section'}>
                <span>{t('View caliber')}:</span>
                <select
                    disabled={!socketConnected}
                    multiple
                    name="ammo"
                    onChange={handleAmmoChange}
                    ref={typeRefs['ammo']}
                >
                    {ammoTypes.map((ammoType) => (
                        <option key={ammoType} value={ammoType}>
                            {ammoType}
                        </option>
                    ))}
                </select>
                <button disabled={!socketConnected} onClick={handleAmmoChange}>
                    {t('Go')}
                </button>
            </div>
            <Select
                // defaultValue = {defaultValue}
                // isMulti = {isMulti}
                isDisabled={!socketConnected}
                name="colors"
                placeholder={t('Select...')}
                options={itemList}
                className="basic-multi-select"
                onChange={handleSelectChange}
                classNamePrefix="select"
                // onMenuClose = {onMenuClose}
                // onMenuOpen = {onMenuOpen}
                styles={selectFilterStyle}
            />
            {/* <div
            className = {'control-section'}
        >
            <span>View loot tiers:</span>
            <select
                name="loot-tier"
                onChange={handleLootTierChange}
                ref = {typeRefs['lootTier']}
            >
                <option
                    value = 'grid-items'
                >
                    {'Barter Items'}
                </option>
                <option
                    value = 'mods'
                >
                    {'Mods'}
                </option>
                <option
                    value = 'keys'
                >
                    {'Keys'}
                </option>
            </select>
            <button
                onClick = {handleLootTierChange}
            >
                Go
            </button>
        </div> */}
            <div className="info-wrapper">
                {t('Load tarkov.dev in another browser or window to control it from here')}
            </div>
            <Connect />
            {/* prettier-ignore */}
            <Trans i18nKey={'control-info-p'}>
                <p>This page allows you to control the Tarkov.dev website using another browser. The typical use case is to have the Tarkov.dev website open in a browser on a second monitor while you play the game and this page open on your phone or another device so that you can navigate to different pages on the Tarkov.dev website without having to alt+tab out of the game. All you have to do is open the Tarkov.dev website in a browser where you want it to be displayed, click the "Click to connect" button in the lower left*, and then enter the id on this control page on the other device and click the Connect. Once connected, you can use this control page to open specific map or ammo pages in the controlled browser.</p>
                <p>*It appears on the lower left by default but can be toggled to the lower right side of the screen. It can also be hidden by the "Hide remote control" option on the settings page.</p>
            </Trans>
        </div>
    );
}

export default Control;
