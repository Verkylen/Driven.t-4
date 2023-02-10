// import supertest from "supertest";
// import app, { init } from "@/app";
// import { cleanDb } from "../helpers";
// import faker from "@faker-js/faker";
// import { prisma } from "@/config";
// import httpStatus from "http-status";

// beforeAll(async () => {
//   await init();
//   await cleanDb();
// });

// const server = supertest(app);

// describe("GET /booking", () => {
//   it("It should respond with status code 404 when the user does not have a booking", async () => {

//   });

//   it("It should respond with status code 200 and return data according to the business rule when the request is made under normal conditions", async () => {
//     const response = await server.get("")
//   });
// });

// describe("POST /booking", () => {
//   it("It should respond with status code 404 when the roomId does not exist", async () => {
    
//   });

//   it("It should respond with status code 403 when the roomId not is available", async () => {
    
//   });

//   it("It should respond with status code 200 and return bookingId", async () => {
//     const body = {roomId: faker.datatype.number()};

//     const response = await server.post("/booking").send(body);

//     expect(response).toBe(httpStatus.OK);
//   });
// });

// describe("PUT /booking/:bookingId", () => {
//   it("It should respond with status code 404 when the roomId does not exist", async () => {
    
//   });

//   it("It should respond with status code 403 when the roomId not is available", async () => {
    
//   });

//   it("It should respond with status code 200 and return bookingId", async () => {
//     const body = {roomId: faker.datatype.number()};

//     const response = await server.put("/booking/:bookingId").send(body);

//     expect(response).toBe(httpStatus.OK);
//   });
// });
