import { useEffect } from "react";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from "@mui/material";
import { useInView } from "react-intersection-observer";
import useStateWithLocalStorage from "#src/hooks/useStateWithLocalStorage.jsx";
import formatPrice from "#src/modules/format-price.js";
import HeaderCell from "#src/components/data-table/HeaderCell.tsx";
import useDataTable, { flexRender } from "#src/components/data-table/useDataTable.jsx";
import cellResetSx from "#src/components/data-table/cellResetSx.js";

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

    const table = useDataTable({
        columns,
        data,
        initialSortBy,
        initialPageSize: maxItems || 10,
        autoResetSortBy,
        disableSortBy,
    });
    const {
        columns: tableColumns,
        rows,
        page,
        setSortBy,
        setPageSize,
        state: { sortBy: sortByState, pageSize },
    } = table;

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
    }, [nameFilter]);

    useEffect(() => {
        if (autoScroll && inView && data.length > pageSize) {
            setPageSize(pageSize + 50);
        }
    }, [inView, autoScroll]);

    const getRows = () => {
        let rowContainer = rows;

        if (maxItems) {
            rowContainer = page;
        }

        return rowContainer.map((row, i) => (
            <TableRow key={`data-table-row-${i}`} className={row.depth >= 1 ? "expanded" : ""}>
                {row.cells.map((cell) => (
                    <TableCell key={`cell_${row.id}_${cell.column.id}`} className="data-cell" sx={cellResetSx}>
                        {flexRender(cell.column.Cell, { ...table, column: cell.column, row, cell, value: cell.value })}
                    </TableCell>
                ))}
            </TableRow>
        ));
    };

    return (
        <div className="table-wrapper">
            <Table className={`data-table ${className ?? ""}`}>
                <TableHead>
                    <TableRow>
                        {tableColumns.map((column, index) => {
                            const headAlign = headConfig?.align?.find((h) => h.id === column.id)?.align || "center";

                            return (
                                <HeaderCell
                                    key={`header_${column.id}_${index}`}
                                    headProps={column.getSortByToggleProps({ title: undefined })}
                                    align={headAlign}
                                    isSorted={column.isSorted}
                                    isSortedDesc={column.isSortedDesc}
                                >
                                    {flexRender(column.Header, { ...table, column })}
                                </HeaderCell>
                            );
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {getRows()}
                    {extraRow && (
                        <TableRow key="extra">
                            <TableCell className="data-cell table-extra-row" colSpan={999} sx={cellResetSx}>
                                {extraRow}
                            </TableCell>
                        </TableRow>
                    )}
                    <TableRow key="last-row" className="last-row" ref={ref} />
                </TableBody>
                {sumColumns && rows.length > 1 && (
                    <TableFooter>
                        <TableRow>
                            {columns.map((col, colIndex) => (
                                <TableCell component="th" key={`col-sum-${colIndex}`} sx={cellResetSx}>
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
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </div>
    );
}

export default DataTable;
