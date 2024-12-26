import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema()
export class Person {
  @Prop()
  name: string;

  @Prop()
  phone: number;

  @Prop({ required: true })
  since: Date;

  @Prop()
  source: string;

  @Prop()
  sebanda: number;

  @Prop({ default: false })
  isCustomer: boolean;

  @Prop({ type: [String] })
  notes: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  agent: User;
}

export type PersonDocument = HydratedDocument<Person>;

export const PersonSchema = SchemaFactory.createForClass(Person);
