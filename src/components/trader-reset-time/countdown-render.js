// import { useTranslation } from 'react-i18next';

function CountdownRender(props) {
    // const t = useTranslation();

    if (props.completed) {
        return <span
            className = 'countdown-wrapper'
        >
            Restock right now
        </span>;
    }

    return <span
        className = 'countdown-wrapper'
    >
        Restock in {props.formatted.hours}:{props.formatted.minutes}:{props.formatted.seconds}
    </span>;
}

export default CountdownRender;