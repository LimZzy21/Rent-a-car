import { Controller, Get, Logger } from '@nestjs/common';

@Controller('test-logging')
export class TestLoggingController {
  private readonly logger = new Logger(TestLoggingController.name);

  @Get()
  testLogging() {
    this.logger.log('📋 Test logging endpoint called!');
    this.logger.warn('⚠️ This is a warning log');
    this.logger.error('❌ This is an error log');
    this.logger.debug('🐛 This is a debug log');
    this.logger.verbose('📢 This is a verbose log');
    
    return {
      message: 'Logging test completed! Check your console for log messages.',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('error')
  testError() {
    this.logger.log('💥 Testing error logging...');
    throw new Error('This is a test error for logging purposes');
  }
} 