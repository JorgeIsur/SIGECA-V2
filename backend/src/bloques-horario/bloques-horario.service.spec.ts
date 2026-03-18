import { Test, TestingModule } from '@nestjs/testing';
import { BloquesHorarioService } from './bloques-horario.service';

describe('BloquesHorarioService', () => {
  let service: BloquesHorarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BloquesHorarioService],
    }).compile();

    service = module.get<BloquesHorarioService>(BloquesHorarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
