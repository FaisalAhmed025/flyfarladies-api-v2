import { Test, TestingModule } from '@nestjs/testing';
import { AskquestionService } from './askquestion.service';

describe('AskquestionService', () => {
  let service: AskquestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AskquestionService],
    }).compile();

    service = module.get<AskquestionService>(AskquestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
