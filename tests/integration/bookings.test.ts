import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {
  createEnrollmentWithAddress,
  createUser,
  createBooking,
  createTicketType,
  createTicket,
  createPayment,
  generateCreditCardData,
  createHotel,
  createRoom,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { prisma } from '@/config';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 if user doesnt have a booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    // it('should respond with status 404 when given ticket doesnt exist', async () => {
    //   const user = await createUser();
    //   const token = await generateValidToken(user);
    //   await createEnrollmentWithAddress(user);

    //   const response = await server.get('/payments?ticketId=1').set('Authorization', `Bearer ${token}`);

    //   expect(response.status).toEqual(httpStatus.NOT_FOUND);
    // });

    // it('should respond with status 401 when user doesnt own given ticket', async () => {
    //   const user = await createUser();
    //   const token = await generateValidToken(user);
    //   await createEnrollmentWithAddress(user);
    //   const ticketType = await createTicketType();

    //   const otherUser = await createUser();
    //   const otherUserEnrollment = await createEnrollmentWithAddress(otherUser);
    //   const ticket = await createTicket(otherUserEnrollment.id, ticketType.id, TicketStatus.RESERVED);

    //   const response = await server.get(`/payments?ticketId=${ticket.id}`).set('Authorization', `Bearer ${token}`);

    //   expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    // });

    it('should respond with status 200 and with booking data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const response = await server.get(`/booking`).set('Authorization', `Bearer ${token}`);
      const expected = {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        hotelId: room.hotelId,
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString(),
      };
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: expected,
      });
    });
  });
});

// describe('POST /payments/process', () => {
//   it('should respond with status 401 if no token is given', async () => {
//     const response = await server.post('/payments/process');

//     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//   });

//   it('should respond with status 401 if given token is not valid', async () => {
//     const token = faker.lorem.word();

//     const response = await server.post('/payments/process').set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//   });

//   it('should respond with status 401 if there is no session for given token', async () => {
//     const userWithoutSession = await createUser();
//     const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

//     const response = await server.post('/payments/process').set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
//   });

//   describe('when token is valid', () => {
//     it('should respond with status 400 if body param ticketId is missing', async () => {
//       const user = await createUser();
//       const token = await generateValidToken(user);
//       const enrollment = await createEnrollmentWithAddress(user);
//       const ticketType = await createTicketType();
//       await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

//       const body = { cardData: generateCreditCardData() };

//       const response = await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(body);

//       expect(response.status).toEqual(httpStatus.BAD_REQUEST);
//     });

//     it('should respond with status 400 if body param cardData is missing', async () => {
//       const user = await createUser();
//       const token = await generateValidToken(user);
//       const enrollment = await createEnrollmentWithAddress(user);
//       const ticketType = await createTicketType();
//       const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

//       const body = { ticketId: ticket };

//       const response = await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(body);

//       expect(response.status).toEqual(httpStatus.BAD_REQUEST);
//     });

//     it('should respond with status 404 when given ticket doesnt exist', async () => {
//       const user = await createUser();
//       const token = await generateValidToken(user);
//       await createEnrollmentWithAddress(user);

//       const body = { ticketId: 1, cardData: generateCreditCardData() };

//       const response = await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(body);

//       expect(response.status).toEqual(httpStatus.NOT_FOUND);
//     });

//     it('should respond with status 401 when user doesnt own given ticket', async () => {
//       const user = await createUser();
//       const token = await generateValidToken(user);
//       await createEnrollmentWithAddress(user);
//       const ticketType = await createTicketType();

//       const otherUser = await createUser();
//       const otherUserEnrollment = await createEnrollmentWithAddress(otherUser);
//       const ticket = await createTicket(otherUserEnrollment.id, ticketType.id, TicketStatus.RESERVED);

//       const body = { ticketId: ticket.id, cardData: generateCreditCardData() };

//       const response = await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(body);

//       expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
//     });

//     it('should respond with status 200 and with payment data', async () => {
//       const user = await createUser();
//       const token = await generateValidToken(user);
//       const enrollment = await createEnrollmentWithAddress(user);
//       const ticketType = await createTicketType();
//       const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

//       const body = { ticketId: ticket.id, cardData: generateCreditCardData() };

//       const response = await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(body);

//       expect(response.status).toEqual(httpStatus.OK);
//       expect(response.body).toEqual({
//         id: expect.any(Number),
//         ticketId: ticket.id,
//         value: ticketType.price,
//         cardIssuer: body.cardData.issuer,
//         cardLastDigits: body.cardData.number.slice(-4),
//         createdAt: expect.any(String),
//         updatedAt: expect.any(String),
//       });
//     });

//     it('should insert a new payment in the database', async () => {
//       const user = await createUser();
//       const token = await generateValidToken(user);
//       const enrollment = await createEnrollmentWithAddress(user);
//       const ticketType = await createTicketType();
//       const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

//       const beforeCount = await prisma.payment.count();

//       const body = { ticketId: ticket.id, cardData: generateCreditCardData() };
//       await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(body);

//       const afterCount = await prisma.payment.count();

//       expect(beforeCount).toEqual(0);
//       expect(afterCount).toEqual(1);
//     });

//     it('should set ticket status as PAID', async () => {
//       const user = await createUser();
//       const token = await generateValidToken(user);
//       const enrollment = await createEnrollmentWithAddress(user);
//       const ticketType = await createTicketType();
//       const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

//       const body = { ticketId: ticket.id, cardData: generateCreditCardData() };
//       await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(body);

//       const updatedTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });

//       expect(updatedTicket.status).toEqual(TicketStatus.PAID);
//     });
//   });
// });
