import { Test, TestingModule } from '@nestjs/testing';
import { PeriodosEscolaresService } from './periodos-escolares.service';

describe('PeriodosEscolaresService', () => {
  let service: PeriodosEscolaresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeriodosEscolaresService],
    }).compile();

    service = module.get<PeriodosEscolaresService>(PeriodosEscolaresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
