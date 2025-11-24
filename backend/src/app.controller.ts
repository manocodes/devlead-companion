import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('hello')
  getHelloEndpoint(): string {
    return 'Hello World!';
  }

  @Get('backend')
  getBackendInfo(): object {
    return {
      framework: 'NestJS',
      port: process.env.PORT || 3000,
      nodeVersion: process.version,
    };
  }

  @Get('env-check')
  checkEnv(): object {
    return {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasGoogleCallbackUrl: !!process.env.GOOGLE_CALLBACK_URL,
      googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
      googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
    };
  }
}
