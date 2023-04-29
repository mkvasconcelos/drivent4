import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingsService from '@/services/bookings-service';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const booking = await bookingsService.getBooking(userId);
    return res.status(httpStatus.OK).send(booking);
  } catch {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  try {
    await bookingsService.createBooking(userId, roomId);
    return res.status(httpStatus.OK);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.send(httpStatus.NOT_FOUND);
    }
    if (error.name === 'ForbiddenError') {
      return res.send(httpStatus.FORBIDDEN);
    }
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  const { bookingId } = req.params;
  try {
    await bookingsService.updateBooking(userId, Number(bookingId), roomId);
    return res.status(httpStatus.OK);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.send(httpStatus.NOT_FOUND);
    }
    if (error.name === 'ForbiddenError') {
      return res.send(httpStatus.FORBIDDEN);
    }
  }
}
