import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: faker.datatype.number({ min: 1, max: 6 }),
      hotelId,
    },
  });
}

// export function generateCreditCardData() {
//   const futureDate = faker.date.future();

//   return {
//     issuer: faker.name.findName(),
//     number: faker.datatype.number({ min: 100000000000000, max: 999999999999999 }).toString(),
//     name: faker.name.findName(),
//     expirationDate: `${futureDate.getMonth() + 1}/${futureDate.getFullYear()}`,
//     cvv: faker.datatype.number({ min: 100, max: 999 }).toString(),
//   };
// }
