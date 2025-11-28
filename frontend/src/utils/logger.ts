const LOG_ENDPOINT = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/logs` : '/api/logs';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const log = (level: LogLevel, message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = { level, message, timestamp, ...meta };

    // Always log to console
    switch (level) {
        case 'error':
            console.error(message, meta);
            break;
        case 'warn':
            console.warn(message, meta);
            break;
        case 'debug':
            console.debug(message, meta);
            break;
        default:
            console.log(message, meta);
    }

    // Send errors to backend in production (or if configured)
    // For now, we'll send it if it's an error, regardless of env, to test it.
    // In a real app, you might check process.env.NODE_ENV === 'production'
    if (level === 'error') {
        sendToBackend(logEntry);
    }
};

const sendToBackend = async (logEntry: any) => {
    try {
        await fetch(LOG_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logEntry),
        });
    } catch (err) {
        // Prevent infinite loops if logging fails
        console.error('Failed to send log to backend', err);
    }
};

export const logger = {
    info: (message: string, meta?: any) => log('info', message, meta),
    warn: (message: string, meta?: any) => log('warn', message, meta),
    error: (message: string, meta?: any) => log('error', message, meta),
    debug: (message: string, meta?: any) => log('debug', message, meta),
};
