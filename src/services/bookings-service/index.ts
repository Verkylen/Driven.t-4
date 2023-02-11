import { forbiddenError, notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import { Booking, Room, Ticket, TicketType } from "@prisma/client";

async function getBooking(userId: number): Promise<{ id: number; Room: Room; }> {
  const booking: {
    id: number;
    Room: Room;
  } = await bookingRepository.findBookingByUserId(userId);

  if (booking === null) {
    throw notFoundError();
  }

  return booking;
}

async function postBooking(userId: number, body: {roomId: number;}): Promise<{ bookingId: number; }> {
  await checkingEnrollmentAndTicket(userId);

  const room: Room = await bookingRepository.findRoomById(body.roomId);

  if (room === null) {
    throw notFoundError();
  }

  const bookedRoom: Booking = await bookingRepository.findBookingByRoomId(body.roomId);

  if (bookedRoom !== null) {
    throw forbiddenError();
  }

  const { id: bookingId }: { id: number; } = await bookingRepository.makeBooking(userId, body.roomId);

  return { bookingId };
}

async function putBooking(id: number, body: {roomId: number;}): Promise<{ bookingId: number; }> {
  const booking: Booking = await bookingRepository.findBookingById(id);

  if (booking === null) {
    throw forbiddenError();
  }

  const room: Room = await bookingRepository.findRoomById(body.roomId);

  if (room === null) {
    throw notFoundError();
  }

  const bookedRoom: Booking = await bookingRepository.findBookingByRoomId(body.roomId);

  if (bookedRoom !== null) {
    throw forbiddenError();
  }
  
  const { id: bookingId }: { id: number; } = await bookingRepository.changeBooking(id, body.roomId);

  return { bookingId };
}

async function checkingEnrollmentAndTicket(userId: number): Promise<void> {
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
