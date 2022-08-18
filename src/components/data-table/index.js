import { useEffect } from 'react';
import { useTable, useSortBy, useExpanded, usePagination } from 'react-table';
import { useInView } from 'react-intersection-observer';
// import {ReactComponent as ArrowIcon} from './Arrow.js';
import ArrowIcon from './Arrow.js';
import useStateWithLocalStorage from '../../hooks/useStateWithLocalStorage';

import './index.css';

function DataTable({
    columns,
    data,
    autoResetSortBy,
    className,
    maxItems,
    extraRow,
    nameFilter,
    autoScroll,
    disableSortBy,
}) {
    // Use the state and functions returned from useTable to build your UI
    // const [data, setData] = React.useState([])

    const storageKey = columns
        .map(({ Header }) => {
            if (!Header || typeof Header !== 'string') {
                return '';
            }

            return Header.toLowerCase()
                .replace(/\s/, '-')
                .replace(/[^a-z-]/g, '');
        })
        .join(',');
    const [initialSortBy, storageSetSortBy] = useStateWithLocalStorage(
        storageKey,
        [],
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
    }, [storageSetSortBy, sortByState]);

    useEffect(() => {
        if (nameFilter && sortByState[0]?.id === 'name') {
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
                row.isExpanded || row.depth === 1 ? 'expanded' : ''
            }`;
            return (
                <tr {...tableProps}>
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
            <table className={`data-table ${className}`} {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th
                                    {...column.getHeaderProps(
                                        column.getSortByToggleProps(),
                                    )}
                                >
                                    <span className={'header-text'}>
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
                        <tr>
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
            </table>
        </div>
    );
}

export default DataTable;
