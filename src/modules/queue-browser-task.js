// https://gist.github.com/surma/1fde30101820faf494cc89d5feb1a972

const task = (cb) => {
    const mc = new MessageChannel();
    mc.port1.postMessage(null);
    mc.port2.addEventListener(
        'message',
        () => {
            cb();
        },
        { once: true },
    );
    mc.port2.start();
};
const microtask = (cb) => queueMicrotask(cb);
// Only available in node
// const nanotask = cb => process.nextTick(cb);
const synchronous = (cb) => cb();

const queueBrowserTask = {
    task,
    microtask,
    synchronous,
};

export default queueBrowserTask;
