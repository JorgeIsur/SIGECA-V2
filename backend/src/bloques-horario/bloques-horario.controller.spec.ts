import { Test, TestingModule } from '@nestjs/testing';
import { BloquesHorarioController } from './bloques-horario.controller';

describe('BloquesHorarioController', () => {
  let controller: BloquesHorarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BloquesHorarioController],
    }).compile();

    controller = module.get<BloquesHorarioController>(BloquesHorarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
