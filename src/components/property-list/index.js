import { useMemo } from 'react';
import propertyFormatter from '../../modules/property-format';

import './index.css';

const skipProps = ['grid', 'ConflictingItems'];

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

    return (
        <div className="property-list">
            {data.map(([property, value]) => {
                return (
                    <div className="property-wrapper" key={property}>
                        <div>
                            {value}
                            <div className="property-key-wrapper">
                                {property}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default PropertyList;
