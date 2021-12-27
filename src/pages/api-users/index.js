import apiUsers from '../../data/api-users.json';
import './index.css';

function ApiUsers() {
    return <div
        className = {'page-wrapper api-users-page-wrapper'}
    >
        <h1>
            Tarkov Tools API Users
        </h1>
        <p>
            Want to be included on this page? Join the <a href="https://discord.gg/B2xM8WZyVv">Discord</a> and tell us about what you've made!
        </p>
        {
            apiUsers.map((apiUser, index) => {
                const projectKey = apiUser.title.toLowerCase().replace(/\s/g, '-');
                const firstContent = apiUser.text;
                const secondContent = (<img
                    alt = {apiUser.title}
                    src = {`${process.env.PUBLIC_URL}/images/api-users/${projectKey}.${apiUser.imageType || 'png'}`}
                />);
                return <div
                    className='api-user-wrapper'
                    key={`api-user-${projectKey}`}
                >
                    <h2>
                        <a
                            href={apiUser.link}
                        >
                            {apiUser.title}
                        </a>
                    </h2>
                    <div
                        className='api-user-data-wrapper'
                    >
                        {index % 2 === 0 ? firstContent : secondContent}
                    </div>
                    <div
                        className='api-user-data-wrapper'
                    >
                        {index % 2 === 0 ?  secondContent : firstContent}
                    </div>
                </div>

            })
        }
    </div>;
};

export default ApiUsers;
