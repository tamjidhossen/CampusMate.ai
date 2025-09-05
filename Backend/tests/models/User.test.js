const User = require('../../models/User');

describe('User Model Tests', () => {
  beforeEach(() => {
    // Clear any test data before each test
    jest.clearAllMocks();
  });

  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science',
        residence: '123 Campus Drive',
        bloodGroup: 'O+',
        role: 'student'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.department).toBe(userData.department);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.isVerified).toBe(false);
      expect(savedUser.isVolunteer).toBe(false);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    it('should fail to create user without required fields', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
        // Missing required fields
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail to create user with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science',
        residence: '123 Campus Drive',
        bloodGroup: 'O+'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail to create user with invalid blood group', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science',
        residence: '123 Campus Drive',
        bloodGroup: 'Invalid' // Invalid blood group
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should prevent duplicate email addresses', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science',
        residence: '123 Campus Drive',
        bloodGroup: 'O+'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User({ ...userData, name: 'Jane Doe' });
      
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    let user;

    beforeEach(async () => {
      user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science',
        residence: '123 Campus Drive',
        bloodGroup: 'O+'
      });
      await user.save();
    });

    it('should match correct password', async () => {
      const isMatch = await user.matchPassword('Password123');
      expect(isMatch).toBe(true);
    });

    it('should not match incorrect password', async () => {
      const isMatch = await user.matchPassword('wrongpassword');
      expect(isMatch).toBe(false);
    });

    it('should calculate success rate correctly', () => {
      user.volunteerStats.totalRequests = 10;
      user.volunteerStats.fulfilledRequests = 8;
      
      expect(user.successRate).toBe(80);
    });

    it('should return 0 success rate when no requests', () => {
      user.volunteerStats.totalRequests = 0;
      user.volunteerStats.fulfilledRequests = 0;
      
      expect(user.successRate).toBe(0);
    });

    it('should generate display name correctly', () => {
      expect(user.displayName).toBe('John Doe (Computer Science)');
    });
  });

  describe('User Validation', () => {
    it('should validate department enum', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Invalid Department',
        residence: '123 Campus Drive',
        bloodGroup: 'O+'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate role enum', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        phone: '+1-234-567-8900',
        department: 'Computer Science',
        residence: '123 Campus Drive',
        bloodGroup: 'O+',
        role: 'invalid_role'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate phone number format', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        phone: 'invalid-phone',
        department: 'Computer Science',
        residence: '123 Campus Drive',
        bloodGroup: 'O+'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });
  });
});
