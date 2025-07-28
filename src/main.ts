import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap () {
  const port = process.env.PORT || 5002
  const host = process.env.HOST || '0.0.0.0'

  const app = await NestFactory.create(AppModule)

  try {
    await app.listen(port, host, () => {
      console.log(`Server running on ${port}`)
    })
  } catch (e) {
    console.error('Error status: ', e.status)
    console.error('Error message: ', e.message)
    process.exit(1)
  }
}
bootstrap()
