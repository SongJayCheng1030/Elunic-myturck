import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class DemoSeedingController {
  @Get()
  triggerTenantSeeding(@Req() req: Request): string {
    return `Triggering demo seeding for tennant ID: ${req.auth.tenantId}`;
  }
}
