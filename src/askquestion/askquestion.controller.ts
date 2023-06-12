import { Controller, Post, Body, Param, Req, Res, HttpStatus, Get, HttpException, Delete } from '@nestjs/common';
import { AskquestionService } from './askquestion.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AskQuestion } from './Entity/askquestion.entity';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';

@Controller('question')
export class AskquestionController {
  constructor( @InjectRepository(AskQuestion) private askQuestionRepository: Repository<AskQuestion>,
     private readonly askquestionService: AskquestionService) {}

     @Post('add')
     async addQuestion(
     @Body() body,
     @Req() req: Request,
     @Res() res: Response){
      const {FullName,Email,Phone,TourType,Traveller,Date,Description}=req.body
      const question = new AskQuestion()
      question.FullName =FullName
      question.Date = Date
      question.Email =Email
      question.Phone =Phone
      question.TourType =TourType
      question.Traveller =Traveller
      question.Description =Description
      await this.askQuestionRepository.save({...question})
      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        message: 'Thanks for asking question',
      });
     }

     @Get('all')
     async allquestion(){
      const allquestion =await this.askQuestionRepository.find({})
      return allquestion
     }

     @Get(':id')
     async getquestion(@Param('id') id:string){
      const question =await this.askQuestionRepository.findOne({where:{id}})
      if(!question){
        throw new HttpException("no questions found", HttpStatus.BAD_REQUEST)
      }
      return question
     }

     @Delete(':id')
     async Deletequestion(@Param('id') id:string,@Res() res: Response){
      const question =await this.askQuestionRepository.findOne({where:{id}})
      if(!question){
        throw new HttpException("no questions found", HttpStatus.BAD_REQUEST)
      }
      await this.askQuestionRepository.delete(id)
      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        message: 'question has deleted',
      });
     }
     


}
