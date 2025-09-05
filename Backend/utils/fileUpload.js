const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const profilePicturesDir = path.join(__dirname, '../uploads/profile-pictures');
const noticeAttachmentsDir = path.join(__dirname, '../uploads/notice-attachments');

if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir, { recursive: true });
}

if (!fs.existsSync(noticeAttachmentsDir)) {
  fs.mkdirSync(noticeAttachmentsDir, { recursive: true });
}

// Configure storage for profile pictures
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profilePicturesDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and user ID
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const userId = req.user ? req.user._id : 'unknown';
    const filename = `profile-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});

// Configure storage for notice attachments
const noticeAttachmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, noticeAttachmentsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and user ID
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const userId = req.user ? req.user._id : 'unknown';
    const filename = `notice-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});

// File filter for images only (profile pictures)
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for profile pictures'), false);
  }
};

// File filter for notice attachments (images, documents, PDFs)
const noticeFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain',
    'text/csv'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Allowed types: images, PDF, Word, Excel, PowerPoint, TXT, CSV'), false);
  }
};

// Configure multer for profile pictures
const profilePictureUpload = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: imageFileFilter
});

// Configure multer for notice attachments  
const noticeAttachmentUpload = multer({
  storage: noticeAttachmentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files
  },
  fileFilter: noticeFileFilter
});

// Middleware for single profile picture upload
const uploadProfilePicture = profilePictureUpload.single('profilePicture');

// Middleware for multiple notice attachment uploads
const uploadNoticeAttachments = noticeAttachmentUpload.array('attachments', 5);

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum allowed size is 10MB for notices and 5MB for profile pictures.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed for notices.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`
    });
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next();
};

// Helper function to delete files
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
};

// Helper function to delete multiple files
const deleteFiles = (filePaths) => {
  if (Array.isArray(filePaths)) {
    filePaths.forEach(filePath => deleteFile(filePath));
  }
};

// Helper function to get file path from URL
const getFilePathFromUrl = (url) => {
  if (!url || (!url.startsWith('/uploads/profile-pictures/') && !url.startsWith('/uploads/notice-attachments/'))) {
    return null;
  }
  return path.join(__dirname, '..', url);
};

module.exports = {
  uploadProfilePicture,
  uploadNoticeAttachments,
  handleUploadError,
  deleteFile,
  deleteFiles,
  getFilePathFromUrl
};
