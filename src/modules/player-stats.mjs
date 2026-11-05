const apiUrl = "https://player.tarkov.dev";
//const apiUrl = 'http://localhost:8787';

// POST keeps the Turnstile token out of the URL, where it could end up in request logs.
// A FormData body doesn't need a CORS pre-flight request.
const requestMethod = "POST";

// https://developers.cloudflare.com/turnstile/reference/client-side-errors#error-codes
export const getTurnstileErrorMessage = (errorCode) => {
    if (errorCode === "110200") {
        return `Turnstile error: ${window.location.hostname} is not a valid hostname`;
    }
    if (String(errorCode).startsWith("600")) {
        return "Turnstile challenge failed";
    }
    return `Turnstile error code ${errorCode}`;
};

const playerStats = {
    useTurnstile: false,
    request: async (path, body) => {
        try {
            const method = body ? "POST" : "GET";
            const response = await fetch(apiUrl + path, {
                method,
                body,
            });

            if (response.status !== 200) {
                if (response.status === 429) {
                    return Promise.reject(new Error(`Rate limited exceeded. Wait a minute to send another request`));
                }
                if (response.status === 401) {
                    return Promise.reject(new Error("Turnstile authentication failed"));
                }
                if (response.status >= 500) {
                    return Promise.reject(new Error("Upstream server error. Try again later."));
                }
                let errorMessage = await response.text();
                try {
                    const json = JSON.parse(errorMessage);
                    errorMessage = json.errmsg;
                } catch {
                    // continue regardless of error
                }
                return Promise.reject(new Error(errorMessage));
            }
            const json = await response.json();
            if (json.err) {
                return Promise.reject(new Error(json.errmsg));
            }
            return json;
        } catch (error) {
            // fetch rejects with a TypeError when no response arrives (offline, blocked, or a rate-limit
            // response without CORS headers); the message differs by browser
            if (error instanceof TypeError) {
                return Promise.reject(
                    new Error(
                        "Could not reach the player server. Check your connection or wait a minute and try again.",
                    ),
                );
            }
            return Promise.reject(error);
        }
    },
    // Adds the game mode and Turnstile token to a request, encoding the values that end up in the URL
    buildRequest: (path, gameMode, turnstileToken) => {
        let body;
        const searchParams = new URLSearchParams({ gameMode });
        if (turnstileToken) {
            if (requestMethod === "POST") {
                body = new FormData();
                body.append("Turnstile-Token", turnstileToken);
            } else {
                searchParams.set("token", turnstileToken);
            }
        }
        return [`${path}?${searchParams}`, body];
    },
    searchPlayers: async (searchString, gameMode = "regular", turnstileToken) => {
        const [path, body] = playerStats.buildRequest(
            `/name/${encodeURIComponent(searchString)}`,
            gameMode,
            turnstileToken,
        );
        return playerStats.request(path, body).catch((error) => {
            if (error.message.includes("Malformed")) {
                return Promise.reject(
                    new Error(
                        "Error searching player profile; try removing one character from the end until the search works.",
                    ),
                );
            }
            return Promise.reject(error);
        });
    },
    getProfile: async (accountId, gameMode = "regular", turnstileToken) => {
        const [path, body] = playerStats.buildRequest(
            `/account/${encodeURIComponent(accountId)}`,
            gameMode,
            turnstileToken,
        );
        return playerStats.request(path, body);
    },
};

export default playerStats;
