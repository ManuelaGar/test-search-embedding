import { Injectable, OnModuleInit } from '@nestjs/common'
import OpenAI from 'openai'

@Injectable()
export class OpenaiService implements OnModuleInit {
  private openai: OpenAI

  onModuleInit () {
    // Instanciamos el cliente de OpenAI aquí, usando la clave del .env
    const apiKey = String(process.env.OPENAI_API_KEY)
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured')
    }
    this.openai = new OpenAI({ apiKey })
  }

  /**
   * Genera un embedding para un texto dado usando text-embedding-3-small.
   * @param text El texto a convertir en vector.
   * @returns Un array de números (vector).
   */
  async generateEmbedding (text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
      })

      // La API devuelve un array de embeddings, tomamos el primero.
      return response.data[0].embedding
    } catch (error) {
      console.error('Error al generar el embedding:', error)
      // Aquí puedes manejar el error como prefieras
      throw new Error('No se pudo generar el embedding con OpenAI.')
    }
  }
}
