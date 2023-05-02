import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { createBooking, getBooking, updateBooking } from '@/controllers';
import { bookingSchema } from '@/schemas/booking-schemas';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBooking)
  .put('/:bookingId', validateBody(bookingSchema), updateBooking)
  .post('/', validateBody(bookingSchema), createBooking);

export { bookingRouter };
