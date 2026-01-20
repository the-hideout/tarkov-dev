import clsx from "clsx";
import { TableHeaderProps } from "react-table";

import "./index.css";
import ArrowIcon from "#src/components/data-table/Arrow.jsx";

export default function TableHead({
    itemKey,
    headProps,
    children,
    align = "center",
    isSorted,
    isSortedDesc,
}: {
    itemKey: string;
    children: React.ReactNode;
    align: "left" | "center" | "right";
    isSorted?: boolean;
    isSortedDesc?: boolean;
    headProps: TableHeaderProps;
}) {
    return (
        <th
            {...headProps}
            key={itemKey}
            className={clsx(headProps.className, {
                "table-head--left": align === "left",
                "table-head--right": align === "right",
                "table-head--center": align === "center",
            })}
        >
            <span>{children}</span>

            <i
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
        </th>
    );
}
