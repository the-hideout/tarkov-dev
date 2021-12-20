import './index.css';

function Nightbot() {
    return <div
        className = {'page-wrapper nightbot-page-wrapper'}
    >
        <h1>
            Tarkov Tools Nightbot integration
        </h1>
        <p>
            You can add command to your nigthbot to get price check in your twitch / youtube channel chat
        </p>
        <h2>
            Instructions
        </h2>
        <p>
            <ul>
                <li>
                    Register at <a href="https://nightbot.tv">nightbot.tv</a> using your twitch / youtube account
                </li>
                <li>
                    Go to dashboard <a href="https://nightbot.tv/dashboard">nightbot.tv/dashboard</a>
                </li>
                <li>
                    Click the "Join Channel" button
                </li>
            </ul>
            <img
                alt = {'Nightbot step 1'}
                src = {`${process.env.PUBLIC_URL}/images/nightbot-1.jpg`}
            />
        </p>
        <p>
            <ul>
                <li>
                    Make bot - moderator, just type /mod nightbot in your chat
                </li>
                <li>
                    Go to custom commands <a href="https://nightbot.tv/commands/custom">nightbot.tv/commands/custom</a>
                </li>
                <li>
                    Press the "Add command" button
                </li>
            </ul>
            <img
                alt = {'Nightbot step 2'}
                src = {`${process.env.PUBLIC_URL}/images/nightbot-2.jpg`}
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
                        $(urlfetch https://tarkov-tools.com/webhook/nightbot?q=$(querystring))
                    </pre>
                </li>
                <li>
                    Press "Submit"
                </li>
            </ul>
            <img
                alt = {'Nightbot step 3'}
                src = {`${process.env.PUBLIC_URL}/images/nightbot-3.jpg`}
            />
        </p>
        <p>
            Big thanks to <a href="https://www.twitch.tv/PhreakinPhil">PhreakinPhil</a> for feedback
        </p>
    </div>;
};

export default Nightbot;
