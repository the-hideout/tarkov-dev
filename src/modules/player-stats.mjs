const apiUrl = 'https://player.tarkov.dev';
//const apiUrl = 'http://localhost:8787';

const requestMethod = 'GET';

const playerStats = {
    useTurnstile: false,
    request: async (path, gameMode, body) => {
        try {
            const method = body ? 'POST' : 'GET';
            const response = await fetch(apiUrl + path, {
                method,
                body,
                headers: {
                    'game-mode': gameMode,
                }
            });

            if (response.status !== 200) {
                if (response.status === 429) {
                    return Promise.reject(new Error(`Rate limited exceeded. Wait a minute to send another request`));
                }
                if (response.status === 401) {
                    return Promise.reject(new Error('Turnstile authentication failed'));
                }
                let errorMessage = await response.text();
                try {
                    const json = JSON.parse(errorMessage);
                    errorMessage = json.errmsg;
                } catch { }
                return Promise.reject(new Error(errorMessage));
            }
            const json = await response.json();
            if (json.err) {
                return Promise.reject(new Error(json.errmsg));
            }
            return json;
        } catch (error) {
            console.log(error);
            if (error.message.includes('NetworkError')) {
                return Promise.reject(new Error('Rate limited exceeded. Wait one minute to send another request.'));
            }
            return Promise.reject(error);
        }
    },
    searchPlayers: async (searchString, gameMode = 'regular', turnstileToken) => {
        // Create a form request to send the Turnstile token
        // This avoids sending an extra pre-flight request
        let body;
        let searchParams = '';
        if (turnstileToken) {
            if (requestMethod === 'POST') {
                body = new FormData();
                body.append('Turnstile-Token', turnstileToken);
            } else {
                searchParams = `?token=${turnstileToken}`;
            }
        }
        return playerStats.request(`/name/${searchString}${searchParams}`, gameMode, body).catch(error => {
            if (error.message.includes('Malformed')) {
                return Promise.reject(new Error('Error searching player profile; try removing one character from the end until the search works.'));
            }
            return Promise.reject(error);
        });
    },
    getProfile: async (accountId, gameMode = 'regular', turnstileToken) => {
        let body;
        let searchParams = '';
        if (turnstileToken) {
            if (requestMethod === 'POST') {
                body = new FormData();
                body.append('Turnstile-Token', turnstileToken);
            } else {
                searchParams = `?token=${turnstileToken}`;
            }
        }
        return playerStats.request(`/account/${accountId}${searchParams}`, gameMode, body);
    },
};

export default playerStats;