import { useTranslation } from 'react-i18next';

import Supporter from '../../components/supporter/index.js';

import supporters from '../../supporters';

function SupportersList({ tierFilter, typeFilter, type }) {
    const { t } = useTranslation();

    let validSupporters = supporters.filter((supporter) => {
        if (supporter.name === 'kokarn') {
            return false;
        }

        if (tierFilter && supporter.tier !== tierFilter) {
            return false;
        }

        if (typeFilter && !supporter[typeFilter]) {
            return false;
        }

        return true;
    });

    if (validSupporters.length === 0) {
        return (
            <p>
                <a href="https://www.patreon.com/kokarn" target="_blank" rel="noopener noreferrer">
                    {t('Be the first!')}
                </a>
            </p>
        );
    }

    return [
        validSupporters.map((supporter) => {
            return (
                <Supporter
                    key={`supporter-${supporter.name}-${typeFilter}`}
                    name={supporter.name}
                    // github = {supporter.github}
                    // patreon = {supporter.patreon}
                    link={supporter.link}
                    inline={type === 'inline'}
                />
            );
        }),
    ];
}

export default SupportersList;
