import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { pipeline } from '@xenova/transformers'

import { OpenaiService } from './openai.service'
import { GeminiService } from './gemini.service'
import { Result, ResultDocument } from './schema/results.schema'
import { ResultCopy, ResultCopyDocument } from './schema/resultsCopy.schema'

@Injectable()
export class AppService {
  private counterTokens = 0
  private modelName = 'Xenova/multilingual-e5-large'

  constructor (
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(ResultCopy.name) private resultCopyModel: Model<ResultCopyDocument>,
    private geminiService: GeminiService,
    private openaiService: OpenaiService
  ) {}

  async generateEmbeddingByApi (text: string): Promise<number[]> {
    const url = 'https://api.voyageai.com/v1/embeddings'
    const payload = {
      'input': text,
      'model': 'voyage-3-large',
      'input_type': 'document',
      'output_dimension': 2048
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer pa-CmXVcyO6H3e-jM_zHNuRPza1aS0HxPeifL9W7uriZTt`
      },
      body: JSON.stringify(payload)
    })
    const data = await response.json()
    this.counterTokens += data.usage?.total_tokens || 0
    return data.data[0].embedding
  }

  async generateEmbeddingOpenAI (text: string): Promise<number[]> {
    // uso con E5
    // const textToEmbed = `query: ${text}`
    // const generator = await pipeline('feature-extraction', this.modelName)
    // const output = await generator(textToEmbed, { pooling: 'mean', normalize: true })
    // return Array.from(output.data)
    const queryVector = await this.openaiService.generateEmbedding(text)
    return queryVector
  }

  async generateEmbeddingGemini (text: string): Promise<number[]> {
    const queryVector = await this.geminiService.generateEmbedding(text)
    return queryVector
  }

  async getEmbeddingOpenAI (text: string): Promise<number[]> {
    console.log('OpenAI', text)
    const embedding = await this.generateEmbeddingOpenAI(text)
    // return embedding
    const media = await this.getSimilarMediaOpenAI(embedding)
    return media
  }

  async getEmbeddingGemini (text: string): Promise<number[]> {
    console.log('Gemini', text)
    const embedding = await this.generateEmbeddingGemini(text)
    // return embedding
    const media = await this.getSimilarMediaGemini(embedding)
    return media
  }

  async createEmbedding (): Promise<any> {
    const media: Result[] = await this.findMedia()
    console.log('media encontrada', media.length)
    // if (media.length === 0) {
    //   console.log('No hay peliculas o series nuevas para procesar.')
    //   return
    // }
    // return media
    for (const item of media) {
      console.log('procesando', item.name)
      const embedding = await this.generateEmbeddingOpenAI(item.name)
      await this.updateMediaEmbedding(item._id.toString(), embedding)
    }
  }

  async findMedia (): Promise<Result[]> {
    try {
      // const media = await this.resultModel.aggregate([
      //   { $match: { embedding: { $exists: false } } },
      //   { $sample: { size: 2000 } }
      // ])
      const media = await this.resultModel.find({ embedding: { $exists: true } })
      return media
    } catch (error) {
      console.error('Error al buscar los medicamentos:', error)
      return []
    }
  }

  async updateMediaEmbedding (_id: string, embedding: number[]): Promise<Result> {
    try {
      const media = await this.resultModel.findByIdAndUpdate(_id, { embedding }, { new: true })
      return media
    } catch (error) {
      console.error('Error al actualizar el embedding del medicamento:', error)
      return null
    }
  }

  async getSimilarMediaOpenAI (embedding: number[]): Promise<any[]> {
    try {
      // Busqueda con vector search
      const pipeline = [
        {
          $vectorSearch: {
            index: 'vector_search_index',
            path: 'embedding',
            queryVector: embedding,
            numCandidates: 100,
            limit: 10
          }
        },
        {
          $project: {
            _id: 0,
            lab: 1,
            price: 1,
            name: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ]
      // const pipeline = [
      //   // Etapa 1: BÚSQUEDA DE TEXTO con Fuzzy para typos y nombres exactos
      //   {
      //     $search: {
      //       index: 'findMedicine',
      //       autocomplete: {
      //         query: text,
      //         path: 'name',
      //         fuzzy: {
      //           maxEdits: 1,
      //           prefixLength: 3,
      //           maxExpansions: 256
      //         },
      //         tokenOrder: 'sequential'
      //       }
      //     }
      //   },
      //   // Proyectamos un puntaje base y un tipo para identificar estos resultados
      //   {
      //     $project: {
      //       score: { $meta: 'searchScore' },
      //       type: 'textMatch',
      //       document: '$$ROOT'
      //     }
      //   },
      //   // Etapa 2: FUSIONAR con los resultados de la BÚSQUEDA VECTORIAL
      //   {
      //     $unionWith: {
      //       coll: 'results', // La misma colección
      //       pipeline: [
      //         {
      //           $vectorSearch: {
      //             index: 'vector_search_index',
      //             path: 'embedding',
      //             queryVector: embedding,
      //             numCandidates: 100,
      //             limit: 10
      //           }
      //         },
      //         // Proyectamos un puntaje base y un tipo para identificar estos resultados
      //         {
      //           $project: {
      //             score: { $meta: 'vectorSearchScore' },
      //             type: 'vectorMatch',
      //             document: '$$ROOT'
      //           }
      //         }
      //       ]
      //     }
      //   },
      //   // Etapa 3: AGRUPAR resultados para de-duplicar y combinar puntajes
      //   {
      //     $group: {
      //       _id: '$document._id', // Agrupamos por el ID único del documento
      //       // Sumamos los puntajes si un documento aparece en ambas búsquedas
      //       combinedScore: { $sum: '$score' },
      //       // Nos quedamos con el documento original
      //       document: { $first: '$document' }
      //     }
      //   },
      //   // Etapa 4: ORDENAR por el nuevo puntaje combinado
      //   {
      //     $sort: { combinedScore: -1 }
      //   },
      //   // Etapa 5: LIMITAR al número final de resultados
      //   {
      //     $limit: 100
      //   },
      //   // Etapa 6: Devolver solo el documento original limpio junto con el puntaje
      //   {
      //     $replaceRoot: {
      //       newRoot: {
      //         $mergeObjects: [
      //           '$document',
      //           { score: '$combinedScore' }
      //         ]
      //       }
      //     }
      //   },
      //   // Etapa 7: Proyectar solo los campos deseados y el puntaje
      //   {
      //     $project: {
      //       _id: 1,
      //       name: 1,
      //       price: 1,
      //       score: 1
      //     }
      //   }
      // ]
      return this.resultModel.aggregate(pipeline as any)
    } catch (error) {
      console.error('Error al buscar las peliculas o series similares:', error)
      return []
    }
  }

  async getSimilarMediaGemini (embedding: number[]): Promise<any[]> {
    try {
      // Busqueda con vector search
      const pipeline = [
        {
          $vectorSearch: {
            index: 'vector_index_search_2',
            path: 'embedding',
            queryVector: embedding,
            numCandidates: 100,
            limit: 10
          }
        },
        {
          $project: {
            _id: 0,
            lab: 1,
            price: 1,
            name: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ]
      return this.resultCopyModel.aggregate(pipeline as any)
    } catch (error) {
      console.error('Error al buscar las peliculas o series similares:', error)
      return []
    }
  }
}
