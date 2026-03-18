import { Test, TestingModule } from '@nestjs/testing';
import { PeriodosEscolaresController } from './periodos-escolares.controller';

describe('PeriodosEscolaresController', () => {
  let controller: PeriodosEscolaresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodosEscolaresController],
    }).compile();

    controller = module.get<PeriodosEscolaresController>(PeriodosEscolaresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
