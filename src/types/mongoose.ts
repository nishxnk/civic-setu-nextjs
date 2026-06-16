import { Document, Model, Types } from "mongoose";
import { IUser, IComplaint } from "./index";

export interface IUserDocument extends Omit<IUser, "_id">, Document<Types.ObjectId> {
  _id: Types.ObjectId;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {}

export interface IComplaintDocument
  extends Omit<IComplaint, "_id">, Document<Types.ObjectId> {
  _id: Types.ObjectId;
}
