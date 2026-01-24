import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export interface SourceObject {
  name: string;
  color: string;
}

@Schema()
export class Office {
  @Prop()
  name: string;

  @Prop({ unique: true })
  sebanda: number;

  @Prop({ type: [String] })
  sources: string[];

  @Prop(raw([{ name: { type: String }, color: { type: String } }]))
  sourceObjects: SourceObject[];

  @Prop()
  qqOfficeId: number;

  @Prop()
  QQID: string;
}

export type OfficeDocument = HydratedDocument<Office>;

export const OfficeSchema = SchemaFactory.createForClass(Office);
