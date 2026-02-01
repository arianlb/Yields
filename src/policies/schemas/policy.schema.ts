import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Person } from '../../persons/schemas/person.schema';
import { Office } from '../../offices/schemas/office.schema';

@Schema()
export class Policy {
  @Prop({ required: true })
  policyNumber: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Office' })
  office: Office;

  @Prop({ required: true })
  effectiveDate: Date;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop()
  cancellationDate: Date;

  @Prop({ required: true })
  carrier: string;

  @Prop({ required: true })
  line: string;

  @Prop({ required: true })
  premium: number;

  @Prop({ default: false })
  renewed: boolean;

  @Prop()
  renewalAgent: string;

  @Prop({ default: 'A' })
  status: string;

  @Prop({ type: [String] })
  notes: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  salesAgent: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  assignedAgent: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Person' })
  person: Person;

  @Prop()
  qqPolicyId: number;
}

export type PolicyDocument = HydratedDocument<Policy>;

export const PolicySchema = SchemaFactory.createForClass(Policy);
