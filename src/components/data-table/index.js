import { useTable, useSortBy, useExpanded } from 'react-table';
// import {ReactComponent as ArrowIcon} from './Arrow.js';
import ArrowIcon from './Arrow.js';

import './index.css';

function DataTable({ columns, data, sortBy, sortByDesc, autoResetSortBy, className }) {
    // Use the state and functions returned from useTable to build your UI
    // const [data, setData] = React.useState([])
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
        initialState: {
            sortBy: [
                {
                    id: sortBy,
                    desc: sortByDesc,
                },
            ],
        },
        autoResetSortBy: autoResetSortBy,
    }, useSortBy, useExpanded);

    // Render the UI for your table
    return (
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
                {rows.map((row, i) => {
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
                })}
            </tbody>
        </table>
    );
}

export default DataTable;


