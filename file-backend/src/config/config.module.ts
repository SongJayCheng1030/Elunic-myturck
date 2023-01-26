import { Global, Module } from '@nestjs/common';

import { ConfigService } from './config.service';

@Global()
@Module({
  providers: [ConfigService],
  controllers: [],
  exports: [ConfigService],
})
export class ConfigModule {
  // static withOverride(configOverride: PartialDeep<ConfigService>): DynamicModule {
  //   return {
  //     module: ConfigModule,
  //     providers: [
  //       {
  //         provide: ConfigService,
  //         useFactory(): ConfigService {
  //           const config = new ConfigService();
  //           return config
  //         }
  //       }
  //     ]
  //   }
  // }
}
