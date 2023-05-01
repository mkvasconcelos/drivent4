import { forbiddenError, notFoundError } from '@/errors';
import bookingsRepository from '@/repositories/bookings-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
// import paymentsRepository from '@/repositories/payments-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getBooking(userId: number) {
  const booking = await bookingsRepository.findBookingByUserId(userId);
  delete booking.roomId;
  delete booking.userId;
  delete booking.updatedAt;
  delete booking.createdAt;
  if (!booking) {
    throw notFoundError();
  }
  return booking;
}

async function createBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw forbiddenError();
  }
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status === 'RESERVED' || !ticket) {
    throw forbiddenError();
  }
  // const payment = await paymentsRepository.findPaymentByTicketId(ticket.id);
  // if (!payment) {
  //   throw forbiddenError();
  // }
  const room = await bookingsRepository.findRoomById(roomId);
  if (!room) {
    throw notFoundError();
  }
  const booking = await bookingsRepository.findBookingByRoomId(roomId);
  if (room.capacity <= booking.length) {
    throw forbiddenError();
  }
  const bookingReservation = await bookingsRepository.createBooking(userId, roomId);
  return bookingReservation;
}

async function updateBooking(userId: number, bookingId: number, roomId: number) {
  const booking = await bookingsRepository.findBookingById(bookingId);
  if (!booking || booking.userId !== userId) {
    throw forbiddenError();
  }
  const room = await bookingsRepository.findRoomById(roomId);
  if (!room) {
    throw notFoundError();
  }
  const bookingReservations = await bookingsRepository.findBookingByRoomId(roomId);
  if (room.capacity <= bookingReservations.length) {
    throw forbiddenError();
  }
  const bookingUpdate = await bookingsRepository.updateBooking(userId, roomId, bookingId);
  return bookingUpdate;
}

const bookingsService = { getBooking, createBooking, updateBooking };

export default bookingsService;
