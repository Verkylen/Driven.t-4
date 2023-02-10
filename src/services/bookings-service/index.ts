import { forbiddenError, notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import { Booking, Room, Ticket, TicketType } from "@prisma/client";

async function getBooking(userId: number): Promise<{ id: number; Room: Room; }> {
  await checkingEnrollmentAndTicket(userId);

  const booking: {
    id: number;
    Room: Room;
  } = await bookingRepository.findBookingByUserId(userId);

  if (booking === null) {
    throw notFoundError();
  }

  return booking;
}

async function postBooking(userId: number, body: {roomId: number;}): Promise<number> {
  await checkingEnrollmentAndTicket(userId);

  const room: Room = await bookingRepository.findRoomById(body.roomId);

  if (room === null) {
    throw notFoundError();
  }

  const bookedRoom: Booking = await bookingRepository.findBookingByRoomId(body.roomId);

  if (bookedRoom !== null) {
    throw forbiddenError();
  }

  const { id }: {id: number;} = await bookingRepository.makeBooking(userId, body.roomId);

  return id;
}

async function putBooking(userId: number, bookingId: number, body: {roomId: number;}): Promise<number> {
  await checkingEnrollmentAndTicket(userId);

  const room: Room = await bookingRepository.findRoomById(body.roomId);

  if (room === null) {
    throw notFoundError();
  }

  const bookedRoom: Booking = await bookingRepository.findBookingByRoomId(body.roomId);

  if (bookedRoom !== null) {
    throw forbiddenError();
  }
  
  const { id }: {id: number;} = await bookingRepository.changeBooking(bookingId, body.roomId);

  return id;
}

async function checkingEnrollmentAndTicket(userId: number) {
  const enrollmentAndTicketUser: (Ticket & {
    TicketType: TicketType;
  })[] = await bookingRepository.findEnrollmentAndTicketByUserId(userId);  

  if (enrollmentAndTicketUser === null) {
    throw forbiddenError();
  }

  if (enrollmentAndTicketUser.length === 0) {
    throw forbiddenError();
  }

  if (enrollmentAndTicketUser[0].TicketType.isRemote === true) {
    throw forbiddenError();
  }

  if (enrollmentAndTicketUser[0].TicketType.includesHotel === false) {
    throw forbiddenError();
  }

  if (enrollmentAndTicketUser[0].status !== "PAID") {
    throw forbiddenError();
  }
}

const bookingService = {
  getBooking,
  postBooking,
  putBooking
};

export default bookingService;
