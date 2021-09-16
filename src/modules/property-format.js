import {Link} from 'react-router-dom';

import camelcaseToDashes from './camelcase-to-dashes';
import ammoFormat from './format-ammo';

const defaultFormat = (inputString) => {
    const baseFormat = camelcaseToDashes(inputString)
        .replace(/-/g, ' ');

    return baseFormat.charAt(0).toUpperCase() + baseFormat.slice(1);
};

const firingModeFormat = (inputString) => {
    switch(inputString){
        case 'single':
            return 'semi-auto';
        case 'fullauto':
            return 'full-auto';
        default:
            return inputString;
    }
};

const ammoLinkFormat = (inputString) => {
    const formattedName = ammoFormat(inputString);
    return <Link
        to = {`/ammo/${formattedName}`}
    >
        {formattedName}
    </Link>;
};

const formatter = (key, value) => {
    if(key === 'Weight'){
        return [
            key,
            `${value} kg`,
        ];
    }

    if(key === 'speedPenaltyPercent'){
        return [
            'Speed penalty',
            `${value}%`,
        ];
    }

    if(key === 'RicochetParams'){
        return [
            'Ricochet chance',
            value.x,
        ];
    }

    if(key === 'armorZone'){
        let displayKey = defaultFormat(key);

        if(value.length > 1){
            displayKey = `${displayKey}s`;
        }

        return [
            displayKey,
            value.map(defaultFormat).join(', '),
        ];
    }

    if(key === 'weaponErgonomicPenalty'){
        return [
            'Ergonomics',
            value,
        ];
    }

    if(key === 'mousePenalty'){
        return [
            'Turn speed',
            `${value} %`,
        ];
    }

    if(key === 'bFirerate'){
        return [
            'Rate of fire',
            value,
        ];
    }

    if(key === 'RecoilForceBack' || key === 'RecoilForceUp'){
        return [
            defaultFormat(key).replace(' force', ''),
            value,
        ];
    }

    if(key === 'weapFireType'){
        return [
            'Fire modes',
            value.map(firingModeFormat).join(', '),
        ];
    }

    if(key === 'ammoCaliber'){
        return [
            'Ammunition',
            ammoLinkFormat(value),
        ];
    }

    return [
        defaultFormat(key),
        value,
    ];
};

export default formatter;