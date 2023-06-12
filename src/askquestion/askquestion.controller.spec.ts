import { Test, TestingModule } from '@nestjs/testing';
import { AskquestionController } from './askquestion.controller';
import { AskquestionService } from './askquestion.service';

describe('AskquestionController', () => {
  let controller: AskquestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AskquestionController],
      providers: [AskquestionService],
    }).compile();

    controller = module.get<AskquestionController>(AskquestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
