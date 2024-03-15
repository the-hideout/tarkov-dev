import { useTranslation } from 'react-i18next';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import { Icon } from '@mdi/react';
import { mdiTimerSand } from '@mdi/js';

function FleaMarketLoadingIcon({
    size = 1,
    tooltip
}) {
    const { t } = useTranslation();

    if (!tooltip) {
        tooltip = t('Flea market prices loading');
    }

    return (
        <Tippy
            placement="bottom"
            content={tooltip}
        >
            <Icon
                path={mdiTimerSand}
                size={size}
                className="icon-with-text"
            />
        </Tippy>
    );
}

export default FleaMarketLoadingIcon;
