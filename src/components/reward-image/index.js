import './index.css';

function RewardImage({ count, iconLink, height = '64', width = '64', isTool = false, nonFunctional = false }) {
    let imageClass = 'reward-image-img';
    if (isTool) {
        imageClass = 'reward-image-img-tool';
    } else if (nonFunctional) {
        imageClass = 'reward-image-img-nonfunctional';
    }
    return (
        <div className="reward-image-wrapper">
            {count && <span className="reward-image-count">{count}</span>}
            <img
                alt=""
                className={imageClass}
                loading="lazy"
                height={height}
                width={width}
                src={iconLink}
            />
        </div>
    );
}

export default RewardImage;
