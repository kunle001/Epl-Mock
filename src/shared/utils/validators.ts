import { NextFunction, Request, Response } from "express";
import Joi, { Schema } from "joi";
import AppError from "./appError";

// Validator class
export class ValidationSchema {
  // Reusable text validation methods
  private mediumTextRq(required?: boolean): Joi.Schema {
    return required
      ? Joi.string().min(5).max(30).required()
      : Joi.string().min(5).max(30);
  }

  private largeTextRq(required?: boolean): Joi.Schema {
    return required
      ? Joi.string().min(10).max(100).required()
      : Joi.string().min(10).max(100);
  }

  // Validator for UserAttr
  public createUser(): Schema {
    return Joi.object({
      name: this.mediumTextRq(false), // name is optional
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      confirm_password: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Password and confirm password must match",
        }),
    });
  }

  public loginUser(): Schema {
    return Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    });
  }

  // Validator for FixtureAttr
  public createFixture(): Schema {
    return Joi.object({
      homeTeam: this.mediumTextRq(true),
      awayTeam: this.mediumTextRq(true).invalid(Joi.ref("homeTeam")).messages({
        "any.invalid": "Home and away teams must be different",
      }),
      date: Joi.date().required(),
    });
  }
  public createTeam(): Schema {
    return Joi.object({
      name: this.mediumTextRq(true),
      logo: this.mediumTextRq(true),
      stadium: this.mediumTextRq(true),
      manager: this.mediumTextRq(true),
    });
  }

  public updateTeam(): Schema {
    return Joi.object({
      name: this.mediumTextRq(),
      logo: this.mediumTextRq(),
      stadium: this.largeTextRq(),
      manager: this.mediumTextRq(),
    });
  }
  // Validator for UpdateFixtureAttr (partial fields)
  public updateFixture(): Schema {
    return Joi.object({
      homeTeam: this.mediumTextRq().optional(),
      awayTeam: this.mediumTextRq().optional(),
      status: Joi.string().valid("started", "completed").optional(),
      score: Joi.object({
        home: Joi.number().optional(),
        away: Joi.number().optional(),
      }).optional(),
      date: Joi.date().optional(),
    });
  }
}

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  image?: string;
  refereeCode?: string;
  referalCode?: string;
}

// Function to validate the request based on a provided schema
export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      // Send a more detailed error message
      next(new AppError(error.details[0].message, 400));
    } else {
      next();
    }
  };
};
