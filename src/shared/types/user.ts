import mongoose from "mongoose";

export interface UserAttr {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginAttr {
  email: string;
  password: string;
}

export interface UserDoc extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: UserDoc;
}
