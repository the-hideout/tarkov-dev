import './index.css';

function RewardImage({ count, iconLink, height = '64', width = '64', isTool = false, functional = false }) {
    let imageClass = 'reward-image-img';
    if (isTool) {
        imageClass = 'reward-image-img-tool';
    } else if (functional) {
        imageClass = 'reward-image-img-functional';
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
