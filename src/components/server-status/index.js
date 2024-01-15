import { useTranslation } from 'react-i18next';
// import ApiMetricsGraph from '../../components/api-metrics-graph/index.js';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional

import { useQuery } from '../../modules/graphql-request.mjs';

import './index.css';

function ServerStatus() {
    const { status, data } = useQuery(
        `server-status`,
        `{
            status {
                generalStatus {
                    name
                    message
                    status
                }
                messages {
                    time
                    type
                    content
                    solveTime
                }
            }
        }`,
    );
    const { t } = useTranslation();

    if (status !== 'success' || !data.data.status) {
        return null;
    }

    if (status === 'success' && data.data.status.length === 0) {
        return t('No data');
    }

    if (
        data.data.status.messages[0]?.content &&
        !data.data.status.messages[0]?.solveTime
    ) {
        return (
            <div className={`server-status-wrapper`}>
                <Tippy
                    placement="top"
                    content={data.data.status.messages[0]?.content}
                >
                    <a href="https://status.escapefromtarkov.com/" target="_blank" rel="noopener noreferrer">
                        {t(`Tarkov server status`)}
                        <div
                            className={`status-indicator status-${data.data.status.generalStatus.status}`}
                        />
                        <div className="server-status-message-wrapper">
                            {data.data.status.generalStatus.message}
                        </div>
                    </a>
                </Tippy>
                {/* <ApiMetricsGraph graph={false} /> */}
            </div>
        );
    }

    return (
        <div className={`server-status-wrapper`}>
            <a href="https://status.escapefromtarkov.com/" target="_blank" rel="noopener noreferrer">
                {t(`Tarkov server status`)}
                <div
                    className={`status-indicator status-${data.data.status.generalStatus.status}`}
                />
                <div className="server-status-message-wrapper">
                    {data.data.status.generalStatus.message}
                </div>
            </a>
            {/* <p>{t('API Latency')}{': '}<ApiMetricsGraph graph={false} /></p> */}
        </div>
    );
}

export default ServerStatus;
