import Icon from '@mdi/react';
import { mdiCloseOctagon, mdiClockAlertOutline } from '@mdi/js';
import { useTranslation } from 'react-i18next';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

import ValueCell from '../value-cell';

const FleaPriceCell = function (props) {
    const { t } = useTranslation();

    if (props.row.original.types.includes('noFlea')) {
        return (
            <ValueCell
                value={props.value}
                noValue={
                    <div className="center-content">
                        <Tippy
                            placement="bottom"
                            content={t(
                                "This item can't be sold on the Flea Market",
                            )}
                        >
                            <Icon
                                path={mdiCloseOctagon}
                                size={1}
                                className="icon-with-text"
                            />
                        </Tippy>
                    </div>
                }
            />
        );
    }

    return (
        <ValueCell
            value={props.value}
            noValue={
                <div className="center-content">
                    <Tippy
                        placement="bottom"
                        content={t('No flea price seen in the past 24 hours')}
                    >
                        <Icon
                            path={mdiClockAlertOutline}
                            size={1}
                            className="icon-with-text"
                        />
                    </Tippy>
                </div>
            }
        />
    );
};

export default FleaPriceCell;
