import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FacadeEntity } from './facade.entity';
import { FacadesController } from './facades.controller';
import { FacadesService } from './facades.service';
import { TenantMigrationInitGfbsFacade003 } from './tenant-migrations/003-init-gfbs-facade';

@Global()
@Module({
  providers: [FacadesService, TenantMigrationInitGfbsFacade003],
  imports: [TypeOrmModule.forFeature([FacadeEntity])],
  controllers: [FacadesController],
  exports: [TenantMigrationInitGfbsFacade003],
})
export class FacadesModule {}
