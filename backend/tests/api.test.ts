import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import admin from '../src/config/firebase';

const prisma = new PrismaClient();

// Mock Firebase Admin
vi.mock('../src/config/firebase', () => ({
    default: {
        auth: () => ({
            verifyIdToken: vi.fn().mockResolvedValue({
                uid: 'test-firebase-uid',
                email: 'test@example.com',
                name: 'Test User'
            })
        })
    }
}));

describe('Blood Pressure API', () => {
    let userId: string;

    beforeAll(async () => {
        // Ensure database is clean? Optional.
        // For now we trust the flow creates the user
    });

    afterAll(async () => {
        // Clean up
        await prisma.bloodPressureRecord.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    it('should create a record', async () => {
        const res = await request(app)
            .post('/api/records')
            .set('Authorization', 'Bearer mock-token')
            .send({
                systolic: 120,
                diastolic: 80,
                pulse: 70
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.systolic).toBe(120);
    });

    it('should get all records', async () => {
        const res = await request(app)
            .get('/api/records')
            .set('Authorization', 'Bearer mock-token');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should update a record', async () => {
        // First create one
        const createRes = await request(app)
            .post('/api/records')
            .set('Authorization', 'Bearer mock-token')
            .send({
                systolic: 120,
                diastolic: 80,
                pulse: 70
            });

        const id = createRes.body.id;

        const res = await request(app)
            .put(`/api/records/${id}`)
            .set('Authorization', 'Bearer mock-token')
            .send({
                systolic: 130
            });

        expect(res.status).toBe(200);
        expect(res.body.systolic).toBe(130);
    });

    it('should delete a record', async () => {
        // First create one
        const createRes = await request(app)
            .post('/api/records')
            .set('Authorization', 'Bearer mock-token')
            .send({
                systolic: 120,
                diastolic: 80,
                pulse: 70
            });

        const id = createRes.body.id;

        const res = await request(app)
            .delete(`/api/records/${id}`)
            .set('Authorization', 'Bearer mock-token');

        expect(res.status).toBe(204);
    });
});
