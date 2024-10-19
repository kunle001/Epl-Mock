import { Request, Response } from "express";
import { catchAsync } from "../shared/utils/catchAsync";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../shared/response";

export class UserController extends UserService {
  static signUp = catchAsync(async (req: Request, res: Response) => {
    const { email, name, password, confirm_password } = req.body;
    const user = await this.addUser({
      email,
      name,
      password,
      confirm_password,
    });

    sendSuccess(res, 200, user, "account created succesfully");
  });

  static signIn = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await this.logIn({
      email,
      password,
    });

    sendSuccess(res, 200, user, "logged in");
  });

  static signOut = catchAsync(async (req: Request, res: Response) => {
    await this.logOut(req.currentUser?.id!);

    sendSuccess(res, 200, null, "logged out");
  });
}
