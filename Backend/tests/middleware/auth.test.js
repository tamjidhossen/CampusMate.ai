const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../../models/User');

describe('Authentication Middleware', () => {
  let verifiedUser;
  let unverifiedUser;
  let adminUser;
  let volunteerUser;
  let token;
  let unverifiedToken;
  let adminToken;
  let volunteerToken;

  beforeEach(async () => {
    // Create test users
    verifiedUser = await User.create({
      name: 'Verified User',
      email: 'verified@example.com',
      password: 'Password123',
      phone: '+1-234-567-8900',
      department: 'Computer Science and Engineering',
      residence: '123 Campus Drive',
      bloodGroup: 'O+',
      role: 'student',
        session: '2024-25',
      isVerified: true
    });

    unverifiedUser = await User.create({
      name: 'Unverified User',
      email: 'unverified@example.com',
      password: 'Password123',
      phone: '+1-234-567-8901',
      department: 'Computer Science and Engineering',
      residence: '123 Campus Drive',
      bloodGroup: 'A+',
      role: 'student',
        session: '2024-25',
      isVerified: false
    });

    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password123',
      phone: '+1-234-567-8902',
      department: 'Administration',
      residence: '123 Campus Drive',
      bloodGroup: 'B+',
      role: 'admin',
      isVerified: true
    });

    volunteerUser = await User.create({
      name: 'Volunteer User',
      email: 'volunteer@example.com',
      password: 'Password123',
      phone: '+1-234-567-8903',
      department: 'Medicine',
      residence: '123 Campus Drive',
      bloodGroup: 'AB+',
      role: 'student',
        session: '2024-25',
      isVolunteer: true,
      isVerified: true
    });

    // Generate tokens
    token = jwt.sign({ id: verifiedUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    unverifiedToken = jwt.sign({ id: unverifiedUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    volunteerToken = jwt.sign({ id: volunteerUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  });

  describe('protect middleware', () => {
    it('should allow access with valid token for verified user', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized');
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should deny access for unverified user', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${unverifiedToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Account not verified');
    });

    it('should deny access with expired token', async () => {
      const expiredToken = jwt.sign(
        { id: verifiedUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' } // Expired token
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should deny access for non-existent user', async () => {
      const nonExistentUserToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011' }, // Valid ObjectId but non-existent user
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${nonExistentUserToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No user found');
    });
  });

  describe('authorize middleware', () => {
    it('should allow admin access to admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny student access to admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authorized');
    });

    it('should deny volunteer access to admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${volunteerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authorized');
    });
  });

  describe('Token format validation', () => {
    it('should reject token without Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', token); // Without 'Bearer '

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject empty Bearer token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('User activity tracking', () => {
    it('should update lastActive timestamp on successful authentication', async () => {
      const initialLastActive = verifiedUser.lastActive;

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      const updatedUser = await User.findById(verifiedUser._id);
      expect(updatedUser.lastActive.getTime()).toBeGreaterThan(initialLastActive.getTime());
    });
  });
});
