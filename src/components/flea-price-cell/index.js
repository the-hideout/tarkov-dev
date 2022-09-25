import Icon from '@mdi/react';
import { 
    mdiCloseOctagon,
    mdiHelpRhombus,
    mdiTimerSand,
} from '@mdi/js';
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

    let noFleaPrice = (
        <div className="center-content">
            <Tippy
                placement="bottom"
                content={t('Not scanned on the Flea Market')}
            >
                <Icon
                    path={mdiHelpRhombus}
                    size={1}
                    className="icon-with-text"
                />
            </Tippy>
        </div>
    );
    if (props.row.original.cached) {
        noFleaPrice = (
            <div className="center-content">
                <Tippy
                    placement="bottom"
                    content={t('Flea market prices loading')}
                >
                    <Icon
                        path={mdiTimerSand}
                        size={1}
                        className="icon-with-text"
                    />
                </Tippy>
            </div>
        );
    }
    return (
        <ValueCell
            value={props.value}
            count={props.row.original.count}
            noValue={noFleaPrice}
        />
    );
};

export default FleaPriceCell;
