import httpStatus from "http-status";
import { Response } from "express";
import bookingService from "@/services/bookings-service";
import { AuthenticatedRequest } from "@/middlewares";
import { Room } from "@prisma/client";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const booking: {
      id: number;
      Room: Room;
    } = await bookingService.getBooking(req.userId as number);
    res.send(booking);
  } catch(error) {
    if (error.name === "NotFoundError") {
      res.status(httpStatus.NOT_FOUND).send(error);  
    }

    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const bookingId: number = await bookingService.postBooking(req.userId as number, req.body as {roomId: number;});
    res.send(bookingId);
  } catch(error) {
    if (error.name === "NotFoundError") {
      res.status(httpStatus.NOT_FOUND).send(error);  
    }

    if (error.name === "forbiddenError") {
      res.status(httpStatus.FORBIDDEN).send(error);  
    }

    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const bookingId: number = await bookingService.putBooking(req.userId as number, Number(req.params.bookingId), req.body as {roomId: number});
    res.send(bookingId);
  } catch(error) {
    if (error.name === "NotFoundError") {
      res.status(httpStatus.NOT_FOUND).send(error);  
    }

    if (error.name === "forbiddenError") {
      res.status(httpStatus.FORBIDDEN).send(error);  
    }

    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
