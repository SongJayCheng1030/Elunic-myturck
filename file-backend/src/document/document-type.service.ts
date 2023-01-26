import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentActivityType } from 'shared/common/models';
import { AuthInfo } from 'shared/common/types';
import { QueryFailedError, Repository } from 'typeorm';

import { ActivityLogEntity } from './activity-log.entity';
import { DocumentTypeEntity } from './document-type.entity';
import { PostDocumentTypeDto, PutDocumentTypeDto } from './dto/document-type';

@Injectable()
export class DocumentTypeService {
  constructor(
    @InjectRepository(DocumentTypeEntity)
    private readonly docTypeRepo: Repository<DocumentTypeEntity>,
    @InjectRepository(ActivityLogEntity)
    private readonly logRepo: Repository<ActivityLogEntity>,
  ) {}

  async getAllowed(authInfo: AuthInfo, name?: string): Promise<DocumentTypeEntity[]> {
    let qb = this.docTypeRepo
      .createQueryBuilder('type')
      .where('type.tenant_id = :tenantId', { tenantId: authInfo.tenantId });

    if (name && name.length) {
      qb = qb
        .addSelect('`type`.`name`->"$.de_DE"', 'type_name_de')
        .andHaving('LOWER(type_name_de) LIKE :name', { name: `%${name.toLowerCase()}%` });
    }

    return qb.getMany();
  }

  async getOneById(authInfo: AuthInfo, id: string): Promise<DocumentTypeEntity> {
    const document = await this.docTypeRepo.findOne({ where: { id, tenantId: authInfo.tenantId } });
    if (!document) {
      throw new NotFoundException(`No such document type found.`);
    }
    return document;
  }

  async create(authInfo: AuthInfo, dto: PostDocumentTypeDto): Promise<DocumentTypeEntity> {
    const type = await this.docTypeRepo.save({
      ...dto,
      tenantId: authInfo.tenantId,
      createdBy: authInfo.id,
      // Can only be created during seeding.
      resourceId: null,
    });
    await this.logRepo.save({
      type: DocumentActivityType.CREATED,
      refId: type.id,
      tenantId: authInfo.tenantId,
      createdBy: authInfo.id,
    });

    return type;
  }

  async update(
    authInfo: AuthInfo,
    id: string,
    dto: PutDocumentTypeDto,
  ): Promise<DocumentTypeEntity> {
    await this.getOneById(authInfo, id);
    const type = await this.docTypeRepo.save({
      ...dto,
      id,
      tenantId: authInfo.tenantId,
    });
    await this.logRepo.save({
      type: DocumentActivityType.UPDATED,
      refId: id,
      tenantId: authInfo.tenantId,
      createdBy: authInfo.id,
    });
    return type;
  }

  async delete(authInfo: AuthInfo, id: string): Promise<boolean> {
    await this.getOneById(authInfo, id);

    try {
      await this.docTypeRepo.delete({ id, tenantId: authInfo.tenantId });
    } catch (e) {
      if (e instanceof QueryFailedError && e.message.includes('ER_ROW_IS_REFERENCED')) {
        throw new ConflictException(
          'Cannot delete document type while documents of this type exist',
        );
      }
      throw e;
    }

    await this.logRepo.save({
      type: DocumentActivityType.DELETED,
      refId: id,
      tenantId: authInfo.tenantId,
      createdBy: authInfo.id,
    });

    return true;
  }

  getActivities(authInfo: AuthInfo, id: string) {
    return this.logRepo.find({
      where: { refId: id, tenantId: authInfo.tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}
