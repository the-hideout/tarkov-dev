import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import './index.css';

function UkraineButton({ large=false, linkStyle }) {
    const { t } = useTranslation();

    return (
        <Button
            style={{...linkStyle, ...(large ? {width: "100%"} : '')}}
            className={'ua-button'}
            variant="contained"
            href="https://www.icrc.org/en/donate/ukraine"
            target="_blank" rel="noopener noreferrer"
        >
            {t('Support Ukraine')}
        </Button>
    );
}

export default UkraineButton;
