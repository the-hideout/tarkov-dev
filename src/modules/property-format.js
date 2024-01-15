import { Link } from 'react-router-dom';
import { isValidElement } from 'react';

import camelcaseToDashes from './camelcase-to-dashes.js';
import { formatCaliber } from './format-ammo.mjs';

import i18n from '../i18n.js';

const defaultFormat = (inputString) => {
    const baseFormat = camelcaseToDashes(inputString).replace(/-/g, ' ');

    return baseFormat.charAt(0).toUpperCase() + baseFormat.slice(1);
};

const ignoreCategories = [
    '54009119af1c881c07000029', // Item
    '566162e44bdc2d3f298b4573', // Compound item
    '5661632d4bdc2d903d8b456b', // Stackable item
    '566168634bdc2d144c8b456c', // Searchable item
];

const ammoLinkFormat = (inputString) => {
    const formattedName = formatCaliber(inputString);
    return <Link to={`/ammo/${formattedName}`}>{formattedName}</Link>;
};

const itemLinkFormat = (inputItem) => {
    return <Link to={`/item/${inputItem.normalizedName}`}>{inputItem.name}</Link>;
};

const itemCategoryLinkFormat = inputCategory => {
    return <Link to={`/items/${inputCategory.normalizedName}`} key={inputCategory.normalizedName}>{inputCategory.name}</Link>;
};

const formatter = (key, value, id) => {
    let label = null;
    let tooltip = false;
    if (typeof value === 'object' && value !== null && value.value) {
        if (value.label) {
            label = value.label;
        }
        if (value.tooltip) {
            tooltip = value.tooltip;
        }
        value = value.value;
    } 
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            value = [...value];
        } else {
            value = {...value};
        }
    }

    let displayKey = i18n.t(key, { ns: 'properties' })

    if (key === 'weight') {
        value = `${value} kg`;
    }

    if (key === 'speedPenalty') {
        value = `${value*100}%`;
    }

    if (key === 'armorZone') {
        value = value?.map(defaultFormat).join(', ');
    }

    if (key === 'armorDamage') {
        value = `${value}%`;
    }

    if (key === 'turnPenalty') {
        value = `${value*100}%`;
    }

    if (key === 'caliber') {
        //return ['Ammunition', ammoLinkFormat(value)];
        value = ammoLinkFormat(value);
    }

    if (typeof value === 'boolean') {
        value = value ? i18n.t('Yes') : i18n.t('No');
    }

    if (key === 'zoomLevels') {
        const zoomLevels = new Set();
        value?.forEach(levels => zoomLevels.add(...levels));
        value = [...zoomLevels].join(', ');
    }

    if (key === 'grids') {
        const gridCounts = {};
        value?.sort((a, b) => (a.width*a.height) - (b.width*b.height)).forEach(grid => {
            const gridLabel = grid.width+'x'+grid.height;
            if (!gridCounts[gridLabel]) gridCounts[gridLabel] = 0;
            gridCounts[gridLabel]++;
        })
        const displayGrids = [];
        for (const label in gridCounts) {
            displayGrids.push(`${label}${gridCounts[label] > 1 ? `: ${gridCounts[label]}` : ''}`);
        }
        value = displayGrids.join(', ');
    }

    if (key === 'baseItem') {
        value = itemLinkFormat(value);
    }

    if (key === 'defaultPreset' && value) {
        value = itemLinkFormat(value);
    }

    if (key === 'categories') {
        value = value?.map(category => {
            if (ignoreCategories.includes(category.id)) return false;
            return itemCategoryLinkFormat(category);
        }).filter(Boolean).reduce((prev, curr, currentIndex) => [prev, (<span key={`spacer-${currentIndex}`}>, </span>), curr]);
    }

    if (key === 'stimEffects') {
        value = value?.map((effect, effectIndex) => {
            const displayName = effect.skillName || effect.type;
            let displayValue = `${effect.value > 0 ? '+' : ''}${effect.value}${effect.percent ? '%' : ''}`;
            if (effect.value === 0) {
                displayValue = '';
            }
            const chance = effect.chance === 1 ? '' : ` ${effect.chance * 100}%`;
            const formattedValue = displayValue || chance ? `${displayName}: ${displayValue}${chance}` : displayName;
            return (
                <div key={`effect-${effectIndex}`}>
                    {formattedValue}
                </div>
            );
        }).filter(Boolean);//.reduce((prev, curr) => [prev, (<br/>), curr])];
    }

    if (key === 'material' && value) {
        if (typeof value === 'object') {
            value = value?.name;
        }
    }

    if (key === 'usedOnMaps' && value?.length > 0) {
        value = value?.map(m => {
            return <Link to={`/map/${m.normalizedName}?q=${id}`} key={`map=${m.id}`}>{m.name}</Link>;
        }).reduce((prev, curr, currentIndex) => [prev, (<span key={`spacer-${currentIndex}`}>, </span>), curr]);
    }

    if (Array.isArray(value)) {
        let allString = true;
        for (const val of value) {
            if (typeof val !== 'string') {
                allString = false;
                break;
            }
        }
        if (allString) {
            value = value.join(', ');
        }
    } else if (typeof value === 'object' && value !== null && !isValidElement(value)) {
        // if the value is an object, return an empty array meaning that we
        // can't format that value
        value = undefined;
    }

    value = {
        value: value,
        label: label ? label : displayKey,
        tooltip: tooltip,
    }

    return [key, value];
};

export default formatter;
