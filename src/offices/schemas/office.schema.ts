import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

@Schema()
export class Office {
  @Prop()
  name: string;

  @Prop({ unique: true })
  sebanda: number;

  @Prop({ type: [String] })
  sources: string[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  agents: User[];
}

export type OfficeDocument = HydratedDocument<Office>;

export const OfficeSchema = SchemaFactory.createForClass(Office);
