import { useMemo } from 'react';
import propertyFormatter from '../../modules/property-format.js';
import { useTranslation } from 'react-i18next';
import Tippy from '@tippyjs/react';

import './index.css';

const skipProps = ['grid', 'ConflictingItems', '__typename', 'slots', 'presets', 'armorSlots'];

const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
};

function PropertyList({ properties, id }) {
    const { t } = useTranslation();

    const data = useMemo(
        () =>
            Object.entries(properties ?? {})
                .filter(([property, value]) => {
                    return !skipProps.includes(property);
                })
                .map(([property, value]) => {
                    return propertyFormatter(property, value, id);
                })
                .filter(([property, value]) => value.value !== undefined && value.value !== null)
                .filter(([property, value]) => value.value?.length !== 0)
                .sort((a, b) => {
                    let aVal = a[0];
                    let bVal = b[0];
                    if (typeof a[1].order !== 'undefined' && typeof b[1].order !== 'undefined') {
                        aVal = String(a[1].order);
                        bVal = String(b[1].order);
                    } else if (a[1].label && b[1].label) {
                        aVal = a[1].label;
                        bVal = b[1].label;
                    }
                    return aVal.localeCompare(bVal);
                }),

        [properties, id],
    );

    if (data.length === 0) {
        return '';
    }

    return (
        <div className="property-list">
            {data.map(([property, value]) => {
                return (
                    <div className={`property-wrapper ${value.value.length >= 40 ? 'large' : ''} ${property}`}  key={property}>
                      <div className="property-key-wrapper title">
                          <ConditionalWrapper
                              condition={value.tooltip}
                              wrapper={(children) => 
                                  <Tippy
                                      content={value.tooltip}
                                      placement="bottom"
                                  >
                                      <div>{children}</div>
                                  </Tippy>
                              }
                          >
                              {value.label ? value.label : t(property)}
                          </ConditionalWrapper>
                      </div>
                      <div className="item">
                        <div>{value.value}</div>
                      </div>
                  </div>
                );
            })}
        </div>
    );
}

export default PropertyList;
