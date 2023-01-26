import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';
import { omit, pick } from 'lodash';
import { CreateDocumentLinkDto, DocumentDto, DocumentLinkDto } from 'shared/common/models';
import { AuthInfo } from 'shared/common/types';
import { DataResponse, SharedApiService, SharedService } from 'shared/nestjs';
import { EntityManager, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import {
  CreateProcedureLibraryStepDto,
  UpdateProcedureLibraryStepDto,
} from './dto/procedure-library-step.dto';
import { ProcedureLibraryStepEntity } from './entities/maintenance-procedure-library-step.entity';
import { ProcedureStepEntity } from './entities/maintenance-procedure-step.entity';
import { StepTagEntity } from './entities/step-tag.entity';

const COPIED_LIB_STEP_PROPS: Array<keyof ProcedureLibraryStepEntity> = [
  'name',
  'description',
  'mandatory',
  'skippable',
  'machineVariableId',
  'rangeFrom',
  'rangeTo',
];

@Injectable()
export class ProcedureStepService extends TypeOrmCrudService<ProcedureLibraryStepEntity> {
  constructor(
    @InjectRepository(ProcedureLibraryStepEntity)
    repo: Repository<ProcedureLibraryStepEntity>,
    @InjectEntityManager()
    private entityManger: EntityManager,
    private sharedApiService: SharedApiService,
  ) {
    super(repo);
  }

  async createStep(
    authInfo: AuthInfo,
    dto: CreateProcedureLibraryStepDto,
  ): Promise<ProcedureLibraryStepEntity> {
    const { tags, ...rest } = dto;

    return this.entityManger.transaction(async manager => {
      const libStepRepo = manager.getRepository(ProcedureLibraryStepEntity);
      const tagRepo = manager.getRepository(StepTagEntity);

      const result = await libStepRepo.save({
        ...rest,
        content: omit(rest.content, 'documents'),
        tenantId: authInfo.tenantId,
      });

      if (tags) {
        const tagEntities = await tagRepo.save(
          tagRepo.create(tags.map(name => ({ name, tenantId: authInfo.tenantId }))),
        );
        await libStepRepo.save({ id: result.id, tags: tagEntities });
      }

      for (const docId of dto.content.documents) {
        await this.assignDoc(authInfo, docId, { refId: result.id, refType: 'maintenance_step' });
      }

      return libStepRepo.findOneOrFail(result.id, { relations: ['tags'] });
    });
  }

  async updateStep(
    authInfo: AuthInfo,
    id: string,
    dto: UpdateProcedureLibraryStepDto,
  ): Promise<ProcedureLibraryStepEntity> {
    const { tags, ...rest } = dto;

    return this.entityManger.transaction(async manager => {
      const libStepRepo = manager.getRepository(ProcedureLibraryStepEntity);
      const stepRepo = manager.getRepository(ProcedureStepEntity);
      const tagRepo = manager.getRepository(StepTagEntity);

      const current = await libStepRepo.findOneOrFail({ id, tenantId: authInfo.tenantId });

      if (tags) {
        const tagEntities = await tagRepo.save(
          tagRepo.create(tags.map(name => ({ name, tenantId: authInfo.tenantId }))),
        );
        await libStepRepo.save({ id: current.id, tags: tagEntities });
      }

      // Merge content and update the lib step. Keeping the type and key is crucial.
      const content = omit({ ...current.content, ...(dto.content || {}) }, 'documents');
      const copiedStep = {
        ...pick(rest, COPIED_LIB_STEP_PROPS),
        content,
        type: current.type,
        key: current.key,
      } as QueryDeepPartialEntity<ProcedureLibraryStepEntity>;
      await libStepRepo.update(id, copiedStep);

      // Get all steps that were ever derived from this lib step.
      const steps = await stepRepo.find({
        where: {
          tenantId: authInfo.tenantId,
          parent: { id: current.id },
        },
        relations: ['parent'],
      });

      if (steps.length) {
        // Patch them with the copied content.
        await stepRepo
          .createQueryBuilder('step')
          .relation('parent')
          .update()
          .set(copiedStep)
          .whereInIds(steps.map(s => s.id))
          .execute();
      }

      const documents = dto.content?.documents;
      if (documents) {
        // Currently linked documents.
        const docs = await this.getDocs(authInfo, [id]);

        const removedDocs = docs.filter(d => !documents.includes(d.id));
        const addedDocs = documents.filter(d => !docs.some(doc => doc.id === d));

        // Remove all unlinked documents from the library step and all copied steps.
        for (const doc of removedDocs) {
          await this.unassignDoc(authInfo, doc.id, current.id);
          for (const step of steps) {
            await this.unassignDoc(authInfo, doc.id, step.id);
          }
        }

        // Add all new documents to the library step and all copied steps.
        for (const docId of addedDocs) {
          await this.assignDoc(authInfo, docId, { refId: current.id, refType: 'maintenance_step' });
          for (const step of steps) {
            await this.assignDoc(authInfo, docId, { refId: step.id, refType: 'maintenance_step' });
          }
        }
      }

      return libStepRepo.findOneOrFail(id, { relations: ['tags'] });
    });
  }

  async deleteStep(authInfo: AuthInfo, id: string): Promise<void> {
    return this.entityManger.transaction(async manager => {
      const libStepRepo = manager.getRepository(ProcedureLibraryStepEntity);

      await libStepRepo.findOneOrFail({ id, tenantId: authInfo.tenantId });
      await libStepRepo.delete(id);

      const docs = await this.getDocs(authInfo, [id]);

      for (const doc of docs) {
        await this.unassignDoc(authInfo, doc.id, id);
      }
    });
  }

  private async getDocs(authInfo: AuthInfo, refIds: string[]) {
    const { data } = await this.sharedApiService.httpGetOrFail<DataResponse<DocumentDto[]>>(
      authInfo,
      SharedService.FILE_SERVICE,
      '/v1/documents',
      { refIds },
    );
    return data.data;
  }

  private async assignDoc(authInfo: AuthInfo, docId: string, dto: CreateDocumentLinkDto) {
    await this.sharedApiService.httpPostOrFail<DataResponse<DocumentLinkDto[]>>(
      authInfo,
      SharedService.FILE_SERVICE,
      `/v1/documents/${docId}/assign`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dto as any,
    );
  }

  private async unassignDoc(authInfo: AuthInfo, docId: string, refId: string) {
    await this.sharedApiService.httpDeleteOrFail<DataResponse<DocumentDto[]>>(
      authInfo,
      SharedService.FILE_SERVICE,
      `/v1/documents/${docId}/unassign/${refId}`,
    );
  }
}
