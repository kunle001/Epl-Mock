import mongoose, { Schema } from "mongoose";
import {
  FixtureAttr,
  FixtureDoc,
  FixtureModel,
} from "../shared/types/fixtures";

const FixtureSchema = new Schema({
  homeTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  awayTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "started", "completed"],
    default: "pending",
  },
  score: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 },
  },
  //   toObject: { virtuals: true },
});

FixtureSchema.statics.build = (attrs: FixtureAttr) => {
  return new Fixture(attrs);
};

const Fixture = mongoose.model<FixtureDoc, FixtureModel>(
  "Fixture",
  FixtureSchema
);

// Pre-find hook to update the status of the fixture based on time
FixtureSchema.pre("find", async function (next) {
  const fixtures = await this.model.find(this.getQuery());

  fixtures.forEach(async (fixture: FixtureDoc) => {
    const currentTime = new Date().getTime();
    const fixtureTime = new Date(fixture.date).getTime();
    const timeDiffInMinutes = (currentTime - fixtureTime) / (1000 * 60); // difference in minutes

    if (
      timeDiffInMinutes >= 90 &&
      timeDiffInMinutes <= 100 &&
      fixture.status === "pending"
    ) {
      // Update status to 'started'
      fixture.status = "started";
    }

    if (timeDiffInMinutes > 100 && fixture.status === "started") {
      // Update status to 'completed'
      fixture.status = "completed";
    }

    // Save the fixture if status has changed
    if (fixture.isModified("status")) {
      await fixture.save();
    }
  });

  next();
});

export { Fixture };
