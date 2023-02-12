import React, { useMemo, useState } from 'react';
import { useNavigate } from "react-router-dom";

import { useItemsQuery } from '../../features/items/queries';
import { SelectItemFilter } from '../filter';

export function PresetSelector({ item, alt = '' }) {
    const navigate = useNavigate();

    // Use the primary items API query to fetch all items
    const result = useItemsQuery();

    const [selected, setSelected] = useState(item);

    const baseId = useMemo(() => {
        setSelected(item);
        if (item.types.includes('preset')) {
            return item.properties.baseItem.id;
        }
        return item.id;
    }, [item]);

    const selectedValue = useMemo(() => {
        return {
            label: selected.shortName,
            value: selected.normalizedName || 'loading'
        };
    }, [selected]);

    const items = result.data.filter(
        testItem => testItem.id === baseId || testItem.properties?.baseItem?.id === baseId
    ).sort((a, b) => {
        if (a.types.includes('gun')) return -1;
        if (b.types.includes('gun')) return 1;
        const baseItem = result.data.find(i => i.id === baseId);
        if (baseItem.properties?.defaultPreset?.id === a.id) return -1;
        if (baseItem.properties?.defaultPreset?.id === b.id) return 1;
        return a.shortName.localeCompare(b.shortName);
    });

    if (items.length < 2) {
        return alt;
    }
    return (
        <div>
            <SelectItemFilter 
                items={items} 
                value={selectedValue}
                shortNames 
                showImage={false}
                onChange={(event) => {
                    if (!event) {
                        return true;
                    }
                    navigate(`/item/${event.value}`);
                }}
                valueField={'normalizedName'}
            />
        </div>
    );
}
