import clsx from "clsx";
import { TableCell, type TableCellProps } from "@mui/material";

import "./index.css";
import ArrowIcon from "#src/components/data-table/Arrow.jsx";
import cellResetSx from "#src/components/data-table/cellResetSx.js";

export default function HeaderCell({
    headProps,
    children,
    align = "center",
    isSorted,
    isSortedDesc,
}: {
    children: React.ReactNode;
    align: "left" | "center" | "right";
    isSorted?: boolean;
    isSortedDesc?: boolean;
    headProps: Pick<TableCellProps, "onClick" | "style" | "title" | "className">;
}) {
    return (
        <TableCell
            {...headProps}
            sx={cellResetSx}
            sortDirection={isSorted ? (isSortedDesc ? "desc" : "asc") : false}
            className={clsx(headProps.className, {
                "table-head--left": align === "left",
                "table-head--right": align === "right",
                "table-head--center": align === "center",
            })}
        >
            <span key="column-name">{children}</span>

            <i
                key="column-sort-icon"
                className={clsx(
                    "header-sort-icon-container",
                    !isSorted && align !== "center" && "header-sort-icon-container--h-0",
                    align === "center" ? "header-sort-icon-container--block" : "header-sort-icon-container--ml-6",
                )}
            >
                <ArrowIcon
                    className={clsx(
                        "header-sort-icon__icon",
                        isSorted ? "header-sort-icon__icon--visible" : "header-sort-icon__icon--hidden",
                    )}
                    direction={isSortedDesc ? "down" : "up"}
                />
            </i>
        </TableCell>
    );
}
