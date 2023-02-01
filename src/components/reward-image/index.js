import './index.css';

function RewardImage({ count, iconLink, height = '64', width = '64', isTool = false }) {
    return (
        <div className="reward-image-wrapper">
            {count && <span className="reward-image-count">{count}</span>}
            <img
                alt=""
                className={isTool === false ? "reward-image-img" : "reward-image-img-tool"}
                loading="lazy"
                height={height}
                width={width}
                src={iconLink}
            />
        </div>
    );
}

export default RewardImage;
