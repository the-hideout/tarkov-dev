import { useEffect } from 'react';
import { useTable, useSortBy, useExpanded, usePagination } from 'react-table/index.js';
import { useInView } from 'react-intersection-observer';
// import {ReactComponent as ArrowIcon} from './Arrow.js';
import ArrowIcon from './Arrow.js';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage.jsx';
import formatPrice from '../../modules/format-price.js';

import './index.css';

function DataTable({
    className,
    columns,
    sumColumns,
    data,
    extraRow,
    sortBy,
    sortByDesc,
    disableSortBy,
    autoResetSortBy,
    maxItems,
    nameFilter,
    autoScroll,
    onSort,
}) {
    // Use the state and functions returned from useTable to build your UI
    // const [data, setData] = React.useState([])

    const storageKey = columns.map(({ Header, id }) => {
        if (typeof id === 'string') {
            return id;
        }

        if (!Header || typeof Header !== 'string') {
            return '';
        }

        return Header.toLowerCase()
                        .replace(/\s/, '-')
                        .replace(/[^a-zа-я-]/g, '');
    }).join(',');
    const [initialSortBy, storageSetSortBy] = useStateWithLocalStorage(
        storageKey,
        [{
            "id": sortBy,
            "desc": sortByDesc
        }],
    );
    const { ref, inView } = useInView({
        threshold: 0,
    });

    const {
        setSortBy,
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        rows,
        prepareRow,
        setPageSize,
        state: { sortBy: sortByState } = {},
        state,
    } = useTable(
        {
            columns,
            data,
            initialState: {
                pageSize: maxItems || 10,
                sortBy: initialSortBy,
            },
            autoResetSortBy: autoResetSortBy,
            disableSortBy,
        },
        useSortBy,
        useExpanded,
        usePagination,
    );

    useEffect(() => {
        storageSetSortBy(sortByState);
        if (typeof onSort === 'function') {
            onSort(sortByState);
        }
    }, [storageSetSortBy, sortByState, onSort]);

    useEffect(() => {
        if (nameFilter && (sortByState[0]?.id === 'name' || sortByState[0]?.id === undefined)) {
            setSortBy([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nameFilter]);

    useEffect(() => {
        if (autoScroll && inView && data.length > state.pageSize) {
            setPageSize(state.pageSize + 50);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, autoScroll]);

    const getRows = () => {
        let rowContainer = rows;

        if (maxItems) {
            rowContainer = page;
        }

        return rowContainer.map((row, i) => {
            prepareRow(row);
            const tableProps = row.getRowProps();

            tableProps.className = `${
                row.depth >= 1 ? 'expanded' : ''
            }`;
            return (
                <tr key={row.original.id} {...tableProps}>
                    {row.cells.map((cell) => {
                        return (
                            <td
                                className={'data-cell'}
                                {...cell.getCellProps()}
                            >
                                {cell.render('Cell')}
                            </td>
                        );
                    })}
                </tr>
            );
        });
    };

    // Render the UI for your table
    return (
        <div className="table-wrapper">
            <table className={`data-table ${className ?? ''}`} {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th {...column.getHeaderProps(column.getSortByToggleProps({ title: undefined }))}>
                                    <span>
                                        {column.render('Header')}
                                    </span>
                                    {/* Add a sort direction indicator */}
                                    <div
                                        className={'header-sort-icon'}
                                    >
                                        {column.isSorted ? (
                                            column.isSortedDesc ? (
                                                <ArrowIcon />
                                            ) : (
                                                <ArrowIcon
                                                    className={'arrow-up'}
                                                />
                                            )
                                        ) : (
                                            <div
                                                className={'arrow-placeholder'}
                                            />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {getRows()}
                    {extraRow && (
                        <tr key="extra">
                            <td
                                className="data-cell table-extra-row"
                                colSpan={999}
                            >
                                {extraRow}
                            </td>
                        </tr>
                    )}
                    <tr className="last-row" ref={ref} />
                </tbody>
                {sumColumns && rows.length > 1 && (
                    <tfoot>
                        <tr>
                            {columns.map((col, colIndex) => (<th key={`col-sum-${colIndex}`}>{col.summable ? formatPrice(rows.map(row => {
                                const val = row.cells[colIndex].value;
                                const count = row.original?.count ? row.original.count : 1;
                                if (isNaN(val)) return false;
                                return val * count;
                            }).filter(Boolean).reduce((previousValue, currentValue) => previousValue + currentValue, 0)) : ''}</th>))}
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}

export default DataTable;
