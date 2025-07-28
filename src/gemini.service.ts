import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoogleGenerativeAI, GenerativeModel, TaskType } from '@google/generative-ai'

@Injectable()
export class GeminiService implements OnModuleInit {
  private embeddingModel: GenerativeModel

  constructor (private configService: ConfigService) {}

  onModuleInit () {
    const apiKey = String(process.env.GEMINI_API_KEY)
    if (!apiKey) {
      throw new Error('Google API key is not configured')
    }

    // Instanciamos el cliente principal de Google
    const genAI = new GoogleGenerativeAI(apiKey)

    // Obtenemos el modelo específico para embeddings
    // 'embedding-001' es el modelo estándar y recomendado actualmente.
    this.embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' })
  }

  /**
   * Genera un embedding para un texto dado usando el modelo de Gemini.
   * @param text El texto a convertir en vector.
   * @returns Un array de números (vector).
   */
  async generateEmbedding (text: string): Promise<number[]> {
    try {
      const result = await this.embeddingModel.embedContent(
        {
          content: { parts: [{ text: text }], role: 'user' },
          taskType: TaskType.RETRIEVAL_QUERY
        }
      )
      const embedding = result.embedding

      // La respuesta de Gemini contiene el vector en la propiedad "values"
      return embedding.values
    } catch (error) {
      console.error('Error al generar el embedding con Gemini:', error)
      throw new Error('No se pudo generar el embedding con Gemini.')
    }
  }
}
