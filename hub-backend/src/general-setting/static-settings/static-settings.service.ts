import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

const ENV_VARNAME_PREFIX = 'APP_GLOBAL_CONFIG___';

@Injectable()
export class StaticSettingsService {
  async getByKey(key: string) {
    const envVar = this.getEnvVarName(key);

    // Really make sure, to only get valid and allowed env
    // key names
    if (!envVar || envVar.substring(0, 20) !== ENV_VARNAME_PREFIX) {
      throw new NotFoundException(`No such setting found`);
    }

    const val = process.env[envVar];
    if (!val) {
      throw new NotFoundException(`No such setting found`);
    }

    // Return the data
    return {
      [key]: val,
    };
  }

  // ---

  private getEnvVarName(str: string): string {
    if (!str || typeof str !== 'string') {
      throw new BadRequestException(`Input key is not a valid string!`);
    }

    const camel_to_snake =
      [
        str[0].toLowerCase(),
        str.slice(1, str.length).replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
      ].join('') || '';
    return `${ENV_VARNAME_PREFIX}${camel_to_snake.toUpperCase()}`;
  }
}
