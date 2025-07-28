import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'

export class CodeAtc {
  @Prop()
    code: string

  @Prop()
    group: string

  @Prop()
    subGroup: string
}

@Schema({ timestamps: true, collection: 'resultsCopy' })
export class ResultCopy {
  @Prop()
    searchIds: any[]

  @Prop({ required: true })
    price: number

  @Prop({ required: true })
    name: string

  @Prop()
    description: string

  @Prop()
    lab: string

  @Prop()
    imgLink: string

  @Prop({ required: true, index: true, unique: true })
    link: string

  @Prop({ required: true })
    pharmacy: string

  @Prop()
    concentration: string

  @Prop()
    type: string

  @Prop()
    units: number

  @Prop()
    pricePerUnit: number

  @Prop()
    activePrinciple: string

  @Prop()
    needsRx: string

  @Prop({ required: true })
    isAvailable: boolean

  @Prop({ required: true })
    fullPrice: number

  @Prop()
    invima: string

  @Prop()
    atc: CodeAtc

  @Prop()
    isNormalized: boolean

  @Prop()
    sku: string

  @Prop()
    embedding: number[]

  _id!: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  __v: number
}

export type ResultCopyDocument = ResultCopy & Document
const ResultCopySchema = SchemaFactory.createForClass(ResultCopy)
ResultCopySchema.index({ link: 1, sku: 1 }, { unique: true, background: true })
export { ResultCopySchema }
