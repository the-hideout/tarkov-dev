import { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@mdi/react';
import { 
    mdiCloseOctagon, 
    mdiHelpRhombus,
    mdiClipboardList,
    mdiTimerSand,
} from '@mdi/js';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

import ArrowIcon from '../../components/data-table/Arrow.js';
import DataTable from '../data-table/index.js';
import useItemsData from '../../features/items/index.js';
import useTradersData from '../../features/traders/index.js';

function TaskObjectiveTable({ objectives }) {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const settings = useSelector((state) => state.settings);

    const { data: items } = useItemsData();

    const { data: traders } = useTradersData();

    const data = useMemo(() => {
        return objectives.map(objective => {
            const obj = {
                ...objective,
                subRows: []
            };
            let subRow = false;
            if (objective.type === 'giveItem' || objective.type === 'findItem') {
                console.log(objective.item.id, items)
                subRow = {
                    description: `${items.find(item => item.id === objective.item.id)?.name}: ${objective.count}`
                };
            }
            if (description) {
                obj.subRows.push(subRow);
            }
            return obj;
        });
    }, [
        objectives,
        items,
        traders,
    ]);

    const columns = useMemo(() => {
        const useColumns = [];
        useColumns.push({
            id: 'expander',
            Header: ({
                getToggleAllRowsExpandedProps,
                isAllRowsExpanded,
            }) =>
                // <span {...getToggleAllRowsExpandedProps()}>
                //     {isAllRowsExpanded ? 'v' : '>'}
                // </span>
                null,
            Cell: ({ row }) =>
                // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                // to build the toggle for expanding a row
                row.canExpand ? (
                    <span
                        {...row.getToggleRowExpandedProps({
                            style: {
                                // We can even use the row.depth property
                                // and paddingLeft to indicate the depth
                                // of the row
                                // paddingLeft: `${row.depth * 2}rem`,
                            },
                        })}
                    >
                        {row.isExpanded ? (
                            <ArrowIcon />
                        ) : (
                            <ArrowIcon className={'arrow-right'} />
                        )}
                    </span>
                ) : null,
        });
        useColumns.push({
            Header: t('Objective'),
            id: 'description',
            accessor: 'description',
            Cell: (props) => {
                //console.log(props.row.original)
                return props.value;
            },
        });

        const claimedPositions = [];
        for (let i = 1; i < useColumns.length; i++) {
            const column = useColumns[i];
            if (Number.isInteger(column.position)) {
                let position = parseInt(column.position)+1;
                if (position < 2) {
                    position = 2;
                }
                if (position >= useColumns.length) {
                    position = useColumns.length-1;
                }
                if (position !== i && !claimedPositions.includes(position)) {
                    //console.log(`Moving ${column.Header} from ${i} to ${position}`);
                    claimedPositions.push(position);
                    useColumns.splice(i, 1);
                    useColumns.splice(position, 0, column);
                    i = 1;
                } else if (position !== i && claimedPositions.includes(position)) {
                    //console.warn(`Warning: ${column.Header} wants position ${position}, but that position has already been claimed by ${useColumns[position].Header}`);
                }
            }
        }

        return useColumns;
    }, [
        t,
    ]);

    let extraRow = false;

    // If there are no objectives provided, we need to add a row to show
    if (data.length <= 0) {
        /*// If the API query has not yet completed
        if (result.isFetched === false) {
            extraRow = <LoadingSmall />;
            // If the API query has completed, but no objectives were found
        } else {
            extraRow = t('No objectives');
        }*/
        extraRow = t('No objectives');
    }

    return (
        <DataTable
            className="small-data-table"
            key="task-objective-table"
            columns={columns}
            data={data}
            extraRow={extraRow}
            autoResetSortBy={false}
        />
    );
}

export default TaskObjectiveTable;
