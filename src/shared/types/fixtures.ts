import mongoose from "mongoose";

export interface FixtureAttr {
  homeTeam: string;
  awayTeam: number;
  date: Date;
}

export interface FixtureDoc extends mongoose.Document {
  homeTeam: string;
  awayTeam: number;
  status: string;
  score: { home: number; away: number };
  date: Date;
}

export interface FixtureModel extends mongoose.Model<FixtureDoc> {
  build(attr: FixtureAttr): FixtureDoc;
}

export interface UpdateFixtureAttr {
  homeTeam?: string;
  awayTeam?: number;
  score?: { home: number; away: number };
  date?: Date;
}
