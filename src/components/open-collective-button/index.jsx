import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import './index.css';

function OpenCollectiveButton({ large=false, linkStyle }) {
    const { t } = useTranslation();

    return (
        <Button
            style={{...linkStyle, ...(large ? {width: "100%"} : '')}}
            className={'oc-button'}
            variant="contained"
            href="https://opencollective.com/tarkov-dev"
            target="_blank" rel="noopener noreferrer"
        >
            {t('Donate')}
        </Button>
    );
}

export default OpenCollectiveButton;
