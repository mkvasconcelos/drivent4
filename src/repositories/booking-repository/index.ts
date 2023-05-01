import { prisma } from '@/config';
// import { PaymentParams } from '@/protocols';

async function findBookingByUserId(userId: number) {
  const res = await prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    },
  });
  return res;
}

async function updateBooking(userId: number, roomId: number, bookingId: number) {
  const res = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
  return res;
}

async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

async function findRoomById(roomId: number) {
  return await prisma.room.findUnique({
    where: {
      id: roomId,
    },
  });
}

async function findBookingByRoomId(roomId: number) {
  return await prisma.booking.findMany({
    where: {
      roomId,
    },
  });
}

async function findBookingById(bookingId: number) {
  return await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });
}

export default {
  findBookingByUserId,
  createBooking,
  updateBooking,
  findRoomById,
  findBookingByRoomId,
  findBookingById,
};
