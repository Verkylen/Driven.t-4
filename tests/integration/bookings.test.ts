import supertest from "supertest";
import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import { createBooking, createEnrollmentWithAddress, createHotel, createRoomWithHotelId, createTicket, createTicketType, createUser, deleteBookingsAndRooms } from "../factories";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("Should return status code 401 when request is made without header authentication", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should return status code 401 when request is made without the Bearer", async () => {
    const token = await generateValidToken();

    const response = await server.get("/booking").set("Authorization", token);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should return status code 401 when request is made without token", async () => {
    const response = await server.get("/booking").set("Authorization", "Bearer");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should return status code 401 when token is invalid", async () => {
    const token = faker.lorem.word();  
        
    const response = await server.get("/booking").set("Authorization", "Bearer " + token);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should return status code 404 when the user does not have booking", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketType(includesHotel, isRemote);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/booking").set("Authorization", "Bearer " + token);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("Should respond with status code 200 and return data according to the business rule when the request is made under normal conditions", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketType(includesHotel, isRemote);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const { id, name, capacity, hotelId, createdAt, updatedAt } = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, id);

    const response = await server.get("/booking").set("Authorization", "Bearer " + token);

    expect(response.status).toBe(httpStatus.OK);

    expect(response.body).toEqual({
      id: booking.id,
      Room: {
        id,
        name,
        capacity,
        hotelId,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString()
      }
    });
  });
});

describe("POST /booking", () => {
  it("Should return status code 401 when request is made without header authentication", async () => {
    const roomId = faker.datatype.number();
    const body = { roomId };

    const response = await server
      .post("/booking")
      .send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should return status code 401 when request is made without the Bearer", async () => {
    const roomId = faker.datatype.number();
    const body = { roomId };

    const token = await generateValidToken();

    const response = await server
      .post("/booking")
      .set("Authorization", token)
      .send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should return status code 401 when request is made without token", async () => {
    const roomId = faker.datatype.number();
    const body = { roomId };

    const response = await server
      .post("/booking")
      .set("Authorization", "Bearer")
      .send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should return status code 401 when token is invalid", async () => {
    const roomId = faker.datatype.number();
    const body = { roomId };
    
    const token = faker.lorem.word();  
        
    const response = await server
      .post("/booking")
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should return status code 403 when the body is not sent", async () => {
    const token = await generateValidToken();

    const response = await server.post("/booking").set("Authorization", "Bearer " + token);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("Should return status code 403 when an empty object is sent as body", async () => {
    const token = await generateValidToken();
    const body = {};

    const response = await server.post("/booking")
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("Should return status code 403 when an invalid body is sent", async () => {
    const token = await generateValidToken();
    const anyValue = faker.datatype.number();
    const body = { anyKey: anyValue };

    const response = await server.post("/booking")
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("Should return status code 403 when an invalid roomId is sent", async () => {
    const token = await generateValidToken();
    const roomId = faker.datatype.number() * (-1);
    const body = { roomId };

    const response = await server.post("/booking")
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("Should return status code 403 when there is no enrollment", async () => {
    const token = await generateValidToken();
    const roomId = faker.datatype.number();
    const body = { roomId };

    const response = await server.post("/booking")
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("Should return status code 403 when there is no ticket", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const roomId = faker.datatype.number();
    const body = { roomId };
    await createEnrollmentWithAddress(user);

    const response = await server.post("/booking")
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("Should return status code 403 when the ticket type is remote", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const roomId = faker.datatype.number();
    const body = { roomId };
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = true;
    const includesHotel = true;
    const ticketType = await createTicketType(includesHotel, isRemote);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.post("/booking")
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  
  it("Should return status code 403 when the ticket does not include hotel", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const roomId = faker.datatype.number();
    const body = { roomId };
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = false;
    const ticketType = await createTicketType(includesHotel, isRemote);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.post("/booking")
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("Should return status code 402 when the ticket was not paid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const roomId = faker.datatype.number();
    const body = { roomId };
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketType(includesHotel, isRemote);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await server.post("/booking")
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  
  it("It should respond with status code 404 when the roomId does not exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const roomId = faker.datatype.number();
    const body = { roomId };
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketType(includesHotel, isRemote);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await deleteBookingsAndRooms();

    const response = await server.post("/booking")
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("It should respond with status code 403 when the room is not vacant", async () => {
    const firstUser = await createUser();

    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    await createBooking(firstUser.id, room.id);

    const body = { roomId: room.id };

    const secondUser = await createUser();
    const token = await generateValidToken(secondUser);
    const enrollment = await createEnrollmentWithAddress(secondUser);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketType(includesHotel, isRemote);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.post("/booking")
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("It should respond with status code 200 and return bookingId when the request is made according to the business rule", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const body = { roomId: room.id };
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketType(includesHotel, isRemote);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.post("/booking")
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.OK);

    expect(response.body).toEqual({ bookingId: expect.any(Number) });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("Should return status code 401 when request is made without header authentication", async () => {
    const bookingId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const body = { roomId };

    const response = await server.put("/booking/" + bookingId).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should return status code 401 when request is made without the Bearer", async () => {
    const bookingId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const body = { roomId };
    const token = await generateValidToken();

    const response = await server
      .put("/booking/" + bookingId)
      .set("Authorization", token)
      .send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should return status code 401 when request is made without token", async () => {
    const bookingId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const body = { roomId };

    const response = await server
      .put("/booking/" + bookingId)
      .set("Authorization", "Bearer")
      .send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should return status code 401 when token is invalid", async () => {
    const bookingId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const body = { roomId };
    const token = faker.lorem.word();  
        
    const response = await server
      .put("/booking/" + bookingId)
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Should return status code 403 when the path parameter is invalid", async () => {
    const bookingId = faker.random.word();
    const token = await generateValidToken();
    const roomId = faker.datatype.number();
    const body = { roomId };

    const response = await server
      .put("/booking/" + bookingId)
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("Should return status code 403 when the body is not sent", async () => {
    const bookingId = faker.datatype.number();
    const token = await generateValidToken();

    const response = await server.put("/booking/" + bookingId).set("Authorization", "Bearer " + token);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("Should return status code 403 when an empty object is sent as body", async () => {
    const bookingId = faker.datatype.number();
    const token = await generateValidToken();
    const body = {};

    const response = await server
      .put("/booking/" + bookingId)
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("Should return status code 403 when an invalid body is sent", async () => {
    const bookingId = faker.datatype.number();
    const token = await generateValidToken();
    const anyValue = faker.datatype.number();
    const body = { anyKey: anyValue };

    const response = await server
      .put("/booking/" + bookingId)
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("Should return status code 403 when an invalid roomId is sent", async () => {
    const bookingId = faker.datatype.number();
    const token = await generateValidToken();
    const roomId = faker.datatype.number() * (-1);
    const body = { roomId };

    const response = await server
      .put("/booking/" + bookingId)
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("It should respond with status code 403 when the user does not have booking", async () => {
    const bookingId = faker.datatype.number();
    const user = await createUser();
    const token = await generateValidToken(user);
    const roomId = faker.datatype.number();
    const body = { roomId };
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketType(includesHotel, isRemote);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server
      .put("/booking/" + bookingId)
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  
  it("It should respond with status code 404 when the roomId does not exist", async () => {
    await deleteBookingsAndRooms();
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id);
    const randomNumber = faker.datatype.number({ min: 1 });
    const body = { roomId: room.id + randomNumber };
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketType(includesHotel, isRemote);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    
    const response = await server
      .put("/booking/" + booking.id)
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("It should respond with status code 403 when the room is not vacant", async () => {
    const hotel = await createHotel();

    const firstUser = await createUser();
    const firstRoom = await createRoomWithHotelId(hotel.id);
    await createBooking(firstUser.id, firstRoom.id);

    const body = { roomId: firstRoom.id };

    const secondUser = await createUser();
    const token = await generateValidToken(secondUser);
    const secondRoom = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(secondUser.id, secondRoom.id);
    const enrollment = await createEnrollmentWithAddress(secondUser);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketType(includesHotel, isRemote);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server
      .put("/booking/" + booking.id)
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("It should respond with status code 200 and return bookingId when the request is made according to the business rule", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const firstRoom = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, firstRoom.id);
    const secondRoom = await createRoomWithHotelId(hotel.id);
    const body = { roomId: secondRoom.id };
    const enrollment = await createEnrollmentWithAddress(user);
    const isRemote = false;
    const includesHotel = true;
    const ticketType = await createTicketType(includesHotel, isRemote);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    
    const response = await server
      .put("/booking/" + booking.id)
      .set("Authorization", "Bearer " + token)
      .send(body);

    expect(response.status).toBe(httpStatus.OK);

    expect(response.body).toEqual({ bookingId: expect.any(Number) });
  });
});
