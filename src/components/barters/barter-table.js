import { useTable, useSortBy } from 'react-table';

import './index.css';

function BarterTable({ columns, data }) {
    // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  }, useSortBy);

  // Render the UI for your table
  return (
    <table
        className = {'barter-table'}
        {
            ...getTableProps()
        }
    >
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
              {column.render('Header')}
              {/* Add a sort direction indicator */}
              <span>
                {column.isSorted
                  ? column.isSortedDesc
                    ? ' 🔽'
                    : ' 🔼'
                  : ''}
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
                        {...cell.getCellProps()}
                    >
                        {cell.render('Cell')}
                    </td>
                })}
                </tr>
            )
        })}
      </tbody>
    </table>
  )
}

export default BarterTable;


