import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileModule } from '../file/file.module';
import { ActivityLogEntity } from './activity-log.entity';
import { DocumentController } from './document.controller';
import { DocumentEntity } from './document.entity';
import { DocumentService } from './document.service';
import { DocumentLinkEntity } from './document-link.entity';
import { DocumentTypeController } from './document-type.controller';
import { DocumentTypeEntity } from './document-type.entity';
import { DocumentTypeService } from './document-type.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentEntity,
      DocumentLinkEntity,
      DocumentTypeEntity,
      ActivityLogEntity,
    ]),
    FileModule,
  ],
  controllers: [DocumentController, DocumentTypeController],
  providers: [DocumentService, DocumentTypeService],
  exports: [DocumentService, DocumentTypeService],
})
export class DocumentModule {}
