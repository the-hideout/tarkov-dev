import './index.css';

function RewardImage({ count, iconLink, height = '64', width = '64', isTool = false }) {
    return (
        <div className="reward-image-wrapper">
            {count && <span className="reward-count-wrapper">{count}</span>}
            <img
                alt=""
                className={isTool === false ? "table-image" : "table-image-tool"}
                loading="lazy"
                height={height}
                width={width}
                src={iconLink}
            />
        </div>
    );
}

export default RewardImage;
