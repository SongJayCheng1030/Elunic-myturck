import { MultilangValue } from 'shared/common/models';

export interface QrCode {
  name?: MultilangValue;
  subTitle?: string;
  data: string;
}
