import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Person } from '../../persons/schemas/person.schema';
import { Office } from '../../offices/schemas/office.schema';

@Schema()
export class Policy {
  @Prop()
  policyNumber: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Office' })
  office: Office;

  @Prop()
  effectiveDate: Date;

  @Prop()
  expirationDate: Date;

  @Prop()
  cancellationDate: Date;

  @Prop()
  carrier: string;

  @Prop()
  premium: number;

  @Prop({ default: false })
  renewed: boolean;

  @Prop({ type: [String] })
  notes: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  salesAgent: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  renewalAgent: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Person' })
  person: Person;
}

export type PolicyDocument = HydratedDocument<Policy>;

export const PolicySchema = SchemaFactory.createForClass(Policy);
