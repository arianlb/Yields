import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Office } from '../../offices/schemas/office.schema';
import { Agent, AgentSchema } from './agent.schema';
import { Source, SourceSchema } from './source.schema';

@Schema()
export class Month {
  @Prop({
    unique: true,
    index: true,
  })
  name: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Office' })
  office: Office;

  @Prop([AgentSchema])
  agents: Agent[];

  @Prop([SourceSchema])
  sources: Source[];
}

export type MonthDocument = HydratedDocument<Month>;

export const MonthSchema = SchemaFactory.createForClass(Month);
