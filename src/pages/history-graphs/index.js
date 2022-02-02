import { useTranslation } from 'react-i18next';

import './index.css';

function HistoryGraphs() {
    const { t } = useTranslation();
    return (
        <div className={'page-wrapper history-graphs-page-wrapper'}>
            <h1>{t('12.12 KEYS - MARKET PRICING HISTORY')}</h1>
            <div className="history-wrapper">
                <h2>{t('Labs')}</h2>
                <iframe
                    title="history graphs"
                    src="https://assets.tarkov-tools.com/history-graphs/labs.html"
                />
            </div>
            <div className="history-wrapper">
                <h2>{t('Interchange')}</h2>
                <iframe
                    title="history graphs"
                    src="https://assets.tarkov-tools.com/history-graphs/interchange.html"
                />
            </div>
            <div className="history-wrapper">
                <h2>{t('Shoreline')}</h2>
                <iframe
                    title="history graphs"
                    src="https://assets.tarkov-tools.com/history-graphs/shoreline.html"
                />
            </div>
            <div className="history-wrapper">
                <h2>{t('Reserve')}</h2>
                <iframe
                    title="history graphs"
                    src="https://assets.tarkov-tools.com/history-graphs/reserve.html"
                />
            </div>
            <p className="attribution-wrapper">{t('Graphs made by')} Drufus</p>
        </div>
    );
}

export default HistoryGraphs;
