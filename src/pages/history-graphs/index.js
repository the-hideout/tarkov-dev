import './index.css';

function HistoryGraphs() {
    return <div
        className = {'page-wrapper history-graphs-page-wrapper'}
    >
        <h1>
            12.12 KEYS - MARKET PRICING HISTORY
        </h1>
        <div
            className='history-wrapper'
        >
            <h2>
                Labs
            </h2>
            <iframe
                title='history graphs'
                src='https://assets.tarkov-tools.com/history-graphs/labs.html'
            />
        </div>
        <div
            className='history-wrapper'
        >
            <h2>
                Interchange
            </h2>
            <iframe
                title='history graphs'
                src='https://assets.tarkov-tools.com/history-graphs/interchange.html'
            />
        </div>
        <div
            className='history-wrapper'
        >
            <h2>
                Shoreline
            </h2>
            <iframe
                title='history graphs'
                src='https://assets.tarkov-tools.com/history-graphs/shoreline.html'
            />
        </div>
        <div
            className='history-wrapper'
        >
            <h2>
                Reserve
            </h2>
            <iframe
                title='history graphs'
                src='https://assets.tarkov-tools.com/history-graphs/reserve.html'
            />
        </div>
        <p
            className='attribution-wrapper'
        >
            Graphs made by Drufus
        </p>
    </div>;
};

export default HistoryGraphs;
