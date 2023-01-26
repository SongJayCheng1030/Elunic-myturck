import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StepType } from 'shared/common/models';

@Pipe({
  name: 'stepTypeName',
})
export class StepTypeNamePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(stepType: StepType): string {
    switch (stepType) {
      case StepType.CHECKBOX:
        return 'Checkbox with description';
      case StepType.NUMERIC_INPUT:
        return 'Numerical input';
      case StepType.TEXT_INPUT:
        return 'Free text input';
      default:
        return 'Description';
    }
  }
}
