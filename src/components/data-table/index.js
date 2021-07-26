import { useTable, useSortBy, useExpanded, usePagination } from 'react-table';
// import {ReactComponent as ArrowIcon} from './Arrow.js';
import ArrowIcon from './Arrow.js';

import './index.css';

function DataTable({ columns, data, sortBy, sortByDesc, autoResetSortBy, className, maxItems, extraRow }) {
    // Use the state and functions returned from useTable to build your UI
    // const [data, setData] = React.useState([])
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
        initialState: {
            pageSize: maxItems,
            sortBy: [
                {
                    id: sortBy,
                    desc: sortByDesc,
                },
            ],
        },
        autoResetSortBy: autoResetSortBy,
    }, useSortBy, useExpanded, usePagination);

    const getRows = () => {
        let rowContainer = rows;

        if(maxItems){
            rowContainer = page;
        }

        return rowContainer.map((row, i) => {
            prepareRow(row);
            const tableProps = row.getRowProps();

            tableProps.className = `${row.isExpanded || row.depth === 1 ? 'expanded' : ''}`
            return (
                <tr
                    {
                        ...tableProps
                    }
                >
                    {row.cells.map(cell => {
                        return <td
                            className = {'data-cell'}
                            {
                                ...cell.getCellProps()
                            }
                        >
                            {cell.render('Cell')}
                        </td>
                    })}
                </tr>
            )
        })
    };

    // Render the UI for your table
    return (
        <div
        className = 'table-wrapper'
        >
            <table
                className = {`data-table ${className}`}
                {
                    ...getTableProps()
                }
            >
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {
                            ...headerGroup.getHeaderGroupProps()
                            }
                        >
                            {headerGroup.headers.map(column => (
                                <th {
                                    ...column.getHeaderProps(column.getSortByToggleProps())
                                }>
                                    <span
                                        className = {'header-text'}
                                    >
                                        {column.render('Header')}
                                    </span>
                                    {/* Add a sort direction indicator */}
                                    <div
                                        className = {'header-sort-icon'}
                                        style = {{
                                            // marginLeft: '2px',
                                        }}
                                    >
                                        {column.isSorted ? column.isSortedDesc ? <ArrowIcon/> : <ArrowIcon className = {'arrow-up'} /> : <div className = { 'arrow-placeholder' } />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {
                        getRows()
                    }
                    {extraRow && <tr>
                        <td
                            className = 'data-cell table-extra-row'
                            colSpan = {999}
                        >
                            {extraRow}
                        </td>
                    </tr>}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;


