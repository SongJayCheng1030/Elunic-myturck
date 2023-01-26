import { LogService } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';
import { omit, partition, pick } from 'lodash';
import {
  CreateDocumentLinkDto,
  DocumentDto,
  DocumentLinkDto,
  MaintenanceProcedureDto,
  SIMPLE_EDIT_PROCEDURE_PROPS,
} from 'shared/common/models';
import { AuthInfo } from 'shared/common/types';
import { DataResponse, SharedApiService, SharedService } from 'shared/nestjs';
import { SharedAssetService } from 'shared/nestjs/services/shared-asset.service';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { AssetAssignmentEntity } from '../asset-assignment/entities/asset-assignment.entity';
import { ExecutionEntity } from '../maintenance-execution/entities/maintenance-execution.entity';
import { CreateProcedureStepDto } from '../procedure-step/dto/procedure-step.dto';
import { ProcedureLibraryStepEntity } from '../procedure-step/entities/maintenance-procedure-library-step.entity';
import { ProcedureStepEntity } from '../procedure-step/entities/maintenance-procedure-step.entity';
import { StepTagEntity } from '../procedure-step/entities/step-tag.entity';
import { CreateProcedureDto, UpdateProcedureDto } from './dto/procedure.dto';
import { ProcedureEntity } from './entities/maintenance-procedure.entity';

type WithRequiredProp<Type, Key extends keyof Type> = Omit<Type, Key> & Required<Pick<Type, Key>>;

const COPIED_STEP_PROPS: Array<keyof ProcedureStepEntity> = [
  'name',
  'description',
  'mandatory',
  'skippable',
  'type',
  'key',
  'content',
  'machineVariableId',
  'rangeFrom',
  'rangeTo',
];
const COPIED_PROCEDURE_PROPS: Array<keyof ProcedureEntity> = [
  'name',
  'description',
  'interval',
  'intervalUnit',
  'steps',
];
const COPIED_ASSIGNMENT_PROPS: Array<keyof AssetAssignmentEntity> = ['active', 'assetId'];

@Injectable()
export class ProcedureService extends TypeOrmCrudService<ProcedureEntity> {
  constructor(
    @InjectRepository(ProcedureEntity)
    repo: Repository<ProcedureEntity>,
    @InjectRepository(ProcedureLibraryStepEntity)
    private libStepRepo: Repository<ProcedureLibraryStepEntity>,
    @InjectEntityManager() private entityManager: EntityManager,
    private assetService: SharedAssetService,
    private sharedApiService: SharedApiService,
    @InjectLogger(ProcedureService.name) private readonly logger: LogService,
  ) {
    super(repo);
  }

  async getProcedure(authInfo: AuthInfo, id: string): Promise<ProcedureEntity> {
    const { current, root } = await this.getCurrent(authInfo, id);
    return current || root;
  }

  async createProcedure(
    authInfo: AuthInfo,
    dto: CreateProcedureDto,
    manager?: EntityManager,
  ): Promise<ProcedureEntity> {
    const { steps, ...rest } = dto;

    // ensure the asset type exists.
    const assetType = await this.assetService.getTypeById(authInfo, rest.assetTypeId);

    // There are three types of steps:
    // - New individual steps only for this procedure
    // - New library steps that should be added in the process
    // - Library steps that are already available

    // First we filter the ids of existing library steps.
    /* eslint-disable prefer-const */
    let [stepIds, newSteps] = partition(steps, s => typeof s === 'string') as [
      string[],
      CreateProcedureStepDto[],
    ];
    const libSteps = await this.libStepRepo.find({
      where: { tenantId: authInfo.tenantId, id: In(stepIds) },
    });
    // Fail early if a step is not available in the library.
    const missingStepId = stepIds.find(s => !libSteps.some(l => l.id === s));
    if (missingStepId) {
      throw new NotFoundException(`Library step ${missingStepId} not found`);
    }

    // Remove documents from the content object because they are stored inversely in the document management.
    newSteps = newSteps.map(s => ({
      ...s,
      content: omit(s.content, 'documents'),
    })) as CreateProcedureStepDto[];

    // Now we split the steps to create, some might be added to the library, the rest are
    // individual steps only for this procedure.
    const [newLibSteps, newIndividualSteps] = partition(newSteps, s => !!s.libraryOptions) as [
      Array<WithRequiredProp<CreateProcedureStepDto, 'libraryOptions'>>,
      CreateProcedureStepDto[],
    ];

    this.logger.debug(
      `Adding ${steps.length} procedure steps: Individual steps ${newIndividualSteps.length} | New lib steps ${newLibSteps.length} | Copied lib steps ${libSteps.length}`,
    );

    const func = async (m: EntityManager) => {
      const procedureRepo = m.getRepository(ProcedureEntity);
      const stepRepo = m.getRepository(ProcedureStepEntity);
      const libStepRepo = m.getRepository(ProcedureLibraryStepEntity);

      // Ensure no other active procedure has the same name.
      await procedureRepo
        .findOne({ tenantId: authInfo.tenantId, name: dto.name, outdatedSince: IsNull() })
        .then(p => {
          if (p) {
            throw new ConflictException('Procedure with same name already exists');
          }
        });

      // Create new steps unique to this procedure.
      const procedure = await procedureRepo.save({
        ...rest,
        assetTypeId: assetType.id,
        tenantId: authInfo.tenantId,
      });

      const addedLibSteps = await libStepRepo.save(
        newLibSteps.map(s => ({
          ...s,
          tags:
            s.libraryOptions.tags?.map<Partial<StepTagEntity>>(t => ({
              name: t,
              tenantId: authInfo.tenantId,
            })) || [],
          tenantId: authInfo.tenantId,
        })),
      );

      // Use original steps from the request to keep position.
      const finalSteps = steps.map<
        CreateProcedureStepDto & { parent?: ProcedureLibraryStepEntity }
      >(s => {
        if (typeof s === 'string') {
          // Must be included here because we checked before.
          // Copy over library steps.
          const libStep = libSteps.find(l => l.id === s) as ProcedureLibraryStepEntity;
          return {
            ...(pick(libStep, COPIED_STEP_PROPS) as CreateProcedureStepDto),
            parent: libStep,
          };
        }
        if (s.libraryOptions) {
          const libStep = addedLibSteps.shift() as ProcedureLibraryStepEntity;
          return {
            ...(pick(libStep, COPIED_STEP_PROPS) as CreateProcedureStepDto),
            parent: libStep,
          };
        }
        return newIndividualSteps.shift() as CreateProcedureStepDto;
      });

      // Finally store all steps.
      await stepRepo.save(
        finalSteps.map((s, position) => ({
          ...s,
          position,
          procedure,
          tenantId: authInfo.tenantId,
        })),
      );

      return procedureRepo.findOneOrFail(procedure.id, {
        relations: ['steps', 'steps.parent', 'root'],
      });
    };

    const result = await (manager ? func(manager) : this.entityManager.transaction(m => func(m)));

    await this.createDocLinks(authInfo, result.steps, steps);

    return result;
  }

  async updateProcedure(
    authInfo: AuthInfo,
    id: string,
    dto: UpdateProcedureDto,
  ): Promise<ProcedureEntity> {
    const isComplexUpdate = Object.keys(dto).some(
      key => !SIMPLE_EDIT_PROCEDURE_PROPS.includes(key as keyof MaintenanceProcedureDto),
    );
    return this.entityManager.transaction(async manager => {
      const procedureRepo = manager.getRepository(ProcedureEntity);
      const { current, root } = await this.getCurrent(authInfo, id, manager);
      const entity = current || root;

      if (!isComplexUpdate) {
        // For simple changes that have no effect on the execution we simply update the current version.
        await procedureRepo.update(
          entity.id,
          pick(dto, SIMPLE_EDIT_PROCEDURE_PROPS) as QueryDeepPartialEntity<ProcedureEntity>,
        );
        return procedureRepo.findOneOrFail(entity.id, {
          relations: ['steps', 'steps.parent', 'root'],
        });
      }

      const executionRepo = manager.getRepository(ExecutionEntity);
      const assignmentRepo = manager.getRepository(AssetAssignmentEntity);

      // Outdate the current procedure before creating a new to pass name collision check.
      await procedureRepo.update(entity.id, { outdatedSince: new Date() });
      // Create a new procedure from the dto. Keep some immutable properties from the original procedure.
      const procedure = await this.createProcedure(
        authInfo,
        { ...pick(entity, COPIED_PROCEDURE_PROPS), ...dto, assetTypeId: root.assetTypeId },
        manager,
      );

      // Copy over the assignments of the previous procedure.
      const assignments = await assignmentRepo.find({
        tenantId: authInfo.tenantId,
        procedure: entity,
      });
      const newAssignments = await assignmentRepo.save(
        assignments.map(a => ({
          ...pick(a, COPIED_ASSIGNMENT_PROPS),
          tenantId: authInfo.tenantId,
          procedure,
        })),
      );

      const executions = await executionRepo.find({
        where: {
          tenantId: authInfo.tenantId,
          assignment: { id: In(assignments.map(a => a.id)) },
          completedAt: IsNull(),
        },
        relations: ['assignment'],
      });

      // Copy over executions for each active assignment.
      for (const execution of executions) {
        // The order of assignments and newAssignments matches so we can get the index here.
        const index = assignments.findIndex(a => a.id === execution.assignment.id);
        const assignment = newAssignments[index];
        if (assignment?.active) {
          // Make sure to keep the execution date of the old execution until the next schedule.
          await executionRepo.save({
            tenantId: authInfo.tenantId,
            assignment,
            dueDate: execution.dueDate,
          });
        }
      }

      if (executions.length) {
        // Remove all ongoing executions.
        await executionRepo.delete(executions.map(e => e.id));
      }

      // Finally set the root id of the new procedure.
      await procedureRepo.update(procedure.id, { root: { id } });
      return procedureRepo.findOneOrFail(procedure.id, {
        relations: ['steps', 'steps.parent', 'root'],
      });
    });
  }

  async deleteProcedure(authInfo: AuthInfo, id: string) {
    await this.entityManager.transaction(async manager => {
      const repo = manager.getRepository(ProcedureEntity);

      const { root } = await this.getCurrent(authInfo, id, manager);
      const derivatives = await repo.find({ tenantId: authInfo.tenantId, root });

      const { steps } = await repo.findOneOrFail(
        { tenantId: authInfo.tenantId, id: root.id },
        { relations: ['steps'] },
      );

      await this.removeDocLinks(authInfo, steps);

      // Delete root procedure and all derived.
      await repo.delete([root.id, ...derivatives.map(d => d.id)]);
    });
  }

  private async createDocLinks(
    authInfo: AuthInfo,
    stepEntities: ProcedureStepEntity[],
    steps: Array<CreateProcedureStepDto | string>,
  ) {
    // Create document links for the new steps.
    const docLinks = stepEntities.reduce((prev, curr, i) => {
      const step = steps[i];
      if (step && typeof step !== 'string') {
        const added = [] as Array<CreateDocumentLinkDto & { docId: string }>;
        const parentId = curr.parentId;
        if (parentId) {
          // Double reference for library step.
          added.push(
            ...step.content.documents.map(d => ({
              docId: d,
              refId: parentId,
              refType: 'maintenance_step',
            })),
          );
        } else {
          added.push(
            ...step.content.documents.map(d => ({
              docId: d,
              refId: curr.id,
              refType: 'maintenance_step',
            })),
          );
        }

        return [...prev, ...added];
      }
      return prev;
    }, [] as Array<CreateDocumentLinkDto & { docId: string }>);
    for (const { docId, ...dto } of docLinks) {
      await this.assignDoc(authInfo, docId, dto);
    }

    // Find all documents of library steps and create a link to the copied step.
    const libSteps = new Map<string, { refId: string; docs: DocumentDto[] }>();
    stepEntities.forEach(s => {
      if (s.parentId) {
        libSteps.set(s.parentId, { refId: s.id, docs: [] });
      }
    });

    const docs = await this.getDocs(authInfo, [...libSteps.keys()]);

    [...libSteps.entries()].forEach(
      ([id, value]) => (value.docs = docs.filter(d => d.links?.some(l => l.refId === id))),
    );

    for (const value of libSteps.values()) {
      const dto: CreateDocumentLinkDto = { refId: value.refId, refType: 'maintenance_step' };
      for (const doc of value.docs) {
        await this.assignDoc(authInfo, doc.id, dto);
      }
    }
  }

  private async removeDocLinks(authInfo: AuthInfo, steps: ProcedureStepEntity[]) {
    const refIds = steps.map(s => s.id);
    const docs = await this.getDocs(authInfo, refIds);

    for (const doc of docs) {
      const links = doc.links?.filter(l => refIds.includes(l.refId)) || [];
      for (const link of links) {
        await this.sharedApiService
          .httpDeleteOrFail<DataResponse<DocumentDto[]>>(
            authInfo,
            SharedService.FILE_SERVICE,
            `/v1/documents/${doc.id}/unassign/${link.refId}`,
          )
          /* eslint-disable @typescript-eslint/no-empty-function */
          .catch(() => {});
      }
    }
  }

  private async getCurrent(authInfo: AuthInfo, id: string, manager?: EntityManager) {
    const func = async (m: EntityManager) => {
      const repo = m.getRepository(ProcedureEntity);
      const [root, current] = await Promise.all([
        repo.findOneOrFail({
          where: { id, tenantId: authInfo.tenantId, root: IsNull() },
          relations: ['steps', 'steps.parent', 'root'],
        }),
        repo.findOne({
          where: {
            tenantId: authInfo.tenantId,
            root: { id },
            outdatedSince: IsNull(),
          },
          relations: ['steps', 'steps.parent', 'root'],
        }),
      ]);

      return { root, current };
    };

    return manager ? func(manager) : this.entityManager.transaction(m => func(m));
  }

  private async assignDoc(authInfo: AuthInfo, docId: string, dto: CreateDocumentLinkDto) {
    await this.sharedApiService.httpPostOrFail<DataResponse<DocumentLinkDto[]>>(
      authInfo,
      SharedService.FILE_SERVICE,
      `/v1/documents/${docId}/assign`,
      /* eslint-disable @typescript-eslint/no-explicit-any */
      dto as any,
    );
  }

  private async getDocs(authInfo: AuthInfo, refIds: string[]) {
    const { data } = await this.sharedApiService.httpGetOrFail<DataResponse<DocumentDto[]>>(
      authInfo,
      SharedService.FILE_SERVICE,
      '/v1/documents',
      { refIds, withLinks: true },
    );
    return data.data;
  }
}
