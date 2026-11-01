// Built-in column sort types, matching the behavior of react-table v7.
// Each function sorts in ascending order; direction is applied by the caller.

const reSplitAlphaNumeric = /([0-9]+)/gm;

// Mixed sorting is slow, but very inclusive of many edge cases.
// It handles numbers, mixed alphanumeric combinations, and even
// null, undefined, and Infinity
export const alphanumeric = (rowA, rowB, columnId) => {
    let [a, b] = getRowValuesByColumnID(rowA, rowB, columnId);

    // Force to strings (or "" for unsupported types)
    a = toString(a);
    b = toString(b);

    // Split on number groups, but keep the delimiter
    // Then remove falsey split values
    a = a.split(reSplitAlphaNumeric).filter(Boolean);
    b = b.split(reSplitAlphaNumeric).filter(Boolean);

    while (a.length && b.length) {
        const aa = a.shift();
        const bb = b.shift();

        const an = parseInt(aa, 10);
        const bn = parseInt(bb, 10);

        const combo = [an, bn].sort();

        // Both are string
        if (isNaN(combo[0])) {
            if (aa > bb) {
                return 1;
            }
            if (bb > aa) {
                return -1;
            }
            continue;
        }

        // One is a string, one is a number
        if (isNaN(combo[1])) {
            return isNaN(an) ? -1 : 1;
        }

        // Both are numbers
        if (an > bn) {
            return 1;
        }
        if (bn > an) {
            return -1;
        }
    }

    return a.length - b.length;
};

export function datetime(rowA, rowB, columnId) {
    const [a, b] = getRowValuesByColumnID(rowA, rowB, columnId);

    return compareBasic(a.getTime(), b.getTime());
}

export function basic(rowA, rowB, columnId) {
    const [a, b] = getRowValuesByColumnID(rowA, rowB, columnId);

    return compareBasic(a, b);
}

export function string(rowA, rowB, columnId) {
    let [a, b] = getRowValuesByColumnID(rowA, rowB, columnId);

    a = a.split("").filter(Boolean);
    b = b.split("").filter(Boolean);

    while (a.length && b.length) {
        const aa = a.shift();
        const bb = b.shift();

        const alower = aa.toLowerCase();
        const blower = bb.toLowerCase();

        // Case insensitive comparison until characters match
        if (alower > blower) {
            return 1;
        }
        if (blower > alower) {
            return -1;
        }
        // If lowercase characters are identical
        if (aa > bb) {
            return 1;
        }
        if (bb > aa) {
            return -1;
        }
    }

    return a.length - b.length;
}

export function number(rowA, rowB, columnId) {
    const [a, b] = getRowValuesByColumnID(rowA, rowB, columnId);

    const replaceNonNumeric = /[^0-9.]/gi;

    return compareBasic(
        Number(String(a).replace(replaceNonNumeric, "")),
        Number(String(b).replace(replaceNonNumeric, "")),
    );
}

function compareBasic(a, b) {
    return a === b ? 0 : a > b ? 1 : -1;
}

function getRowValuesByColumnID(row1, row2, columnId) {
    return [row1.values[columnId], row2.values[columnId]];
}

function toString(a) {
    if (typeof a === "number") {
        if (isNaN(a) || a === Infinity || a === -Infinity) {
            return "";
        }
        return String(a);
    }
    if (typeof a === "string") {
        return a;
    }
    return "";
}
