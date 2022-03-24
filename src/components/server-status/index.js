import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import './index.css';

function ServerStatus() {
    const { status, data } = useQuery(
        `server-status`,
        () =>
            fetch('https://api.tarkov.dev/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: dataQuery,
            }).then((response) => response.json()),
        {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        },
    );
    const { t } = useTranslation();

    const dataQuery = JSON.stringify({
        query: `{
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
    });

    if (status !== 'success' || !data.data.status) {
        return null;
    }

    if (status === 'success' && data.data.status.length === 0) {
        return 'No data';
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
                    <a href="https://status.escapefromtarkov.com/">
                        {t(`Tarkov server status`)}
                        <div
                            className={`status-indicator status-${data.data.status.generalStatus.status}`}
                        />
                        <div className="server-status-message-wrapper">
                            {data.data.status.generalStatus.message}
                        </div>
                    </a>
                </Tippy>
            </div>
        );
    }

    return (
        <div className={`server-status-wrapper`}>
            <a href="https://status.escapefromtarkov.com/">
                {t(`Tarkov server status`)}
                <div
                    className={`status-indicator status-${data.data.status.generalStatus.status}`}
                />
                <div className="server-status-message-wrapper">
                    {data.data.status.generalStatus.message}
                </div>
            </a>
        </div>
    );
}

export default ServerStatus;
