import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Office } from '../../offices/schemas/office.schema';

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: [String],
    default: ['ROLE_USER'],
  })
  roles: string[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Office' }] })
  offices: Office[];

  @Prop()
  qqUserId: number;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.toJSON = function () {
  const { __v, password, ...user } = this.toObject();
  return user;
};
