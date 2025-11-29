import { Body, Controller, Post, Logger } from '@nestjs/common';

@Controller('logs')
export class LogsController {
    private readonly logger = new Logger(LogsController.name);

    @Post()
    create(@Body() log: any) {
        const { level, message, ...meta } = log;
        // Map frontend log levels to backend logger methods
        switch (level) {
            case 'error':
                this.logger.error(message, meta);
                break;
            case 'warn':
                this.logger.warn(message, meta);
                break;
            case 'debug':
                this.logger.debug(message, meta);
                break;
            default:
                this.logger.log(message, meta);
        }
        return { success: true };
    }
}
