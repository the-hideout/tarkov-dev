import { useCallback, useRef } from "react";

// Turnstile tokens can only be used once. getToken hands out each token a single time and resets the
// widget so it solves a new challenge in the background. If no unused token is ready yet, it waits for
// the next one instead of letting a request go out without a token. Aborting the signal passed to
// getToken stops waiting, so an abandoned request doesn't use up the next token.
function useTurnstileToken(timeout = 30000) {
    const turnstileRef = useRef();
    const usedTokenRef = useRef();
    const waitingRef = useRef([]);

    const takeToken = useCallback((token) => {
        usedTokenRef.current = token;
        turnstileRef.current?.reset();
        return token;
    }, []);

    // Pass to the Turnstile component's onSuccess
    const onSuccess = useCallback(
        (token) => {
            const waiting = waitingRef.current.shift();
            if (waiting) {
                waiting(takeToken(token));
            }
        },
        [takeToken],
    );

    const getToken = useCallback(
        (signal) => {
            if (signal?.aborted) {
                return Promise.reject(signal.reason);
            }
            const token = turnstileRef.current?.getResponse();
            if (token && token !== usedTokenRef.current && !turnstileRef.current.isExpired()) {
                return Promise.resolve(takeToken(token));
            }
            return new Promise((resolve, reject) => {
                const stopWaiting = (error) => {
                    clearTimeout(timer);
                    signal?.removeEventListener("abort", onAbort);
                    waitingRef.current = waitingRef.current.filter((w) => w !== waiting);
                    reject(error);
                };
                const onAbort = () => stopWaiting(signal.reason);
                const waiting = (newToken) => {
                    clearTimeout(timer);
                    signal?.removeEventListener("abort", onAbort);
                    resolve(newToken);
                };
                const timer = setTimeout(() => {
                    stopWaiting(
                        new Error("Timed out waiting for the Turnstile challenge. Reload the page and try again."),
                    );
                }, timeout);
                signal?.addEventListener("abort", onAbort);
                waitingRef.current.push(waiting);
            });
        },
        [takeToken, timeout],
    );

    return { turnstileRef, onSuccess, getToken };
}

export default useTurnstileToken;
