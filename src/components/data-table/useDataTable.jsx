import { useCallback, useMemo, useState } from "react";

import * as sortTypes from "#src/components/data-table/sortTypes.js";

// Table state and row model for DataTable.
// Column definitions, row objects and sorting semantics follow react-table v7
// (Header, Cell, accessor, sortType, sortDescFirst, row.values, row.original,
// subRows expansion, etc.) so existing column definitions keep working.

const defaultCellRenderer = ({ value = "" }) => value;
const emptyRenderer = () => <>&nbsp;</>;

// Functions and memo/forwardRef components are rendered as elements so they can
// use hooks; anything else (strings, JSX, null) is rendered as-is.
export function flexRender(Comp, props) {
    return isReactComponent(Comp) ? <Comp {...props} /> : Comp;
}

function isReactComponent(component) {
    return (
        typeof component === "function" ||
        (typeof component === "object" &&
            component !== null &&
            typeof component.$$typeof === "symbol" &&
            ["react.memo", "react.forward_ref"].includes(component.$$typeof.description))
    );
}

function getFirstDefined(...args) {
    return args.find((arg) => typeof arg !== "undefined");
}

// Merges prop objects left to right; later props win, but styles are merged and classNames joined
function mergeProps(...propList) {
    return propList.reduce((props, next) => {
        const { style, className, ...rest } = next;

        props = {
            ...props,
            ...rest,
        };

        if (style) {
            props.style = props.style ? { ...props.style, ...style } : style;
        }

        if (className) {
            props.className = props.className ? `${props.className} ${className}` : className;
        }

        return props;
    }, {});
}

// Turns a string accessor like "a.b[0].c" into a function returning that value (or undefined)
function makeAccessor(accessor) {
    const path = accessor.replace(/\[/g, ".").replace(/\]/g, "").split(".");

    return (row) => {
        let val;
        try {
            val = path.reduce((cursor, pathPart) => cursor[pathPart], row);
        } catch {
            // continue regardless of error
        }
        return val;
    };
}

function prepareColumns(columns) {
    return columns.map((column) => {
        let { id, accessor } = column;

        if (typeof accessor === "string") {
            id = id || accessor;
            accessor = makeAccessor(accessor);
        }

        if (!id && typeof column.Header === "string" && column.Header) {
            id = column.Header;
        }

        if (!id) {
            console.error(column);
            throw new Error("A column ID (or string accessor) is required!");
        }

        return {
            Header: emptyRenderer,
            Cell: defaultCellRenderer,
            sortType: "alphanumeric",
            sortDescFirst: false,
            ...column,
            id,
            accessor,
        };
    });
}

function buildRows(data, columns) {
    const rows = [];
    const rowsById = {};

    const accessRow = (original, index, depth, parent, parentRows) => {
        const id = parent ? `${parent.id}.${index}` : `${index}`;
        const row = {
            id,
            original,
            index,
            depth,
            values: {},
        };

        parentRows.push(row);
        rowsById[id] = row;

        row.subRows = [];
        (original.subRows || []).forEach((subRow, i) => accessRow(subRow, i, depth + 1, row, row.subRows));

        columns.forEach((column) => {
            if (column.accessor) {
                row.values[column.id] = column.accessor(original, index, row, parentRows, data);
            }
        });
    };

    data.forEach((original, index) => accessRow(original, index, 0, undefined, rows));

    return { rows, rowsById };
}

// Sorts using each sort function in turn; directions are true for ascending.
// Ties fall back to the original row order (reversed when the first direction is descending).
function orderBy(rows, sortFns, directions) {
    return [...rows].sort((rowA, rowB) => {
        for (let i = 0; i < sortFns.length; i += 1) {
            const sortInt = sortFns[i](rowA, rowB);
            if (sortInt !== 0) {
                return directions[i] === false ? -sortInt : sortInt;
            }
        }
        return directions[0] ? rowA.index - rowB.index : rowB.index - rowA.index;
    });
}

function sortRows(rows, sortBy, columns) {
    if (!sortBy.length) {
        return rows;
    }

    // Ignore sorting on columns that don't exist
    const availableSortBy = sortBy.filter((sort) => columns.some((column) => column.id === sort.id));

    const sortFns = availableSortBy.map((sort) => {
        const { sortType } = columns.find((column) => column.id === sort.id);
        const sortMethod = typeof sortType === "function" ? sortType : sortTypes[sortType];

        if (!sortMethod) {
            throw new Error(`Could not find a valid sortType of '${sortType}' for column '${sort.id}'.`);
        }

        return (a, b) => sortMethod(a, b, sort.id, sort.desc);
    });
    const directions = availableSortBy.map((sort) => {
        const column = columns.find((column) => column.id === sort.id);
        return column.sortInverted ? sort.desc : !sort.desc;
    });

    const sortData = (rowsToSort) =>
        orderBy(rowsToSort, sortFns, directions).map((row) =>
            row.subRows.length ? { ...row, subRows: sortData(row.subRows) } : row,
        );

    return sortData(rows);
}

function toggleSortByState(sortBy, columns, columnId, desc, multi) {
    const { sortDescFirst } = columns.find((column) => column.id === columnId);
    const existingSortBy = sortBy.find((d) => d.id === columnId);
    const existingIndex = sortBy.findIndex((d) => d.id === columnId);
    const hasDescDefined = typeof desc !== "undefined" && desc !== null;

    let sortAction;

    if (multi) {
        sortAction = existingSortBy ? "toggle" : "add";
    } else if (existingIndex !== sortBy.length - 1 || sortBy.length !== 1) {
        sortAction = "replace";
    } else {
        sortAction = existingSortBy ? "toggle" : "replace";
    }

    // Toggling past the last direction removes the sort
    if (
        sortAction === "toggle" &&
        !hasDescDefined &&
        ((existingSortBy.desc && !sortDescFirst) || (!existingSortBy.desc && sortDescFirst))
    ) {
        sortAction = "remove";
    }

    if (sortAction === "replace") {
        return [{ id: columnId, desc: hasDescDefined ? desc : sortDescFirst }];
    }
    if (sortAction === "add") {
        return [...sortBy, { id: columnId, desc: hasDescDefined ? desc : sortDescFirst }];
    }
    if (sortAction === "toggle") {
        return sortBy.map((d) =>
            d.id === columnId ? { ...d, desc: hasDescDefined ? desc : !existingSortBy.desc } : d,
        );
    }
    return sortBy.filter((d) => d.id !== columnId);
}

// Flattens rows into display order, including the sub rows of expanded rows
function expandRows(rows, expanded, columns, toggleRowExpanded) {
    const expandedRows = [];

    const handleRow = (baseRow) => {
        const row = {
            ...baseRow,
            isExpanded: baseRow.original?.expanded || expanded[baseRow.id],
            canExpand: !!baseRow.subRows.length,
            toggleRowExpanded: (set) => toggleRowExpanded(baseRow.id, set),
        };
        row.getToggleRowExpandedProps = (userProps = {}) =>
            mergeProps(
                {
                    onClick: () => row.toggleRowExpanded(),
                    style: { cursor: "pointer" },
                    title: "Toggle Row Expanded",
                },
                userProps,
            );
        row.cells = columns.map((column) => ({
            column,
            row,
            value: row.values[column.id],
        }));

        expandedRows.push(row);

        if (row.canExpand && row.isExpanded) {
            row.subRows.forEach(handleRow);
        }
    };

    rows.forEach(handleRow);

    return expandedRows;
}

function useDataTable({
    columns,
    data,
    initialSortBy = [],
    initialPageSize = 10,
    autoResetSortBy = true,
    disableSortBy,
}) {
    const [sortBy, setSortBy] = useState(initialSortBy);
    const [expanded, setExpanded] = useState({});
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Reset sorting and expanded rows when the data changes
    const [lastData, setLastData] = useState(data);
    if (data !== lastData) {
        setLastData(data);
        setExpanded({});
        if (autoResetSortBy) {
            setSortBy(initialSortBy);
        }
    }

    const preparedColumns = useMemo(() => prepareColumns(columns), [columns]);
    const { rows: baseRows, rowsById } = useMemo(() => buildRows(data, preparedColumns), [data, preparedColumns]);

    const toggleSortBy = useCallback(
        (columnId, desc, multi) => {
            setSortBy((currentSortBy) => toggleSortByState(currentSortBy, preparedColumns, columnId, desc, multi));
        },
        [preparedColumns],
    );

    const toggleRowExpanded = useCallback((id, value) => {
        setExpanded((currentExpanded) => {
            const exists = currentExpanded[id];
            const shouldExist = typeof value !== "undefined" ? value : !exists;

            if (!exists && shouldExist) {
                return { ...currentExpanded, [id]: true };
            }
            if (exists && !shouldExist) {
                const rest = { ...currentExpanded };
                delete rest[id];
                return rest;
            }
            return currentExpanded;
        });
    }, []);

    const rowIds = Object.keys(rowsById);
    const isAllRowsExpanded = rowIds.length > 0 && rowIds.every((id) => expanded[id]);

    const toggleAllRowsExpanded = useCallback(
        (value) => {
            setExpanded((currentExpanded) => {
                const ids = Object.keys(rowsById);
                const expandAll =
                    typeof value !== "undefined" ? value : ids.length !== Object.keys(currentExpanded).length;

                return expandAll ? Object.fromEntries(ids.map((id) => [id, true])) : {};
            });
        },
        [rowsById],
    );

    const getToggleAllRowsExpandedProps = (userProps = {}) =>
        mergeProps(
            {
                onClick: () => toggleAllRowsExpanded(),
                style: { cursor: "pointer" },
                title: "Toggle All Rows Expanded",
            },
            userProps,
        );

    const tableColumns = useMemo(
        () =>
            preparedColumns.map((column) => {
                const canSort = column.accessor
                    ? getFirstDefined(
                          column.disableSortBy === true ? false : undefined,
                          disableSortBy === true ? false : undefined,
                          true,
                      )
                    : getFirstDefined(column.canSort, false);
                const sortedIndex = sortBy.findIndex((d) => d.id === column.id);
                const isSorted = sortedIndex !== -1;

                return {
                    ...column,
                    canSort,
                    isSorted,
                    sortedIndex,
                    isSortedDesc: isSorted ? sortBy[sortedIndex].desc : undefined,
                    toggleSortBy: canSort ? (desc, multi) => toggleSortBy(column.id, desc, multi) : undefined,
                    getSortByToggleProps: (userProps = {}) =>
                        mergeProps(
                            {
                                // Shift-click adds the column to a multi-column sort
                                onClick: canSort ? (e) => toggleSortBy(column.id, undefined, e.shiftKey) : undefined,
                                style: { cursor: canSort ? "pointer" : undefined },
                                title: canSort ? "Toggle SortBy" : undefined,
                            },
                            userProps,
                        ),
                };
            }),
        [preparedColumns, sortBy, disableSortBy, toggleSortBy],
    );

    const sortedRows = useMemo(() => sortRows(baseRows, sortBy, preparedColumns), [baseRows, sortBy, preparedColumns]);
    const rows = useMemo(
        () => expandRows(sortedRows, expanded, tableColumns, toggleRowExpanded),
        [sortedRows, expanded, tableColumns, toggleRowExpanded],
    );
    const page = useMemo(() => rows.slice(0, pageSize), [rows, pageSize]);

    return {
        columns: tableColumns,
        data,
        rows,
        page,
        state: {
            sortBy,
            expanded,
            pageSize,
            pageIndex: 0,
        },
        setSortBy,
        toggleSortBy,
        setPageSize,
        isAllRowsExpanded,
        toggleRowExpanded,
        toggleAllRowsExpanded,
        getToggleAllRowsExpandedProps,
    };
}

export default useDataTable;
