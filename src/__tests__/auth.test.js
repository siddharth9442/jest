import request from "supertest";
import { app } from '../app.js';
import mongoose from "mongoose";
import * as Model from '../models/index.js';
import { TEST_DB_NAME } from '../constants.js';

beforeAll(async () => {
    // connect to test db
    const uri = `${process.env.MONGODB_URI}/${TEST_DB_NAME}`;
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
})

beforeEach(async () => {
    await Model.User.deleteMany({});
})

describe('Auth API', () => {
    it("should register a new user", async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: "Siddharth Khubikar",
                username: "siddharth1",
                email: "test@example.com",
                avatar: "http://res.cloudinary.com/dqed7dzu8/image/upload/v1710231036/v4vechmnn35em5bgs10x.jpg",
                address: {
                    line1: "Shitolenagar",
                    line2: "Old Sangvi",
                    city: "Pune",
                    pincode: "411027"
                },
                mobileNo: "1234567890",
                password: "password@123"
            })

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data.fullName).toBe("Siddharth Khubikar");
        expect(res.body.data.email).toBe("test@example.com");
        expect(res.body.data.username).toBe("siddharth1");
        expect(res.body.data.mobileNo).toBe("1234567890");
        expect(res.body.message).toBe('User registered successfully');
    });

    describe("Login User", () => {
        it("should login a user using email", async () => {

            await Model.User.create({
                fullName: "Siddharth Khubikar",
                username: "siddharth1",
                email: "test@example.com",
                password: "Sid@123"
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "test@example.com",
                    password: "Sid@123"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data).toHaveProperty('accessToken');
            expect(res.body.data).toHaveProperty('refreshToken');
            expect(res.body.data.user).toHaveProperty('_id');
            expect(res.body.data.user.username).toBe('siddharth1');
            expect(res.body.data.user.email).toBe('test@example.com');
        });

        it("should login a user using username", async () => {
            await Model.User.create({
                fullName: "Siddharth Khubikar",
                username: "siddharth1",
                email: "test@example.com",
                password: "Sid@123"
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: "siddharth1",
                    password: "Sid@123"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data).toHaveProperty('accessToken');
            expect(res.body.data).toHaveProperty('refreshToken');
            expect(res.body.data.user).toHaveProperty('_id');
            expect(res.body.data.user.username).toBe('siddharth1');
            expect(res.body.data.user.email).toBe('test@example.com');
        });
    })
});