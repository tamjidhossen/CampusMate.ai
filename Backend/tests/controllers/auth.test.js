const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science and Engineering',
        residence: '123 Campus Drive',
        bloodGroup: 'O+',
        role: 'student',
        session: '2024-25',
        session: '2024-25'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Registration successful');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.isVerified).toBe(false);
    });

    it('should fail registration with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science and Engineering',
        residence: '123 Campus Drive',
        bloodGroup: 'O+'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail registration with weak password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123', // Too weak
        phone: '+1-234-567-8900',
        department: 'Computer Science and Engineering',
        residence: '123 Campus Drive',
        bloodGroup: 'O+'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should prevent duplicate email registration', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science and Engineering',
        residence: '123 Campus Drive',
        bloodGroup: 'O+'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, name: 'Jane Doe' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    let verifiedUser;
    let unverifiedUser;

    beforeEach(async () => {
      // Create verified user
      verifiedUser = await User.create({
        name: 'Verified User',
        email: 'verified@example.com',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science and Engineering',
        residence: '123 Campus Drive',
        bloodGroup: 'O+',
        isVerified: true
      });

      // Create unverified user
      unverifiedUser = await User.create({
        name: 'Unverified User',
        email: 'unverified@example.com',
        password: 'Password123',
        phone: '+1-234-567-8901',
        department: 'Computer Science and Engineering',
        residence: '123 Campus Drive',
        bloodGroup: 'A+',
        isVerified: false
      });
    });

    it('should login verified user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'verified@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe('verified@example.com');
    });

    it('should reject login for unverified user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not yet verified');
    });

    it('should fail login with wrong credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'verified@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/auth/me', () => {
    let user;
    let token;

    beforeEach(async () => {
      // Create verified user
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science and Engineering',
        residence: '123 Campus Drive',
        bloodGroup: 'O+',
        isVerified: true
      });

      // Get login token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      token = loginResponse.body.token;
    });

    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.name).toBe('Test User');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/update-profile', () => {
    let user;
    let token;

    beforeEach(async () => {
      // Create verified user
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science and Engineering',
        residence: '123 Campus Drive',
        bloodGroup: 'O+',
        isVerified: true
      });

      // Get login token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      token = loginResponse.body.token;
    });

    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '+1-999-888-7777',
        isVolunteer: true
      };

      const response = await request(app)
        .put('/api/auth/update-profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe('Updated Name');
      expect(response.body.user.phone).toBe('+1-999-888-7777');
      expect(response.body.user.isVolunteer).toBe(true);
    });

    it('should fail with invalid phone format', async () => {
      const response = await request(app)
        .put('/api/auth/update-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: 'invalid-phone' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/auth/update-profile')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/change-password', () => {
    let user;
    let token;

    beforeEach(async () => {
      // Create verified user
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science and Engineering',
        residence: '123 Campus Drive',
        bloodGroup: 'O+',
        isVerified: true
      });

      // Get login token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      token = loginResponse.body.token;
    });

    it('should change password successfully', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123',
          newPassword: 'NewPassword456'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password changed');
    });

    it('should fail with wrong current password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword456'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Current password is incorrect');
    });

    it('should fail with weak new password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123',
          newPassword: '123' // Too weak
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');
    });
  });
});
