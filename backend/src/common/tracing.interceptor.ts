import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user; // From JWT auth guard

        if (user) {
            // Add user context to the current trace span
            // Note: trace-agent must be initialized in main.ts for this to work
            try {
                const trace = require('@google-cloud/trace-agent').get();
                const currentSpan = trace.getCurrentRootSpan();
                if (currentSpan) {
                    currentSpan.addLabel('user_id', user.id || user.sub);
                    currentSpan.addLabel('user_email', user.email);
                }
            } catch (error) {
                // Silently fail if trace agent is not available
                console.warn('Trace agent not available:', error.message);
            }
        }

        return next.handle();
    }
}
