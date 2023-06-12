import { Module } from '@nestjs/common';
import { AskquestionService } from './askquestion.service';
import { AskquestionController } from './askquestion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AskQuestion } from './Entity/askquestion.entity';



@Module({
  imports:[TypeOrmModule.forFeature([AskQuestion])],
  controllers: [AskquestionController],
  providers: [AskquestionService]
})
export class AskquestionModule {}
