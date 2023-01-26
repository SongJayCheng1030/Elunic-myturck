import { HttpModule, Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { DemoDataService } from './demo-data.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [DemoDataService],
})
export class DemoDataModule {}
