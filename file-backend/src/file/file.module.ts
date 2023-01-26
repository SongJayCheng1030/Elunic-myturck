import { LogService, RootLogger } from '@elunic/logger';
import { LOGGER } from '@elunic/logger-nestjs';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as fs from 'fs-extra';
import { ConfigModule } from 'src/config/config.module';

import { AbstractFileServiceAdapter } from '../adapter/AbstractFileServiceAdapter';
import { AzureAdapterService } from '../adapter/azure-adapter.service';
import { FsAdapterService } from '../adapter/fs-adapter.service';
import { ConfigService } from '../config/config.service';
import { ControllerUtilsService } from './controller-utils.service';
import { FetchFileController } from './fetch-file.controller';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { UploadFileController } from './upload-file.controller';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService, rootLogger: RootLogger) => {
        rootLogger
          .createLogger('multerConfig')
          .info(`Uploading into: ${configService.uploadTempPath}`);

        await fs.ensureDir(configService.uploadTempPath).catch(err => {
          throw new Error(
            `Failed to ensure existence of upload temp folder ${configService.uploadTempPath}: ${err.message}`,
          );
        });
        await fs.access(configService.uploadTempPath, fs.constants.W_OK).catch(err => {
          throw new Error(
            `Upload temp folder is not writable (${configService.uploadTempPath}): ${err.message}`,
          );
        });

        return {
          dest: configService.uploadTempPath,
          limits: {
            fileSize: configService.maxUploadFileSize,
          },
        };
      },
      inject: [ConfigService, LOGGER],
    }),
  ],
  controllers: [FileController, FetchFileController, UploadFileController],
  providers: [
    {
      provide: AbstractFileServiceAdapter,
      useFactory: (config: ConfigService, logger: RootLogger): AbstractFileServiceAdapter => {
        switch (config.storageAdapter) {
          case 'fs':
            logger.info(`Using filesystem as backend`);
            return new FsAdapterService(
              config,
              new LogService(logger.createLogger(FsAdapterService.name)),
            );

          case 'azblob':
            logger.info(`Using Azure file store backend`);
            return new AzureAdapterService(
              config,
              new LogService(logger.createLogger(AzureAdapterService.name)),
            );

          default:
            throw new Error(`Unknown FileServiceAdapterImplementation: "${config.storageAdapter}"`);
        }
      },
      inject: [ConfigService, LOGGER],
    },
    FileService,
    ControllerUtilsService,
  ],
  exports: [FileService],
})
export class FileModule {}
