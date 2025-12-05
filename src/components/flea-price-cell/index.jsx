import { Icon } from '@mdi/react';
import { 
    mdiCloseOctagon,
    mdiHelpRhombus,
    mdiTimerSand,
} from '@mdi/js';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';

import ValueCell from '../value-cell/index.jsx';

const FleaPriceCell = function (props) {
    const { t } = useTranslation();

    if (props.row.original.types.includes('noFlea')) {
        return (
            <ValueCell
                value={props.value}
                noValue={
                    <div className="center-content">
                        <Tooltip
                            placement="bottom"
                            title={t(
                                "This item can't be sold on the Flea Market",
                            )}
                            arrow
                        >
                            <Icon
                                path={mdiCloseOctagon}
                                size={1}
                                className="icon-with-text"
                            />
                        </Tooltip>
                    </div>
                }
            />
        );
    }

    let noFleaTip = t('Not scanned on the Flea Market');
    let noFleaIcon = mdiHelpRhombus;
    if (props.row.original.cached) {
        noFleaTip = t('Flea market prices loading');
        noFleaIcon = mdiTimerSand;
    }
    return (
        <ValueCell
            value={props.value}
            count={props.row.original.count}
            noValue={
                <div className="center-content">
                    <Tooltip
                        placement="bottom"
                        title={noFleaTip}
                        arrow
                    >
                        <Icon
                            path={noFleaIcon}
                            size={1}
                            className="icon-with-text"
                        />
                    </Tooltip>
                </div>
            }
        />
    );
};

export default FleaPriceCell;
