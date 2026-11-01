// MUI's TableCell applies its own typography, color, alignment, padding and bottom border.
// Revert those to the browser defaults so the cells are styled only by index.css, as plain th/td elements are.
const cellResetSx = {
    fontFamily: "revert",
    fontSize: "revert",
    fontWeight: "revert",
    lineHeight: "revert",
    letterSpacing: "revert",
    color: "revert",
    textAlign: "revert",
    padding: "revert",
    borderBottom: "revert",
};

export default cellResetSx;
