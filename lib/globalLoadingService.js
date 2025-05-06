let count = 0; // how many fetches are in progress
let listeners = [];

export const globalLoadingService = {
    start() {
        count++;
        listeners.forEach((cb) => cb(count));
    },
    stop() {
        count = Math.max(0, count - 1);
        listeners.forEach((cb) => cb(count));
    },
    subscribe(cb) {
        listeners.push(cb);
        return () => {
            listeners = listeners.filter((fn) => fn !== cb);
        };
    },
    getCount() {
        return count;
    },
};
