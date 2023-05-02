import { forbiddenError, notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getBooking(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);
  if (!booking) {
    throw notFoundError();
  }
  delete booking.roomId;
  delete booking.userId;
  delete booking.updatedAt;
  delete booking.createdAt;
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
  const room = await bookingRepository.findRoomById(roomId);
  if (!room) {
    throw notFoundError();
  }
  const booking = await bookingRepository.findBookingByRoomId(roomId);
  if (room.capacity <= booking.length) {
    throw forbiddenError();
  }
  const bookingReservation = await bookingRepository.createBooking(userId, roomId);
  return bookingReservation;
}

async function updateBooking(userId: number, bookingId: number, roomId: number) {
  const booking = await bookingRepository.findBookingById(bookingId);
  if (!booking || booking.userId !== userId) {
    throw forbiddenError();
  }
  const room = await bookingRepository.findRoomById(roomId);
  if (!room) {
    throw notFoundError();
  }
  const bookingReservations = await bookingRepository.findBookingByRoomId(roomId);
  if (room.capacity <= bookingReservations.length) {
    throw forbiddenError();
  }
  const bookingUpdate = await bookingRepository.updateBooking(userId, roomId, bookingId);
  return bookingUpdate;
}

const bookingService = { getBooking, createBooking, updateBooking };

export default bookingService;
