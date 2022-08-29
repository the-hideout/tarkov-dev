import { useTranslation } from 'react-i18next';

import './index.css';

function LoadingSmall() {
    const { t } = useTranslation();

    return (
        <div className={`loading-wipe`}>
            {t('Loading...')}
        </div>
    );
}

export default LoadingSmall;
