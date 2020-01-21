import * as mongoose from 'mongoose';
import { roleEnum } from '../enums/role.enum';

export const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  roles: { type: [String], required: true, enum: Object.values(roleEnum) },
  password: { type: String, required: true },
});

UserSchema.index({ email: 1 }, { unique: true });