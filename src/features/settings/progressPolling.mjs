const MIN_DELAY_MS = 5 * 60_000;
const MAX_DELAY_MS = 15 * 60_000;
const REQUEST_TIMEOUT_MS = 30_000;

export function startProgressPolling(refresh) {
    let stopped = false;
    let timer;
    let requestTimeout;
    let request;
    let lastEtag;
    let delay = MIN_DELAY_MS;
    let lastCompletedAt;
    let wasInactive = true;

    const isActive = () => document.visibilityState === "visible" && document.hasFocus();

    const synchronize = () => {
        clearTimeout(timer);
        if (!isActive()) {
            wasInactive = true;
            return;
        }

        // Returning from a long absence should refresh at the original cadence.
        if (wasInactive) delay = MIN_DELAY_MS;
        wasInactive = false;
        if (request) return;

        const remaining = lastCompletedAt === undefined ? 0 : lastCompletedAt + delay - Date.now();
        if (remaining > 0) {
            timer = setTimeout(synchronize, remaining);
            return;
        }

        request = refresh();
        requestTimeout = setTimeout(request.abort, REQUEST_TIMEOUT_MS);
        request.then(({ meta }) => {
            if (stopped) return;
            clearTimeout(requestTimeout);
            // The browser may serve the body from its HTTP cache after a wire 304.
            const etag = meta.etag;
            delay = etag && etag === lastEtag ? Math.min(delay * 2, MAX_DELAY_MS) : MIN_DELAY_MS;
            lastEtag = etag;
            lastCompletedAt = Date.now();
            request = undefined;
            synchronize();
        });
    };

    window.addEventListener("focus", synchronize);
    window.addEventListener("blur", synchronize);
    document.addEventListener("visibilitychange", synchronize);
    synchronize();

    return () => {
        stopped = true;
        clearTimeout(timer);
        clearTimeout(requestTimeout);
        window.removeEventListener("focus", synchronize);
        window.removeEventListener("blur", synchronize);
        document.removeEventListener("visibilitychange", synchronize);
        request?.abort();
    };
}
