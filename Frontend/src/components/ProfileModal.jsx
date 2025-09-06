import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import {
  User,
  Edit,
  Save,
  X,
  Camera,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  MapPin,
  Heart,
  Users,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import {
  DEPARTMENT_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  ROLE_OPTIONS,
} from "../constants/profileData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    residence: "",
    bloodGroup: "",
    role: "",
    session: "",
    isVolunteer: false,
    profilePicture: null,
  });
  const [tempData, setTempData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

  const loadProfileData = useCallback(() => {
    try {
      setIsLoading(true);

      // Construct profile picture URL using proxy path if exists
      const profilePictureUrl = user?.profilePicture
        ? user.profilePicture.startsWith("http")
          ? user.profilePicture
          : user.profilePicture // Use the path as-is, Vite will proxy it
        : null;

      // Load user data from auth context
      setProfileData({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        department: user?.department || "",
        residence: user?.residence || "",
        bloodGroup: user?.bloodGroup || "",
        role: user?.role || "",
        session: user?.session || "",
        isVolunteer: user?.isVolunteer || false,
        profilePicture: profilePictureUrl,
      });
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      loadProfileData();
    }
  }, [isOpen, user, loadProfileData]);

  const handleClose = () => {
    if (isEditMode) {
      setIsEditMode(false);
      setTempData({});
      setValidationErrors({});
    }
    onClose();
  };

  const handleEdit = () => {
    setIsEditMode(true);
    // Initialize tempData with default values to avoid undefined/null values
    setTempData({
      ...profileData,
      name: profileData.name || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
      department: profileData.department || "",
      residence: profileData.residence || "",
      bloodGroup: profileData.bloodGroup || "",
      session: profileData.session || "",
      role: profileData.role || "student",
    });
    setValidationErrors({});
    setBackendErrors({});
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setTempData({});
    setValidationErrors({});
    setBackendErrors({});
  };

  const validateForm = () => {
    const errors = {};

    // Name validation - required with length constraints
    if (!tempData.name?.trim()) {
      errors.name = "Name is required";
    } else if (tempData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (tempData.name.trim().length > 100) {
      errors.name = "Name cannot exceed 100 characters";
    }

    // Email validation - required and format
    if (!tempData.email?.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(tempData.email)
    ) {
      errors.email = "Please enter a valid email";
    }

    // Phone validation - if provided, must be valid format
    if (tempData.phone !== undefined && tempData.phone !== null) {
      const phoneValue = String(tempData.phone).trim();
      if (phoneValue && !/^\+?[\d\s-()]+$/.test(phoneValue)) {
        errors.phone = "Please provide a valid phone number";
      }
    }

    // Blood group validation - if provided, must be valid
    if (tempData.bloodGroup !== undefined && tempData.bloodGroup !== null) {
      const bloodGroupValue = String(tempData.bloodGroup).trim();
      if (bloodGroupValue && !BLOOD_GROUP_OPTIONS.includes(bloodGroupValue)) {
        errors.bloodGroup = "Please select a valid blood group";
      }
    }

    // Department validation - if provided, must be valid
    if (tempData.department !== undefined && tempData.department !== null) {
      const departmentValue = String(tempData.department).trim();
      if (departmentValue && !DEPARTMENT_OPTIONS.includes(departmentValue)) {
        errors.department = "Please select a valid department";
      }
    }

    // Role validation - if provided, must be valid
    if (tempData.role !== undefined && tempData.role !== null) {
      const roleValue = String(tempData.role).trim();
      if (roleValue && !ROLE_OPTIONS.includes(roleValue)) {
        errors.role = "Please select a valid role";
      }
    }

    // Residence validation - if provided, length constraint
    if (tempData.residence !== undefined && tempData.residence !== null) {
      const residenceValue = String(tempData.residence).trim();
      if (residenceValue && residenceValue.length > 200) {
        errors.residence = "Residence cannot exceed 200 characters";
      }
    }

    // Session validation for students - required if role is student
    if (tempData.role === "student" && !tempData.session?.trim()) {
      errors.session = "Session is required for students";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const result = await updateProfile(tempData);

      if (result.success) {
        // Update local state with the updated user data
        setProfileData({ ...profileData, ...tempData });
        setIsEditMode(false);
        setTempData({});
        setValidationErrors({});
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);

      // Handle backend validation errors
      if (error.statusCode === 400 && error.data?.errors) {
        // Map backend validation errors to frontend validation state
        const backendErrors = {};
        error.data.errors.forEach((err) => {
          backendErrors[err.field] = err.message;
        });
        setValidationErrors(backendErrors);
        toast.error("Please fix the validation errors and try again.");
      } else {
        toast.error(
          error.message || "Failed to update profile. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Convert special "not specified" value back to empty string
    const processedValue = value === "__not_specified__" ? "" : value;

    setTempData((prev) => ({ ...prev, [field]: processedValue }));

    // Clear validation error for this field when user starts typing/selecting
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }

    // Real-time validation for some critical fields
    const newErrors = {};

    if (field === "phone" && processedValue) {
      const phoneValue = String(processedValue).trim();
      if (phoneValue && !/^\+?[\d\s-()]+$/.test(phoneValue)) {
        newErrors.phone = "Please provide a valid phone number";
      }
    }

    if (field === "email" && processedValue) {
      const emailValue = String(processedValue).trim();
      if (
        emailValue &&
        !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(emailValue)
      ) {
        newErrors.email = "Please enter a valid email";
      }
    }

    if (field === "name" && processedValue) {
      const nameValue = String(processedValue).trim();
      if (nameValue && nameValue.length > 100) {
        newErrors.name = "Name cannot exceed 100 characters";
      } else if (nameValue && nameValue.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }
    }

    if (field === "residence" && processedValue) {
      const residenceValue = String(processedValue).trim();
      if (residenceValue && residenceValue.length > 200) {
        newErrors.residence = "Residence cannot exceed 200 characters";
      }
    }

    // Set real-time validation errors
    if (Object.keys(newErrors).length > 0) {
      setValidationErrors((prev) => ({ ...prev, ...newErrors }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Compress and resize image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 300x300)
        let { width, height } = img;
        const maxSize = 300;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (compressedBlob) => {
            if (compressedBlob) {
              // Create a proper File object from the compressed blob
              const compressedFile = new File(
                [compressedBlob],
                `profile_${Date.now()}.jpg`,
                { type: "image/jpeg" }
              );

              // Store the compressed file for upload
              handleInputChange("profilePicture", compressedFile);

              // Create preview URL for display
              const reader = new FileReader();
              reader.onload = (e) => {
                handleInputChange("profilePicturePreview", e.target.result);
              };
              reader.readAsDataURL(compressedFile);
            }
          },
          "image/jpeg",
          0.7
        ); // 70% quality
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
        onClick={handleClose}
      />

      <Motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-2 md:inset-8 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex items-center justify-center p-2 md:p-6">
          <div className="w-full max-w-5xl h-full max-h-[90vh] bg-gray-900/80 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Glass overlay for enhanced glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-gray-900/40 to-gray-950/60 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.02] to-white/[0.05] rounded-3xl"></div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 bg-gray-800/90 backdrop-blur-md hover:bg-gray-700/90 text-white p-3 rounded-full transition-all duration-300 border border-gray-600/50 hover:border-gray-500/70 shadow-lg hover:shadow-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 h-full overflow-y-auto p-6 md:p-8">
              {/* Header */}
              <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700/10 via-transparent to-gray-900/20 rounded-2xl"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 p-0.5 shadow-lg">
                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center backdrop-blur-sm">
                          {(
                            isEditMode
                              ? tempData.profilePicturePreview
                              : profileData.profilePicture
                          ) ? (
                            <img
                              src={
                                isEditMode
                                  ? tempData.profilePicturePreview
                                  : profileData.profilePicture
                              }
                              alt="Profile"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
                          )}
                        </div>
                      </div>
                      {isEditMode && (
                        <label className="absolute -bottom-1 -right-1 bg-orange-500 hover:bg-orange-600 p-2 rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl border border-orange-400/50">
                          <Camera className="w-4 h-4 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfilePictureChange}
                          />
                        </label>
                      )}
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                        {isEditMode ? tempData.name : profileData.name}
                      </h1>
                      <p className="text-blue-300 text-lg md:text-xl font-medium">
                        {isEditMode
                          ? tempData.department
                          : profileData.department}
                      </p>
                      <p className="text-gray-400 text-sm md:text-base mt-1">
                        {isEditMode ? tempData.email : profileData.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    {!isEditMode ? (
                      <Motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEdit}
                        className="flex items-center justify-center space-x-2 bg-orange-500/90 backdrop-blur-sm hover:bg-orange-600/90 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium border border-orange-400/50 shadow-lg hover:shadow-xl disabled:opacity-50"
                        disabled={isLoading}
                      >
                        <Edit className="w-5 h-5" />
                        <span>Edit Profile</span>
                      </Motion.button>
                    ) : (
                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                        <Motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSave}
                          className="flex items-center justify-center space-x-2 bg-green-500/90 backdrop-blur-sm hover:bg-green-600/90 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium border border-green-400/50 shadow-lg hover:shadow-xl disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <Save className="w-5 h-5" />
                          <span>{isLoading ? "Saving..." : "Save"}</span>
                        </Motion.button>
                        <Motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCancel}
                          className="flex items-center justify-center space-x-2 bg-gray-600/90 backdrop-blur-sm hover:bg-gray-700/90 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium border border-gray-500/50 shadow-lg hover:shadow-xl disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <X className="w-5 h-5" />
                          <span>Cancel</span>
                        </Motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Form Sections */}
              <div className="grid gap-8">
                {/* Basic Information */}
                <ProfileFormSection
                  title="Basic Information"
                  icon={<User className="w-5 h-5" />}
                  isEditMode={isEditMode}
                  data={isEditMode ? tempData : profileData}
                  onInputChange={handleInputChange}
                  validationErrors={validationErrors}
                  fields={[
                    {
                      key: "name",
                      label: "Full Name",
                      type: "text",
                      icon: <User className="w-4 h-4" />,
                      colSpan: 1,
                    },
                    {
                      key: "email",
                      label: "Email",
                      type: "email",
                      icon: <Mail className="w-4 h-4" />,
                      readOnly: true,
                      colSpan: 1,
                    },
                    {
                      key: "phone",
                      label: "Phone Number",
                      type: "tel",
                      icon: <Phone className="w-4 h-4" />,
                      colSpan: 1,
                    },
                    {
                      key: "role",
                      label: "Role",
                      type: "select",
                      options: ROLE_OPTIONS,
                      colSpan: 1,
                    },
                  ]}
                />

                {/* Academic Information */}
                <ProfileFormSection
                  title="Academic Information"
                  icon={<GraduationCap className="w-5 h-5" />}
                  isEditMode={isEditMode}
                  data={isEditMode ? tempData : profileData}
                  onInputChange={handleInputChange}
                  validationErrors={validationErrors}
                  fields={[
                    {
                      key: "department",
                      label: "Department",
                      type: "select",
                      options: DEPARTMENT_OPTIONS,
                      colSpan: 1,
                    },
                    {
                      key: "session",
                      label: "Session",
                      type: "text",
                      icon: <Calendar className="w-4 h-4" />,
                      colSpan: 1,
                    },
                  ]}
                />

                {/* Personal Information */}
                <ProfileFormSection
                  title="Personal Information"
                  icon={<MapPin className="w-5 h-5" />}
                  isEditMode={isEditMode}
                  data={isEditMode ? tempData : profileData}
                  onInputChange={handleInputChange}
                  validationErrors={validationErrors}
                  fields={[
                    {
                      key: "residence",
                      label: "Residence",
                      type: "text",
                      icon: <MapPin className="w-4 h-4" />,
                      colSpan: 1,
                    },
                    {
                      key: "bloodGroup",
                      label: "Blood Group",
                      type: "select",
                      options: BLOOD_GROUP_OPTIONS,
                      colSpan: 1,
                    },
                  ]}
                />

                {/* Volunteer Information */}
                <ProfileFormSection
                  title="Volunteer Information"
                  icon={<Users className="w-5 h-5" />}
                  isEditMode={isEditMode}
                  data={isEditMode ? tempData : profileData}
                  onInputChange={handleInputChange}
                  validationErrors={validationErrors}
                  fields={[
                    {
                      key: "isVolunteer",
                      label: "Available as Volunteer",
                      type: "checkbox",
                      colSpan: 2,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </Motion.div>
    </AnimatePresence>
  );
};

// ProfileFormSection Component for each section
const ProfileFormSection = ({
  title,
  icon,
  isEditMode,
  data,
  onInputChange,
  validationErrors,
  fields,
}) => {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 md:p-8 shadow-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-700/5 via-transparent to-gray-900/10 rounded-2xl"></div>
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-400/30">
            {icon}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields
            .filter((field) => !field.conditional || data[field.conditional])
            .map((field) => (
              <FormField
                key={field.key}
                field={field}
                value={data[field.key]}
                onChange={(value) => onInputChange(field.key, value)}
                isEditMode={isEditMode}
                error={validationErrors[field.key]}
              />
            ))}
        </div>
      </div>
    </Motion.div>
  );
};

// FormField Component for individual form fields
const FormField = ({ field, value, onChange, isEditMode, error }) => {
  const { label, type, icon, options, readOnly, step, colSpan } = field;

  const renderInput = () => {
    if (!isEditMode) {
      return (
        <div className="bg-gray-700/30 backdrop-blur-sm border border-gray-600/30 rounded-xl px-4 py-3 text-gray-300 min-h-[3rem] flex items-center">
          {type === "checkbox" ? (
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                value
                  ? "bg-green-500/20 text-green-300 border border-green-400/30"
                  : "bg-gray-600/20 text-gray-400 border border-gray-500/30"
              }`}
            >
              {value ? "Yes" : "No"}
            </span>
          ) : (
            <span>{value || "Not specified"}</span>
          )}
        </div>
      );
    }

    switch (type) {
      case "select":
        return (
          <Select value={value || "__not_specified__"} onValueChange={onChange}>
            <SelectTrigger
              className={`bg-gray-700/50 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-all duration-300 shadow-lg hover:bg-gray-700/70 ${
                error
                  ? "border-red-500/70 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
                  : "border-gray-600/50 focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/20"
              }`}
            >
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl">
              <SelectItem
                value="__not_specified__"
                className="text-gray-400 hover:bg-gray-700/50 focus:bg-gray-700/50 cursor-pointer"
              >
                Not specified
              </SelectItem>
              {options?.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="text-white hover:bg-gray-700/50 focus:bg-gray-700/50 cursor-pointer"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${label}`}
            rows={3}
            className={`bg-gray-700/50 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-all duration-300 shadow-lg hover:bg-gray-700/70 resize-none w-full ${
              error
                ? "border-red-500/70 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
                : "border-gray-600/50 focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/20"
            }`}
          />
        );

      case "checkbox":
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-700/50 backdrop-blur-sm checked:bg-orange-500 checked:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
            />
            <span className="text-white text-sm">Available</span>
          </label>
        );

      default:
        return (
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {icon}
              </div>
            )}
            <input
              type={type}
              step={step}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${label}`}
              readOnly={readOnly}
              className={`bg-gray-700/50 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-all duration-300 shadow-lg hover:bg-gray-700/70 w-full ${
                icon ? "pl-12" : ""
              } ${readOnly ? "cursor-not-allowed opacity-70" : ""} ${
                error
                  ? "border-red-500/70 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
                  : "border-gray-600/50 focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/20"
              }`}
            />
          </div>
        );
    }
  };

  return (
    <div
      className={`${
        field.type === "checkbox" || colSpan === 2 ? "md:col-span-2" : ""
      }`}
    >
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        {error && <span className="text-red-400 ml-2">*</span>}
      </label>
      {renderInput()}
      {error && (
        <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ProfileModal;
