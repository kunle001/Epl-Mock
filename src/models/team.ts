import mongoose from "mongoose";
import { TeamAttr, TeamDoc, TeamModel } from "../shared/types/team";

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  manager: { type: String, required: true },
  stadium: { type: String, required: true },
  //   toObject: { virtuals: true },
});

TeamSchema.statics.build = (attrs: TeamAttr) => {
  return new Team(attrs);
};

const Team = mongoose.model<TeamDoc, TeamModel>("Team", TeamSchema);

export { Team };
