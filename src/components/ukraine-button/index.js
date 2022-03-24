import { useTranslation } from 'react-i18next';

import './index.css';
function UkraineButton({ onlyLarge, linkStyle, wrapperStyle, text, children }) {
    const { t } = useTranslation();

    return (
        <p
            className={`ukraine-wrapper ${onlyLarge ? 'only-large' : ''}`}
            style={wrapperStyle}
        >
            <a href="https://www.icrc.org/en/donate/ukraine" style={linkStyle}>
                {children ? children : t('Support Ukraine')}
            </a>
        </p>
    );
}

export default UkraineButton;
