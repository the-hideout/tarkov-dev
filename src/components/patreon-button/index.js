import { useTranslation } from 'react-i18next';

import './index.css';

function PatreonButton({ onlyLarge, linkStyle, wrapperStyle, text, children }) {
    const { t } = useTranslation();

    return (
        <p
            className={`become-supporter-wrapper ${
                onlyLarge ? 'only-large' : ''
            }`}
            style={wrapperStyle}
        >
            <a
                href="https://www.patreon.com/bePatron?u=26501878&redirect_uri=https%3A%2F%2Ftarkov-tools.com"
                style={linkStyle}
            >
                {children ? children : t('Become a patron')}
            </a>
        </p>
    );
}

export default PatreonButton;
