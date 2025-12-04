import './index.css';

function loyaltyLevelIcon({ loyaltyLevel }) {
    let loyaltyLevelString = loyaltyLevel;

    if (loyaltyLevel < 4) {
        loyaltyLevelString = new Array(loyaltyLevel).fill('I').join('');
    }

    return (
        <div className="loyalty-level-parent">
            <div className="loyalty-level-wrapper">{loyaltyLevelString}</div>
        </div>
    );
}

export default loyaltyLevelIcon;
