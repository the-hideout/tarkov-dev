import { useTable, useSortBy } from 'react-table';

import './index.css';

function DataTable({ columns, data, sortBy, sortByDesc, autoResetSortBy }) {
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
    }, useSortBy);

    // Render the UI for your table
    return (
        <table
            className = {'data-table'}
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
                                {column.render('Header')}
                                {/* Add a sort direction indicator */}
                                <span>
                                    {column.isSorted ? column.isSortedDesc ? ' ∨' : ' ∧': ''}
                                </span>
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, i) => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
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


