import './index.css';

function RewardImage({ count, iconLink, height = '64', width = '64' }) {
    return (
        <div className="reward-image-wrapper">
            {count && <span className="reward-count-wrapper">{count}</span>}
            <img
                alt=""
                className="table-image"
                loading="lazy"
                height={height}
                width={width}
                src={iconLink}
            />
        </div>
    );
}

export default RewardImage;
