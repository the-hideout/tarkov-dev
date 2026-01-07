import { useTranslation } from "react-i18next";
// import ApiMetricsGraph from '../../components/api-metrics-graph/index.js';
import { Tooltip } from "@mui/material";

import useStatusData from "../../features/status/index.mjs";

import "./index.css";

function ServerStatus() {
    const { status, data } = useStatusData();
    const { t } = useTranslation();

    if (status !== "succeeded" || !data) {
        return null;
    }

    if (status === "succeeded" && data.messages.length === 0) {
        //return t('No data');
    }

    if (data.messages[0]?.content && !data.messages[0]?.solveTime) {
        return (
            <div className={`server-status-wrapper`}>
                <Tooltip placement="top" title={data.messages[0]?.content} arrow>
                    <a href="https://status.escapefromtarkov.com/" target="_blank" rel="noopener noreferrer">
                        {t(`Tarkov server status`)}
                        <div className={`status-indicator status-${data.generalStatus.status}`} />
                        <div className="server-status-message-wrapper">{data.generalStatus.message}</div>
                    </a>
                </Tooltip>
                {/* <ApiMetricsGraph graph={false} /> */}
            </div>
        );
    }

    return (
        <div className={`server-status-wrapper`}>
            <a href="https://status.escapefromtarkov.com/" target="_blank" rel="noopener noreferrer">
                {t(`Tarkov server status`)}
                <div className={`status-indicator status-${data.generalStatus.status}`} />
                <div className="server-status-message-wrapper">{data.generalStatus.message}</div>
            </a>
            {/* <p>{t('API Latency')}{': '}<ApiMetricsGraph graph={false} /></p> */}
        </div>
    );
}

export default ServerStatus;
