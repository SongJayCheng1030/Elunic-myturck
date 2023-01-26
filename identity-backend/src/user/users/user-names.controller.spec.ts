import { Test, TestingModule } from '@nestjs/testing';

import { UserNamesController } from './user-names.controller';

describe('UserNamesController', () => {
  let controller: UserNamesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserNamesController],
    }).compile();

    controller = module.get<UserNamesController>(UserNamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
