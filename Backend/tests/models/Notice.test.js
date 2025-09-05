const Notice = require('../../models/Notice');
const User = require('../../models/User');

describe('Notice Model Tests', () => {
  let author;
  let targetUser;

  beforeEach(async () => {
    // Create author user
    author = new User({
      name: 'Notice Author',
      email: 'author@example.com',
      password: 'Password123',
      phone: '+1-234-567-8900',
      department: 'Computer Science and Engineering',
      residence: '123 Campus Drive',
      bloodGroup: 'O+',
      role: 'teacher',
      isVerified: true
    });
    await author.save();

    // Create target user
    targetUser = new User({
      name: 'Target User',
      email: 'target@example.com',
      password: 'Password123',
      phone: '+1-234-567-8901',
      department: 'Computer Science and Engineering',
      residence: '456 Campus Drive',
      bloodGroup: 'A+',
      role: 'student',
      isVolunteer: true,
      isVerified: true
    });
    await targetUser.save();
  });

  describe('Notice Creation', () => {
    it('should create a valid notice', async () => {
      const noticeData = {
        title: 'Important Academic Notice',
        content: 'This is an important academic notice for all students.',
        summary: 'Academic notice summary',
        category: 'Academic',
        priority: 'High',
        type: 'Notice',
        author: author._id,
        targeting: {
          roles: ['student'],
          departments: ['Computer Science and Engineering']
        }
      };

      const notice = new Notice(noticeData);
      const savedNotice = await notice.save();

      expect(savedNotice._id).toBeDefined();
      expect(savedNotice.title).toBe(noticeData.title);
      expect(savedNotice.category).toBe(noticeData.category);
      expect(savedNotice.status).toBe('Draft');
      expect(savedNotice.approvalStatus).toBe('Pending');
      expect(savedNotice.deliverySettings.expiresAt).toBeDefined();
    });

    it('should fail to create notice without required fields', async () => {
      const noticeData = {
        title: 'Test Notice'
        // Missing required fields
      };

      const notice = new Notice(noticeData);
      
      await expect(notice.save()).rejects.toThrow();
    });

    it('should validate category enum', async () => {
      const noticeData = {
        title: 'Test Notice',
        content: 'Test content',
        category: 'Invalid Category',
        author: author._id
      };

      const notice = new Notice(noticeData);
      
      await expect(notice.save()).rejects.toThrow();
    });

    it('should validate priority enum', async () => {
      const noticeData = {
        title: 'Test Notice',
        content: 'Test content',
        category: 'Academic',
        priority: 'Invalid Priority',
        author: author._id
      };

      const notice = new Notice(noticeData);
      
      await expect(notice.save()).rejects.toThrow();
    });
  });

  describe('Notice Targeting', () => {
    let notice;

    beforeEach(async () => {
      notice = new Notice({
        title: 'Targeted Notice',
        content: 'This notice is targeted to specific users',
        category: 'Academic',
        author: author._id,
        status: 'Published',
        targeting: {
          roles: ['student'],
          departments: ['Computer Science and Engineering'],
          volunteersOnly: true
        }
      });
      await notice.save();
    });

    it('should correctly identify targeted users', () => {
      const isTargeted = notice.isTargetedToUser(targetUser);
      expect(isTargeted).toBe(true);
    });

    it('should exclude users not matching role criteria', async () => {
      const teacherUser = new User({
        name: 'Teacher User',
        email: 'teacher@example.com',
        password: 'Password123',
        phone: '+1-234-567-8902',
        department: 'Computer Science and Engineering',
        residence: '789 Campus Drive',
        bloodGroup: 'B+',
        role: 'teacher',
        isVerified: true
      });
      await teacherUser.save();

      const isTargeted = notice.isTargetedToUser(teacherUser);
      expect(isTargeted).toBe(false);
    });

    it('should exclude users not matching department criteria', async () => {
      const differentDeptUser = new User({
        name: 'Different Dept User',
        email: 'diff@example.com',
        password: 'Password123',
        phone: '+1-234-567-8903',
        department: 'Economics',
        residence: '789 Campus Drive',
        bloodGroup: 'B+',
        role: 'student',
        isVolunteer: true,
        isVerified: true
      });
      await differentDeptUser.save();

      const isTargeted = notice.isTargetedToUser(differentDeptUser);
      expect(isTargeted).toBe(false);
    });

    it('should exclude non-volunteers when volunteersOnly is true', async () => {
      const nonVolunteerUser = new User({
        name: 'Non Volunteer User',
        email: 'nonvol@example.com',
        password: 'Password123',
        phone: '+1-234-567-8904',
        department: 'Computer Science and Engineering',
        residence: '789 Campus Drive',
        bloodGroup: 'B+',
        role: 'student',
        isVolunteer: false,
        isVerified: true
      });
      await nonVolunteerUser.save();

      const isTargeted = notice.isTargetedToUser(nonVolunteerUser);
      expect(isTargeted).toBe(false);
    });

    it('should handle blood group targeting', async () => {
      notice.targeting.bloodGroups = ['A+', 'O+'];
      await notice.save();

      const isTargeted = notice.isTargetedToUser(targetUser);
      expect(isTargeted).toBe(true);

      const bNegativeUser = new User({
        name: 'B Negative User',
        email: 'bneg@example.com',
        password: 'Password123',
        phone: '+1-234-567-8905',
        department: 'Computer Science and Engineering',
        residence: '789 Campus Drive',
        bloodGroup: 'B-',
        role: 'student',
        isVolunteer: true,
        isVerified: true
      });
      await bNegativeUser.save();

      const isNotTargeted = notice.isTargetedToUser(bNegativeUser);
      expect(isNotTargeted).toBe(false);
    });

    it('should handle residence keyword targeting', async () => {
      notice.targeting.residenceKeywords = ['campus'];
      await notice.save();

      const isTargeted = notice.isTargetedToUser(targetUser);
      expect(isTargeted).toBe(true);

      const offCampusUser = new User({
        name: 'Off Campus User',
        email: 'offcampus@example.com',
        password: 'Password123',
        phone: '+1-234-567-8906',
        department: 'Computer Science and Engineering',
        residence: 'Downtown Apartment',
        bloodGroup: 'A+',
        role: 'student',
        isVolunteer: true,
        isVerified: true
      });
      await offCampusUser.save();

      const isNotTargeted = notice.isTargetedToUser(offCampusUser);
      expect(isNotTargeted).toBe(false);
    });

    it('should handle specific user targeting', async () => {
      notice.targeting.specificUsers = [targetUser._id];
      notice.targeting.roles = []; // Clear role targeting
      notice.targeting.departments = []; // Clear department targeting
      await notice.save();

      const isTargeted = notice.isTargetedToUser(targetUser);
      expect(isTargeted).toBe(true);

      // Other user should not be targeted
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        password: 'Password123',
        phone: '+1-234-567-8907',
        department: 'Economics',
        residence: '999 Campus Drive',
        bloodGroup: 'AB+',
        role: 'student',
        isVolunteer: false,
        isVerified: true
      });
      await otherUser.save();

      const isNotTargeted = notice.isTargetedToUser(otherUser);
      expect(isNotTargeted).toBe(false);
    });

    it('should exclude users in excludeUsers list', async () => {
      notice.targeting.excludeUsers = [targetUser._id];
      await notice.save();

      const isTargeted = notice.isTargetedToUser(targetUser);
      expect(isTargeted).toBe(false);
    });
  });

  describe('Notice Methods', () => {
    let notice;

    beforeEach(async () => {
      notice = new Notice({
        title: 'Test Notice',
        content: 'Test content',
        category: 'Academic',
        author: author._id,
        status: 'Published'
      });
      await notice.save();
    });

    it('should mark notice as read', async () => {
      await notice.markAsRead(targetUser._id);
      
      expect(notice.readBy).toHaveLength(1);
      expect(notice.readBy[0].user.toString()).toBe(targetUser._id.toString());
      expect(notice.analytics.readCount).toBe(1);
    });

    it('should increment read count for existing reader', async () => {
      await notice.markAsRead(targetUser._id);
      await notice.markAsRead(targetUser._id);
      
      expect(notice.readBy).toHaveLength(1);
      expect(notice.readBy[0].readCount).toBe(2);
    });

    it('should increment click count', async () => {
      await notice.incrementClickCount();
      
      expect(notice.analytics.clickCount).toBe(1);
    });
  });

  describe('Notice Virtuals', () => {
    it('should calculate read percentage correctly', () => {
      const notice = new Notice({
        title: 'Test Notice',
        content: 'Test content',
        category: 'Academic',
        author: author._id,
        analytics: {
          totalRecipientsCount: 100,
          readCount: 75
        }
      });
      
      expect(notice.readPercentage).toBe(75);
    });

    it('should return 0 read percentage when no recipients', () => {
      const notice = new Notice({
        title: 'Test Notice',
        content: 'Test content',
        category: 'Academic',
        author: author._id,
        analytics: {
          totalRecipientsCount: 0,
          readCount: 0
        }
      });
      
      expect(notice.readPercentage).toBe(0);
    });

    it('should calculate engagement rate correctly', () => {
      const notice = new Notice({
        title: 'Test Notice',
        content: 'Test content',
        category: 'Academic',
        author: author._id,
        analytics: {
          totalRecipientsCount: 100,
          readCount: 60,
          clickCount: 20
        }
      });
      
      expect(notice.engagementRate).toBe(80);
    });

    it('should check if notice is active', () => {
      const notice = new Notice({
        title: 'Test Notice',
        content: 'Test content',
        category: 'Academic',
        author: author._id,
        status: 'Published',
        deliverySettings: {
          publishAt: new Date(Date.now() - 1000), // 1 second ago
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        }
      });
      
      expect(notice.isActive).toBe(true);
    });

    it('should check if notice is expired', () => {
      const notice = new Notice({
        title: 'Test Notice',
        content: 'Test content',
        category: 'Academic',
        author: author._id,
        deliverySettings: {
          expiresAt: new Date(Date.now() - 1000) // 1 second ago
        }
      });
      
      expect(notice.isExpired).toBe(true);
    });
  });

  describe('Notice Static Methods', () => {
    beforeEach(async () => {
      // Create some test notices
      await Notice.create({
        title: 'Academic Notice',
        content: 'Academic content',
        category: 'Academic',
        priority: 'High',
        author: author._id,
        status: 'Published',
        targeting: {
          roles: ['student'],
          departments: ['Computer Science and Engineering']
        }
      });

      await Notice.create({
        title: 'General Notice',
        content: 'General content',
        category: 'General',
        priority: 'Normal',
        author: author._id,
        status: 'Published',
        targeting: {
          roles: ['all']
        }
      });

      await Notice.create({
        title: 'Draft Notice',
        content: 'Draft content',
        category: 'Academic',
        author: author._id,
        status: 'Draft'
      });
    });

    it('should find notices for specific user', async () => {
      const notices = await Notice.findForUser(targetUser);
      
      expect(notices.length).toBeGreaterThan(0);
      
      // Check that all returned notices are targeted to the user
      notices.forEach(notice => {
        expect(notice.isTargetedToUser(targetUser)).toBe(true);
      });
    });

    it('should filter notices by category', async () => {
      const notices = await Notice.findForUser(targetUser, { category: 'Academic' });
      
      notices.forEach(notice => {
        expect(notice.category).toBe('Academic');
      });
    });

    it('should filter notices by priority', async () => {
      const notices = await Notice.findForUser(targetUser, { priority: 'High' });
      
      notices.forEach(notice => {
        expect(notice.priority).toBe('High');
      });
    });
  });
});
