const VolunteerRequest = require('../../models/VolunteerRequest');
const User = require('../../models/User');

describe('VolunteerRequest Model Tests', () => {
  let requester;

  beforeEach(async () => {
    // Create a test user for volunteer requests
    requester = new User({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123',
      phone: '+1-234-567-8901',
      department: 'Biology',
      residence: '456 Campus Drive',
      bloodGroup: 'A+',
      isVerified: true
    });
    await requester.save();
  });

  describe('VolunteerRequest Creation', () => {
    it('should create a valid volunteer request', async () => {
      const requestData = {
        title: 'Blood Donation Needed',
        description: 'Urgent blood donation needed for surgery',
        category: 'Blood Donation',
        urgency: 'High',
        requester: requester._id,
        location: 'City Hospital',
        contactInfo: {
          phone: '+1-234-567-8901',
          email: 'jane@example.com'
        },
        requirements: {
          bloodGroup: 'A+'
        }
      };

      const request = new VolunteerRequest(requestData);
      const savedRequest = await request.save();

      expect(savedRequest._id).toBeDefined();
      expect(savedRequest.title).toBe(requestData.title);
      expect(savedRequest.category).toBe(requestData.category);
      expect(savedRequest.status).toBe('Active');
      expect(savedRequest.urgency).toBe('High');
      expect(savedRequest.expiresAt).toBeDefined();
    });

    it('should fail to create request without required fields', async () => {
      const requestData = {
        title: 'Blood Donation Needed'
        // Missing required fields
      };

      const request = new VolunteerRequest(requestData);
      
      await expect(request.save()).rejects.toThrow();
    });

    it('should validate category enum', async () => {
      const requestData = {
        title: 'Help Needed',
        description: 'Some help needed',
        category: 'Invalid Category',
        requester: requester._id,
        location: 'Campus',
        contactInfo: {
          phone: '+1-234-567-8901',
          email: 'jane@example.com'
        }
      };

      const request = new VolunteerRequest(requestData);
      
      await expect(request.save()).rejects.toThrow();
    });

    it('should validate urgency enum', async () => {
      const requestData = {
        title: 'Help Needed',
        description: 'Some help needed',
        category: 'Other',
        urgency: 'Invalid Urgency',
        requester: requester._id,
        location: 'Campus',
        contactInfo: {
          phone: '+1-234-567-8901',
          email: 'jane@example.com'
        }
      };

      const request = new VolunteerRequest(requestData);
      
      await expect(request.save()).rejects.toThrow();
    });
  });

  describe('VolunteerRequest Methods', () => {
    let request;
    let volunteer;

    beforeEach(async () => {
      // Create a volunteer user
      volunteer = new User({
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: 'Password123',
        phone: '+1-234-567-8902',
        department: 'Medicine',
        residence: '789 Campus Drive',
        bloodGroup: 'A+',
        isVolunteer: true,
        isVerified: true
      });
      await volunteer.save();

      // Create a volunteer request
      request = new VolunteerRequest({
        title: 'Blood Donation Needed',
        description: 'Urgent blood donation needed',
        category: 'Blood Donation',
        requester: requester._id,
        location: 'Hospital',
        contactInfo: {
          phone: '+1-234-567-8901',
          email: 'jane@example.com'
        },
        requirements: {
          bloodGroup: 'A+'
        }
      });
      await request.save();
    });

    it('should add response from volunteer', async () => {
      await request.addResponse(volunteer._id, 'I can help with blood donation');
      
      expect(request.responses).toHaveLength(1);
      expect(request.responses[0].volunteer.toString()).toBe(volunteer._id.toString());
      expect(request.responses[0].message).toBe('I can help with blood donation');
      expect(request.responses[0].status).toBe('Pending');
    });

    it('should prevent duplicate responses from same volunteer', async () => {
      await request.addResponse(volunteer._id, 'First response');
      
      await expect(
        request.addResponse(volunteer._id, 'Second response')
      ).rejects.toThrow('You have already responded to this request');
    });

    it('should accept volunteer response', async () => {
      await request.addResponse(volunteer._id, 'I can help');
      await request.acceptVolunteer(volunteer._id);
      
      expect(request.status).toBe('In Progress');
      expect(request.acceptedVolunteer.toString()).toBe(volunteer._id.toString());
      expect(request.acceptedAt).toBeDefined();
      
      const acceptedResponse = request.responses.find(
        r => r.volunteer.toString() === volunteer._id.toString()
      );
      expect(acceptedResponse.status).toBe('Accepted');
    });

    it('should mark request as fulfilled', async () => {
      await request.addResponse(volunteer._id, 'I can help');
      await request.acceptVolunteer(volunteer._id);
      await request.markFulfilled(5, 'Great help, thank you!');
      
      expect(request.status).toBe('Fulfilled');
      expect(request.fulfilledAt).toBeDefined();
      expect(request.rating).toBe(5);
      expect(request.feedback).toBe('Great help, thank you!');
    });

    it('should calculate response count correctly', () => {
      request.responses = [
        { volunteer: volunteer._id, message: 'Response 1', status: 'Pending' },
        { volunteer: requester._id, message: 'Response 2', status: 'Pending' }
      ];
      
      expect(request.responseCount).toBe(2);
    });

    it('should check if request is expired', () => {
      // Set expiration date in the past
      request.expiresAt = new Date(Date.now() - 1000);
      request.status = 'Active';
      
      expect(request.isExpired()).toBe(true);
    });

    it('should not be expired if status is not Active', () => {
      request.expiresAt = new Date(Date.now() - 1000);
      request.status = 'Fulfilled';
      
      expect(request.isExpired()).toBe(false);
    });
  });

  describe('VolunteerRequest Virtuals', () => {
    it('should calculate time remaining correctly', () => {
      const request = new VolunteerRequest({
        title: 'Test Request',
        description: 'Test description',
        category: 'Other',
        requester: requester._id,
        location: 'Test location',
        contactInfo: {
          phone: '+1-234-567-8901',
          email: 'test@example.com'
        },
        status: 'Active',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });
      
      const timeRemaining = request.timeRemaining;
      expect(timeRemaining).toBeGreaterThan(0);
      expect(timeRemaining).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
    });

    it('should return null time remaining for non-active requests', () => {
      const request = new VolunteerRequest({
        title: 'Test Request',
        description: 'Test description',
        category: 'Other',
        requester: requester._id,
        location: 'Test location',
        contactInfo: {
          phone: '+1-234-567-8901',
          email: 'test@example.com'
        },
        status: 'Fulfilled',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      
      expect(request.timeRemaining).toBeNull();
    });
  });
});
