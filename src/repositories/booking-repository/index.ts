import { prisma } from "@/config";
import { Booking, Prisma, PrismaPromise, Room, Ticket, TicketType } from "@prisma/client";

function findBookingByUserId(userId: number): Prisma.Prisma__BookingClient<{ id: number; Room: Room; }> {
  return prisma.booking.findFirst({
    where: { userId },
    select: {
      id: true,
      Room: true
    }
  });
}

function makeBooking(userId: number, roomId: number): Prisma.Prisma__BookingClient<Booking> {  
  return prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}

function changeBooking(id: number, roomId: number): Prisma.Prisma__BookingClient<Booking> {
  return prisma.booking.update({
    where: { id },
    data: { roomId }
  });
}

function findEnrollmentAndTicketByUserId(userId: number): PrismaPromise<(Ticket & { TicketType: TicketType; })[]> {
  return prisma.enrollment.findUnique({ where: { userId } })
    .Ticket({ include: { TicketType: true } });
}

function findRoomById(id: number): Prisma.Prisma__RoomClient<Room> {
  return prisma.room.findUnique({ where: { id } });
}

function findBookingByRoomId(roomId: number): Prisma.Prisma__BookingClient<Booking> {
  return prisma.booking.findFirst({ where: { roomId } });
}

function findBookingById(id: number): Prisma.Prisma__BookingClient<Booking> {
  return prisma.booking.findUnique({ where: { id } });
}

const bookingRepository = {
  findBookingByUserId,
  makeBooking,
  changeBooking,
  findEnrollmentAndTicketByUserId,
  findRoomById,
  findBookingByRoomId,
  findBookingById
};

export default bookingRepository;
