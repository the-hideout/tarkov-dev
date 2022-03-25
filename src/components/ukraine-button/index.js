// import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import './index.css';

function UkraineButton({ onlyLarge, linkStyle, wrapperStyle, text, children }) {
    // const { t } = useTranslation();

    return (
        <Button
            style={linkStyle}
            className={'ua-button'}
            variant="contained"
            href="https://www.icrc.org/en/donate/ukraine"
        >
            Support Ukraine
        </Button>
    );

    // return (
    //     <p
    //         className={`ukraine-wrapper ${onlyLarge ? 'only-large' : ''}`}
    //         style={wrapperStyle}
    //     >
    //         <a href="https://www.icrc.org/en/donate/ukraine" style={linkStyle}>
    //             {children ? children : t('Support Ukraine')}
    //         </a>
    //     </p>
    // );
}

export default UkraineButton;
