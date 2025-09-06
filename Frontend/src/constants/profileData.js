// Dummy profile data - replace with API calls later
export const DUMMY_PROFILE_DATA = {
  // Basic Information from User model
  name: "John Doe",
  email: "john.doe@jkkniu.edu.bd",
  phone: "+880123456789",
  department: "Computer Science and Engineering",
  residence: "Sheikh Hasina Hall, Room 201, JKKNIU Campus",
  bloodGroup: "B+",
  role: "student",
  session: "2019-20",
  isVolunteer: true,
  profilePicture: null,
};

// Department options from user model
export const DEPARTMENT_OPTIONS = [
  "Bangla Language and Literature",
  "English Language and Literature",
  "Music",
  "Theatre and Performance Studies",
  "Film and Media Studies",
  "Philosophy",
  "History",
  "Fine Arts",
  "Computer Science and Engineering",
  "Electrical and Electronic Engineering",
  "Environmental Science and Engineering",
  "Statistics",
  "Economics",
  "Public Administration and Governance Studies",
  "Folklore",
  "Anthropology",
  "Population Science",
  "Local Government and Urban Development",
  "Sociology",
  "Accounting and Information Systems",
  "Finance and Banking",
  "Human Resource Management",
  "Management",
  "Marketing",
  "Law and Justice",
  "Administration",
  "Other",
];

export const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];
export const ROLE_OPTIONS = ["student", "teacher", "admin", "staff"];

// API functions placeholder - replace with actual API calls
export const profileAPI = {
  // Get user profile data
  getProfile: async () => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(DUMMY_PROFILE_DATA), 500);
    });
  },

  // Update user profile data
  updateProfile: async (profileData) => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, data: profileData }), 1000);
    });
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(
        () => resolve({ success: true, url: URL.createObjectURL(file) }),
        1500
      );
    });
  },
};
