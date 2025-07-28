import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
    serial: string

  @Prop({ required: true })
    title: string

  @Prop({ required: true })
    synopsis: string

  @Prop({ required: true })
    url: string

  @Prop({ required: true })
    coverImage: string

  @Prop({ required: true })
    releaseYear: Date

  @Prop({ required: true })
    genre: mongoose.Types.ObjectId

  @Prop({ required: true })
    director: mongoose.Types.ObjectId

  @Prop({ required: true })
    producer: mongoose.Types.ObjectId

  @Prop({ required: true })
    type: mongoose.Types.ObjectId

  @Prop({ required: true })
    embedding: number[]

  _id!: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  __v: number
}

export type MediaDocument = Media & Document
const MediaSchema = SchemaFactory.createForClass(Media)
export { MediaSchema }
