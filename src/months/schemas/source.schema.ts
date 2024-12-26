import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SourceDocument = HydratedDocument<Source>;

@Schema()
export class Source {
  @Prop()
  name: string;

  @Prop({ default: 0 })
  amount: number;

  @Prop({ default: 0 })
  sold: number;
}

export const SourceSchema = SchemaFactory.createForClass(Source);
