import { Types } from "mongoose";

export interface JwtPayload {
    uid: Types.ObjectId;
}