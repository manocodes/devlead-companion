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
}
