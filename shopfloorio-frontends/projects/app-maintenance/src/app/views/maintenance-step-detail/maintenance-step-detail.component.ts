import { Component, Input, OnInit } from '@angular/core';
import { DeviceDataService, DocumentService, FileService } from '@sio/common';
import { ImageItem } from 'ng-gallery';
import { catchError, EMPTY, from, map, Observable, shareReplay, switchMap, timer } from 'rxjs';
import { DocumentDto, MaintenanceProcedureStepDto } from 'shared/common/models';

const REFRESH_INTERVAL = 30000;

@Component({
  selector: 'mnt-maintenance-step-detail',
  templateUrl: './maintenance-step-detail.component.html',
  styleUrls: ['./maintenance-step-detail.component.scss'],
})
export class MaintenanceStepDetailComponent implements OnInit {
  @Input()
  set step(step: MaintenanceProcedureStepDto) {
    this._step = step;
    this.onUpdateStep();
  }

  get step(): MaintenanceProcedureStepDto {
    return this._step;
  }

  @Input() assetId!: string;
  @Input() hideMachineData!: boolean;

  private _step!: MaintenanceProcedureStepDto;

  galleryImages!: ImageItem[];
  documents$!: Observable<DocumentDto[]>;
  errorLoadingMachineData = false;
  dataInRange$!: Observable<boolean>;
  deviceDataValue$!: Observable<string>;
  deviceDataTime$!: Observable<Date>;
  machineVariableName$!: Observable<string>;

  constructor(
    private docService: DocumentService,
    private fileService: FileService,
    private deviceDataService: DeviceDataService,
  ) {}

  ngOnInit(): void {
    if (this.step.machineVariableId) {
      const machineVariableData$ = timer(0, REFRESH_INTERVAL).pipe(
        switchMap(() =>
          this.deviceDataService.getMachineVariableAndCurrentValue(
            this.assetId,
            this._step.machineVariableId as string,
          ),
        ),
        catchError(() => {
          this.errorLoadingMachineData = true;
          return EMPTY;
        }),
        shareReplay(1),
      );

      this.dataInRange$ = machineVariableData$.pipe(map(({ value }) => this.isInRange(value)));
      this.deviceDataTime$ = machineVariableData$.pipe(map(({ time }) => new Date(time)));
      this.deviceDataValue$ = machineVariableData$.pipe(
        map(
          ({ machineVariable, value }) =>
            `${value}${machineVariable.unit ? ' ' + machineVariable.unit : ''}`,
        ),
      );
      this.machineVariableName$ = machineVariableData$.pipe(
        map(({ machineVariable }) => machineVariable.name),
      );
    }
  }

  onUpdateStep(): void {
    this.galleryImages =
      this.step.content.images?.map(
        img => new ImageItem({ src: this.fileService.getImgUrl(img) }),
      ) || [];
    this.documents$ = from(this.docService.getDocuments({ refIds: this.step.id }));
  }

  getRange(): string {
    const { rangeFrom, rangeTo } = this.step;
    if (rangeFrom !== undefined && rangeTo !== undefined) {
      return `>= ${rangeFrom}, <= ${rangeTo}`;
    }
    if (rangeFrom !== undefined) {
      return `>= ${rangeFrom}`;
    }
    if (rangeTo !== undefined) {
      return `<= ${rangeTo}`;
    }
    return '';
  }

  private isInRange(value: number): boolean {
    const { rangeFrom, rangeTo } = this.step;
    if (rangeFrom !== undefined && rangeTo !== undefined) {
      return value >= rangeFrom && value <= rangeTo;
    }
    if (rangeFrom !== undefined) {
      return value >= rangeFrom;
    }
    if (rangeTo !== undefined) {
      return value <= rangeTo;
    }
    return true;
  }
}
