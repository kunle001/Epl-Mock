import mongoose from "mongoose";

export interface TeamAttr {
  name: string;
  logo: string;
  stadium: string;
  manager: string;
}

export interface UpdateTeamAttr {
  name?: string;
  logo?: string;
  stadium?: string;
  manager?: string;
}

export interface TeamDoc extends mongoose.Document {
  name: string;
  manager: string;
  stadium: string;
}

export interface TeamModel extends mongoose.Model<TeamDoc> {
  build(attr: TeamAttr): TeamDoc;
}
