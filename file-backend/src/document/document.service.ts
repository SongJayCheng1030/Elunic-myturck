import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDocumentLinkDto, DocumentActivityType } from 'shared/common/models';
import { AuthInfo } from 'shared/common/types';
import { Repository } from 'typeorm';

import { FileService } from '../file/file.service';
import { ActivityLogEntity } from './activity-log.entity';
import { DocumentEntity } from './document.entity';
import { DocumentLinkEntity } from './document-link.entity';
import { DocumentTypeService } from './document-type.service';
import { GetDocumentsQueryParams, PostDocumentDto, PutDocumentDto } from './dto/document';

@Injectable()
export class DocumentService {
  constructor(
    @InjectLogger(DocumentService.name) private readonly logger: LogService,
    @InjectRepository(DocumentEntity) private docRepo: Repository<DocumentEntity>,
    @InjectRepository(DocumentLinkEntity) private docLinkRepo: Repository<DocumentLinkEntity>,
    @InjectRepository(ActivityLogEntity) private readonly logRepo: Repository<ActivityLogEntity>,
    private docTypeService: DocumentTypeService,
    private fileService: FileService,
  ) {}

  async getAll(authInfo: AuthInfo, query: GetDocumentsQueryParams): Promise<DocumentEntity[]> {
    const allowedTypes = await this.docTypeService.getAllowed(authInfo);
    // This must be checked so the sql in query does not fail.
    if (!allowedTypes.length) {
      return [];
    }

    let qb = this.docRepo
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.type', 'type')
      .where('doc.tenant_id = :tenantId', { tenantId: authInfo.tenantId })
      .andWhere('doc.type_id IN (:typeIds)', { typeIds: allowedTypes.map(t => t.id) });

    const { name, typeId, withLinks, refIds } = query;

    if (name && name.length) {
      qb = qb
        .addSelect('`doc`.`name`->"$.de_DE"', 'doc_name_de')
        .addSelect('`doc`.`name`->"$.en_EN"', 'doc_name_en')
        .having('LOWER(doc_name_de) LIKE :name', { name: `%${name.toLowerCase()}%` })
        .orHaving('LOWER(doc_name_en) LIKE :name', { name: `%${name.toLowerCase()}%` });
    }
    if (typeId) {
      qb = qb.andWhere('doc.type_id = :typeId', { typeId });
    }
    if (refIds && refIds.length) {
      qb = qb.leftJoin('doc.links', 'link').andWhere('link.refId IN (:refIds)', { refIds });
    }
    if (withLinks) {
      qb = qb.leftJoinAndSelect('doc.links', 'links');
    }

    return qb.getMany();
  }

  async getOneById(authInfo: AuthInfo, id: string, withLinks = false): Promise<DocumentEntity> {
    const relations: Array<keyof DocumentEntity> = withLinks ? ['links'] : [];
    const document = await this.docRepo.findOne({
      where: { id, tenantId: authInfo.tenantId },
      relations,
    });
    if (!document) {
      throw new NotFoundException(`No such document found.`);
    }

    return document;
  }

  async create(authInfo: AuthInfo, dto: PostDocumentDto): Promise<DocumentEntity> {
    const { typeId, fileId, ...rest } = dto;
    const type = await this.docTypeService.getOneById(authInfo, typeId);

    const exists = await this.fileService.fileExists(fileId);
    if (!exists) {
      throw new NotFoundException('File');
    }

    const doc = await this.docRepo.save({
      ...rest,
      type,
      fileId,
      tenantId: authInfo.tenantId,
      createdBy: authInfo.id,
    });
    await this.logRepo.save({
      type: DocumentActivityType.CREATED,
      refId: doc.id,
      tenantId: authInfo.tenantId,
      createdBy: authInfo.id,
    });
    return doc;
  }

  async update(authInfo: AuthInfo, id: string, dto: PutDocumentDto): Promise<DocumentEntity> {
    const document = await this.getOneById(authInfo, id);
    const { typeId, fileId, ...rest } = dto;

    const type = typeId ? await this.docTypeService.getOneById(authInfo, typeId) : document.type;

    if (typeId && typeId !== document.type.id) {
      await this.logRepo.save({
        type: DocumentActivityType.TYPE_CHANGED,
        refId: id,
        tenantId: authInfo.tenantId,
        createdBy: authInfo.id,
      });
    }

    if (fileId) {
      const exists = await this.fileService.fileExists(fileId);
      if (!exists) {
        throw new NotFoundException('File');
      }

      if (fileId !== document.fileId) {
        await this.logRepo.save({
          type: DocumentActivityType.FILE_REPLACED,
          refId: id,
          tenantId: authInfo.tenantId,
          createdBy: authInfo.id,
        });
      }
    }

    await this.docRepo.save({
      ...rest,
      id,
      type,
      fileId: fileId || document.fileId,
      tenantId: authInfo.tenantId,
    });

    await this.logRepo.save({
      type: DocumentActivityType.UPDATED,
      refId: id,
      tenantId: authInfo.tenantId,
      createdBy: authInfo.id,
    });

    return this.getOneById(authInfo, id);
  }

  async delete(authInfo: AuthInfo, id: string): Promise<boolean> {
    await this.getOneById(authInfo, id);

    await this.docRepo.delete({ id, tenantId: authInfo.tenantId });

    await this.logRepo.save({
      type: DocumentActivityType.DELETED,
      refId: id,
      tenantId: authInfo.tenantId,
      createdBy: authInfo.id,
    });

    return true;
  }

  async getLinks(authInfo: AuthInfo, id: string): Promise<DocumentLinkEntity[]> {
    const document = await this.getOneById(authInfo, id);
    return this.docLinkRepo.find({ where: { document, tenantId: authInfo.tenantId } });
  }

  async assign(authInfo: AuthInfo, id: string, dto: CreateDocumentLinkDto): Promise<void> {
    const document = await this.getOneById(authInfo, id);

    await this.docLinkRepo.save({
      ...dto,
      document,
      tenantId: authInfo.tenantId,
      createdBy: authInfo.id,
    });

    await this.logRepo.save({
      type: DocumentActivityType.REF_ASSIGNED,
      refId: id,
      tenantId: authInfo.tenantId,
      createdBy: authInfo.id,
    });
  }

  async unassign(authInfo: AuthInfo, id: string, refId: string): Promise<void> {
    const document = await this.getOneById(authInfo, id);

    await this.docLinkRepo.delete({ tenantId: authInfo.tenantId, refId, document });

    await this.logRepo.save({
      type: DocumentActivityType.REF_UNASSIGNED,
      refId: id,
      tenantId: authInfo.tenantId,
      createdBy: authInfo.id,
    });
  }

  getActivities(authInfo: AuthInfo, id: string) {
    return this.logRepo.find({
      where: { refId: id, tenantId: authInfo.tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}
