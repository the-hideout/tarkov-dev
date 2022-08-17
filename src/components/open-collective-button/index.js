import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import './index.css';

function OpenCollectiveButton({ linkStyle={width: "100%"} }) {
    const { t } = useTranslation();

    return (
        <Button
            style={linkStyle}
            className={'oc-button'}
            variant="contained"
            href="https://opencollective.com/tarkov-dev"
        >
            {t('Donate')}
        </Button>
    );
}

export default OpenCollectiveButton;
