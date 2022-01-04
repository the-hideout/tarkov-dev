import { useQuery } from 'react-query';

import './index.css';

function ServerStatus() {
    const { status, data } = useQuery(`server-status`, () =>
        fetch('https://tarkov-tools.com/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: dataQuery,
            })
            .then(response => response.json() )
    );

    const dataQuery = JSON.stringify({query: `{
        status {
            generalStatus {
                name
                message
                status
            }
        }
    }`});

    if(status !== 'success'){
        return null;
    }

    if(status === 'success' && data.data.status.length === 0){
        return 'No data';
    }

    return <div
        className={`server-status-wrapper`}
    >
        <a
            href = 'https://status.escapefromtarkov.com/'
        >
            {`Tarkov server status`}
            <div
                className={`status-indicator  status-${data.data.status.generalStatus.status}`}
            />
            <div
                className='server-status-message-wrapper'
            >
                {data.data.status.generalStatus.message}
            </div>
        </a>
    </div>;
}

export default ServerStatus;