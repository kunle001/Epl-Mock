import { User } from "../models/user";
import { LoginAttr, LoginResponse, UserAttr } from "../shared/types/user";
import AppError from "../shared/utils/appError";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redisService } from "../shared/utils/redis"; // Use the RedisCache instance

export class UserService {
  static async addUser(data: UserAttr) {
    // check if a user with this email already exists

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError("a user with this email already exists", 400);
    }

    // create new user
    const user = User.build(data);
    await user.save();

    // generate jwt token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET! || global.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || global.JWT_EXPIRES_IN }
    );

    // save session in Redis using redisCache
    await redisService.set(user.id.toString(), token, 60 * 60 * 24); // token expires in 1 day

    return { token, user };
  }

  static async logIn(data: LoginAttr): Promise<LoginResponse> {
    // check if user exists
    const existingUser = await User.findOne({ email: data.email });
    if (!existingUser) {
      throw new AppError("No registered user with this email exists", 404);
    }

    // compare the entered password with the stored hashed password
    const passwordCorrect = await bcrypt.compare(
      data.password,
      existingUser.password
    );

    if (!passwordCorrect) {
      throw new AppError("Incorrect password", 400);
    }

    // generate jwt token
    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_SECRET || global.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || global.JWT_EXPIRES_IN }
    );

    // save session in Redis using redisCache
    await redisService.set(existingUser.id.toString(), token, 60 * 60 * 24); // token expires in 1 day

    return { token, user: existingUser };
  }

  // optional logout function
  static async logOut(userId: string) {
    // delete session from Redis using redisCache
    await redisService.del(userId);
  }
}
