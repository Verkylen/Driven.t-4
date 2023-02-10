import Joi from "joi";

export const BookingIdSchema = Joi.object({ bookingId: Joi.string().pattern(new RegExp("^[1-9][0-9]*$")) });

export const BookingBodySchema = Joi.object({ roomId: Joi.number().integer().positive().required() });
