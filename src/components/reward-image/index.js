import './index.css';

function RewardImage({count, iconLink}){
    return <div
        className = 'reward-image-wrapper'
    >{count && <span
        className = 'reward-count-wrapper'
    >
        {count}
    </span>}<img
            alt = ''
            className = 'table-image'
            loading = 'lazy'
            height = '64'
            width = '64'
            src = { iconLink }
    /></div>
}

export default RewardImage;