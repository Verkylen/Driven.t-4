import { invalidDataError } from "@/errors";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ObjectSchema } from "joi";

export function validateBody<T>(schema: ObjectSchema<T>, status = "BAD_REQUEST"): ValidationMiddleware {
  return validate(schema, "body", status);
}

export function validateParams<T>(schema: ObjectSchema<T>, status = "BAD_REQUEST"): ValidationMiddleware {
  return validate(schema, "params", status);
}

function validate(schema: ObjectSchema, type: "body" | "params", status?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[type], {
      abortEarly: false,
    });

    if (!error) {
      next();
    } else {
      res.status(httpStatus[status] as number).send(invalidDataError(error.details.map((d) => d.message)));
    }
  };
}

type ValidationMiddleware = (req: Request, res: Response, next: NextFunction)=> void;
