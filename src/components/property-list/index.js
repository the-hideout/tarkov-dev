import { useMemo } from 'react';
import propertyFormatter from '../../modules/property-format';
import { useTranslation } from 'react-i18next';

import './index.css';

const skipProps = ['grid', 'ConflictingItems', '__typename', 'slots'];

function PropertyList({ properties }) {
    const data = useMemo(
        () =>
            Object.entries(properties ?? {})
                .filter(([property, value]) => {
                    return !skipProps.includes(property);
                })
                .map(([property, value]) => {
                    return propertyFormatter(property, value);
                })
                .filter(([property, value]) => value !== undefined)
                .filter(([property, value]) => value?.length !== 0)
                .sort((a, b) => a[0].localeCompare(b[0])),

        [properties],
    );

    const { t } = useTranslation();

    return (
        <div className="property-list">
            {data.map(([property, value]) => {
                return (
                    <div className="property-wrapper" key={property}>
                        {value}
                        <div className="property-key-wrapper">
                            {t(property)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default PropertyList;
