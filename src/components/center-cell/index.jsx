const CenterCell = ({ children, nowrap = false, value }) => {
    return (
        <div className={`center-content ${nowrap ? 'nowrap-content' : ''}`}>
            {children || value}
        </div>
    );
};

export default CenterCell;
