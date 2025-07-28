import { Controller, Get, Param } from '@nestjs/common'
import { AppService } from './app.service'

@Controller('app')
export class AppController {
  constructor (private readonly appService: AppService) {}

  @Get('openai/:text')
  getOpenAI (@Param('text') query: string): Promise<number[]> {
    return this.appService.getEmbeddingOpenAI(query)
  }

  @Get('gemini/:text')
  getGemini (@Param('text') query: string): Promise<number[]> {
    return this.appService.getEmbeddingGemini(query)
  }

  @Get('create-embedding')
  createEmbedding (): Promise<any> {
    return this.appService.createEmbedding()
  }
}
