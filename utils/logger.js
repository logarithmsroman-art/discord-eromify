module.exports = {
    log: (message, type = 'info') => {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
        console.log(`${prefix} ${message}`);
    },
    error: (message, err) => {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] ${message}`, err || '');
    }
};
