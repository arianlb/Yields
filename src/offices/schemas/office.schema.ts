import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Office {
  @Prop()
  name: string;

  @Prop({ unique: true })
  sebanda: number;

  @Prop({ type: [String] })
  sources: string[];

  @Prop()
  qqOfficeId: number;

  @Prop()
  QQID: string;
}

export type OfficeDocument = HydratedDocument<Office>;

export const OfficeSchema = SchemaFactory.createForClass(Office);
