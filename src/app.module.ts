import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { OpenaiService } from './openai.service'
import { GeminiService } from './gemini.service'
import { Result, ResultSchema } from './schema/results.schema'
import { ResultCopy, ResultCopySchema } from './schema/resultsCopy.schema'

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION),
    MongooseModule.forFeature([
      { name: Result.name, schema: ResultSchema },
      { name: ResultCopy.name, schema: ResultCopySchema }
    ])
  ],
  controllers: [AppController],
  providers: [AppService, OpenaiService, GeminiService]
})
export class AppModule {}
