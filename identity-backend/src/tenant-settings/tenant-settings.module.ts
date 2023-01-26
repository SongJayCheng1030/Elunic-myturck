import { Client } from '@c8y/client';
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigService } from '../config/config.service';
import { TenantEntity } from '../tenant/tenant.entity';
import { C8yGroupService } from './c8y-group.service';
import { MockGroupService } from './mock-group.service';
import { TenantSettingsController } from './tenant-settings.controller';
import { TenantSettingsEntity } from './tenant-settings.entity';
import { TenantSettingsService } from './tenant-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([TenantSettingsEntity, TenantEntity])],
  controllers: [TenantSettingsController],
  providers: [
    TenantSettingsService,
    {
      provide: C8yGroupService,
      useFactory: async (config: ConfigService) => {
        const { user, password, baseUrl, disabled } = config.cumulocity;

        if (disabled) {
          return new MockGroupService();
        }

        const client = await Client.authenticate({ user, password }, baseUrl);
        return new C8yGroupService(client);
      },
      inject: [ConfigService],
    },
  ],
  exports: [TenantSettingsService],
})
export class TenantSettingsModule implements OnModuleInit {
  constructor(private readonly tenantSettingsService: TenantSettingsService) {}

  async onModuleInit() {
    await this.tenantSettingsService.init();
  }
}
