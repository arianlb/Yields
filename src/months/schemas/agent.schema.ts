import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Source, SourceSchema } from './source.schema';

@Schema()
export class Agent {
  @Prop()
  userId: string;

  @Prop()
  name: string;

  @Prop([SourceSchema])
  sources: Source[];
}

export type AgentDocument = HydratedDocument<Agent>;

export const AgentSchema = SchemaFactory.createForClass(Agent);
