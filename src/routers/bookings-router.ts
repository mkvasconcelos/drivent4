import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { createBooking, getBooking, updateBooking } from '@/controllers';
import { bookingsSchema } from '@/schemas/booking-schemas';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .put('/:bookingId', validateBody(bookingsSchema), updateBooking)
  .post('/', validateBody(bookingsSchema), createBooking);

export { bookingsRouter };
