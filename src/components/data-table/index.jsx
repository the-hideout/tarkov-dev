import { useEffect } from "react";
import { useTable, useSortBy, useExpanded, usePagination } from "react-table/index.js";
import { useInView } from "react-intersection-observer";
import useStateWithLocalStorage from "#src/hooks/useStateWithLocalStorage.jsx";
import formatPrice from "#src/modules/format-price.js";
import TableHead from "#src/components/data-table/TableHead.tsx";

import "./index.css";

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
    headConfig = {},
}) {
    // Use the state and functions returned from useTable to build your UI
    // const [data, setData] = React.useState([])

    const storageKey = columns
        .map(({ Header, id }) => {
            if (typeof id === "string") {
                return id;
            }

            if (!Header || typeof Header !== "string") {
                return "";
            }

            return Header.toLowerCase()
                .replace(/\s/, "-")
                .replace(/[^a-zа-я-]/g, "");
        })
        .join(",");
    const [initialSortBy, storageSetSortBy] = useStateWithLocalStorage(storageKey, [
        {
            id: sortBy,
            desc: sortByDesc,
        },
    ]);
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
        if (typeof onSort === "function") {
            onSort(sortByState);
        }
    }, [storageSetSortBy, sortByState, onSort]);

    useEffect(() => {
        if (nameFilter && (sortByState[0]?.id === "name" || sortByState[0]?.id === undefined)) {
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
            const tableProps = { ...row.getRowProps() };

            tableProps.className = `${row.depth >= 1 ? "expanded" : ""}`;
            delete tableProps.key;
            return (
                <tr key={`data-table-row-${i}`} {...tableProps}>
                    {row.cells.map((cell, i) => {
                        const cellProps = { ...cell.getCellProps() };
                        const cellKey = cellProps.key;
                        delete cellProps.key;
                        return (
                            <td key={cellKey} className={"data-cell"} {...cellProps}>
                                {cell.render("Cell")}
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
            <table className={`data-table ${className ?? ""}`} {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr
                            key={headerGroup.getHeaderGroupProps().key}
                            {...Object.keys(headerGroup.getHeaderGroupProps()).reduce((props, propName) => {
                                if (propName !== "key") {
                                    props[propName] = headerGroup.getHeaderGroupProps()[propName];
                                }
                                return props;
                            }, {})}
                        >
                            {headerGroup.headers.map((column) => {
                                const { key, ...restProps } = column.getHeaderProps(
                                    column.getSortByToggleProps({ title: undefined }),
                                );
                                const headAlign = headConfig?.align?.find((h) => h.id === column.id)?.align || "center";

                                return (
                                    <TableHead
                                        key={key}
                                        itemKey={key}
                                        headProps={restProps}
                                        align={headAlign}
                                        isSorted={column.isSorted}
                                        isSortedDesc={column.isSortedDesc}
                                    >
                                        {column.render("Header")}
                                    </TableHead>
                                );
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {getRows()}
                    {extraRow && (
                        <tr key="extra">
                            <td className="data-cell table-extra-row" colSpan={999}>
                                {extraRow}
                            </td>
                        </tr>
                    )}
                    <tr key="last-row" className="last-row" ref={ref} />
                </tbody>
                {sumColumns && rows.length > 1 && (
                    <tfoot>
                        <tr>
                            {columns.map((col, colIndex) => (
                                <th key={`col-sum-${colIndex}`}>
                                    {col.summable
                                        ? formatPrice(
                                              rows
                                                  .map((row) => {
                                                      const val = row.cells[colIndex].value;
                                                      const count = row.original?.count ? row.original.count : 1;
                                                      if (isNaN(val)) {
                                                          return false;
                                                      }
                                                      return val * count;
                                                  })
                                                  .filter(Boolean)
                                                  .reduce(
                                                      (previousValue, currentValue) => previousValue + currentValue,
                                                      0,
                                                  ),
                                          )
                                        : ""}
                                </th>
                            ))}
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}

export default DataTable;
