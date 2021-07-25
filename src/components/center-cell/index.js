const CenterCell = ({ value, nowrap = false }) => {
    return <div
        className = {`center-content ${nowrap ? 'nowrap-content': ''}`}
    >
        { value }
    </div>;
};

export default CenterCell;