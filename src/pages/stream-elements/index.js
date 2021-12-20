import './index.css';

function StreamElements() {
    return <div
        className = {'page-wrapper stream-elements-page-wrapper'}
    >
        <h1>
            Tarkov Tools StreamElements integration
        </h1>
        <p>
            You can add command to your StreamElements bot to get price check in your twitch / youtube channel chat
        </p>
        <h2>
            Instructions
        </h2>
        <p>
            <ul>
                <li>
                    Register at <a href="https://streamelements.com/">streamelements.com</a> using your twitch / youtube account
                </li>
                <li>
                    Go to dashboard <a href="https://streamelements.com/dashboard">streamelements.com/dashboard</a>
                </li>
                <li>
                    Click the "Join Channel" button
                </li>
            </ul>
            <img
                alt = 'StreamElements step 1'
                src = {`${process.env.PUBLIC_URL}/images/streamelements-1.jpg`}
            />
        </p>
        <p>
            <ul>
                <li>
                    Make bot - moderator, just type /mod streamelements in your chat
                </li>
                <li>
                    Go to custom commands <a href="https://streamelements.com/dashboard/bot/commands/custom">streamelements.com/dashboard/bot/commands/custom</a>
                </li>
                <li>
                    Press the "Add new command" button
                </li>
            </ul>
            <img
                alt = 'StreamElements step 2'
                src = {`${process.env.PUBLIC_URL}/images/streamelements-2.jpg`}
            />
        </p>
        <p>
            <ul>
                <li>
                    Command: !p or anything you like
                </li>
                <li>
                    Message:
                    <pre>
                        $(urlfetch https://tarkov-tools.com/webhook/stream-elements?q=$(querystring))
                    </pre>
                </li>
                <li>
                    Press "Activate Command"
                </li>
            </ul>
            <img
                alt = 'StreamElements part 3'
                src = {`${process.env.PUBLIC_URL}/images/streamelements-3.jpg`}
            />
        </p>
        <p>
            Big thanks to <a href="https://www.twitch.tv/PhreakinPhil">PhreakinPhil</a> for feedback
        </p>
    </div>;
};

export default StreamElements;
