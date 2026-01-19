import clsx from "clsx";

function ArrowIcon({
    className,
    direction = "down",
}: {
    className?: string;
    direction?: "up" | "down" | "left" | "right";
}) {
    return (
        <svg
            className={clsx("arrow-icon", className, {
                "arrow-icon--up": direction === "up",
                "arrow-icon--down": direction === "down",
                "arrow-icon--left": direction === "left",
                "arrow-icon--right": direction === "right",
            })}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 284.9 284.9"
        >
            <path d="M282 77l-14-15a9 9 0 00-13 0L142 174 30 62a9 9 0 00-13 0L3 77a9 9 0 000 13l133 133a9 9 0 0013 0L282 90a9 9 0 000-13z" />
        </svg>
    );
}

export default ArrowIcon;
