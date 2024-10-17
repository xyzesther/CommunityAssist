import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    request: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: () => (req, res, next) => next(),
}));

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.post('/verify-user', async (req, res) => {
  const auth0Id = 'auth0|12345';
  const email = 'test@example.com';
  const name = 'Test User';

  let user = await prisma.user.findUnique({
    where: { auth0Id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { email, auth0Id, name },
    });
  }
  res.json(user);
});

app.post('/requests', async (req, res) => {
  const { title, description } = req.body;
  const auth0Id = 'auth0|12345';

  const user = await prisma.user.findUnique({ where: { auth0Id } });
  const newRequest = await prisma.request.create({
    data: { title, description, userId: user.id },
  });
  res.status(201).json(newRequest);
});

app.get('/requests', async (req, res) => {
    const requests = await prisma.request.findMany();
    res.json(requests);
  });
  
app.get('/requests/user', async (req, res) => {
  const auth0Id = 'auth0|12345';
  const user = await prisma.user.findUnique({ where: { auth0Id } });
  const requests = await prisma.request.findMany({ where: { userId: user.id } });
  res.json(requests);
});

app.put('/requests/:id', async (req, res) => {
  const { title, description, status } = req.body;
  const updatedRequest = await prisma.request.update({
    where: { requestId: parseInt(req.params.id) },
    data: { title, description, status },
  });
  res.json(updatedRequest);
});

describe('API Endpoints', () => {
  it('should return pong on GET /ping', async () => {
    const res = await request(app).get('/ping');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('pong');
  });

  it('should verify and create user on POST /verify-user', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    prisma.user.create.mockResolvedValueOnce({
      id: 1,
      email: 'test@example.com',
      auth0Id: 'auth0|12345',
      name: 'Test User',
    });

    const res = await request(app).post('/verify-user');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toEqual('test@example.com');
  });

  it('should create a new request on POST /requests', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 1 });
    prisma.request.create.mockResolvedValueOnce({
      requestId: 1,
      title: 'Test Request',
      description: 'Test Description',
      userId: 1,
    });

    const res = await request(app).post('/requests').send({
      title: 'Test Request',
      description: 'Test Description',
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('requestId');
    expect(res.body.title).toEqual('Test Request');
  });
});
