async function loadPolyfills() {
    if (typeof window.IntersectionObserver === 'undefined') {
        await import('intersection-observer');
    }
}

export default loadPolyfills;
