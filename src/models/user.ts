import mongoose from "mongoose";
import { UserAttr, UserDoc } from "../shared/types/user";
import bcrypt from "bcrypt";

interface UserModel extends mongoose.Model<UserDoc> {
  build(attr: UserAttr): UserDoc;
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: {
      type: String,
      default: "user",
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password;
      },
    },
    toObject: { virtuals: true },
  }
);

UserSchema.statics.build = (attrs: UserAttr) => {
  return new User(attrs);
};

UserSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await bcrypt.hash(this.get("password")!, 12);
    this.set("password", hashed);
  }

  done();
});

const User = mongoose.model<UserDoc, UserModel>("User", UserSchema);

export { User };
