import { prisma } from "@/config";
import { Booking, Prisma } from "@prisma/client";

export function createBooking(userId: number, roomId: number): Prisma.Prisma__BookingClient<Booking> {
  return prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}

export async function deleteBookingsAndRooms(): Promise<void> {
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
}
