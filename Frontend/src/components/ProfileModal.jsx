import React, { useState, useEffect } from "react";
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
import {
  DUMMY_PROFILE_DATA,
  DEPARTMENT_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  RESIDENCE_TYPE_OPTIONS,
  ROLE_OPTIONS,
  AVAILABILITY_OPTIONS,
} from "../constants/profileData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const ProfileModal = ({ isOpen, onClose }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState(DUMMY_PROFILE_DATA);
  const [tempData, setTempData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadProfileData();
    }
  }, [isOpen]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      // const data = await profileAPI.fetchProfile();
      // setProfileData(data);
    } catch (error) {
      console.error("Failed to load profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
    setTempData({ ...profileData });
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setTempData({});
    setValidationErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!tempData.fullName?.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!tempData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(tempData.email)) {
      errors.email = "Email is invalid";
    }

    if (!tempData.phoneNumber?.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10,}$/.test(tempData.phoneNumber.replace(/\D/g, ""))) {
      errors.phoneNumber = "Phone number must be at least 10 digits";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      // await profileAPI.updateProfile(tempData);
      setProfileData({ ...tempData });
      setIsEditMode(false);
      setTempData({});
      setValidationErrors({});
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange("profilePicture", e.target.result);
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
                              ? tempData.profilePicture
                              : profileData.profilePicture
                          ) ? (
                            <img
                              src={
                                isEditMode
                                  ? tempData.profilePicture
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
                        {isEditMode ? tempData.fullName : profileData.fullName}
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
                      key: "fullName",
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
                      key: "phoneNumber",
                      label: "Phone Number",
                      type: "tel",
                      icon: <Phone className="w-4 h-4" />,
                      colSpan: 1,
                    },
                    {
                      key: "dateOfBirth",
                      label: "Date of Birth",
                      type: "date",
                      icon: <Calendar className="w-4 h-4" />,
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
                      key: "studentId",
                      label: "Student ID",
                      type: "text",
                      icon: <GraduationCap className="w-4 h-4" />,
                      colSpan: 1,
                    },
                    {
                      key: "role",
                      label: "Role",
                      type: "select",
                      options: ROLE_OPTIONS,
                      colSpan: 1,
                    },
                    {
                      key: "department",
                      label: "Department",
                      type: "select",
                      options: DEPARTMENT_OPTIONS,
                      colSpan: 1,
                    },
                    {
                      key: "yearOfStudy",
                      label: "Year of Study",
                      type: "text",
                      icon: <Calendar className="w-4 h-4" />,
                      colSpan: 1,
                    },
                    {
                      key: "cgpa",
                      label: "CGPA",
                      type: "number",
                      step: "0.01",
                      icon: <GraduationCap className="w-4 h-4" />,
                      colSpan: 1,
                    },
                  ]}
                />

                {/* Residence Information */}
                <ProfileFormSection
                  title="Residence Information"
                  icon={<MapPin className="w-5 h-5" />}
                  isEditMode={isEditMode}
                  data={isEditMode ? tempData : profileData}
                  onInputChange={handleInputChange}
                  validationErrors={validationErrors}
                  fields={[
                    {
                      key: "residenceType",
                      label: "Residence Type",
                      type: "select",
                      options: RESIDENCE_TYPE_OPTIONS,
                      colSpan: 1,
                    },
                    {
                      key: "roomNumber",
                      label: "Room/House Number",
                      type: "text",
                      icon: <MapPin className="w-4 h-4" />,
                      colSpan: 1,
                    },
                    {
                      key: "address",
                      label: "Address",
                      type: "textarea",
                      icon: <MapPin className="w-4 h-4" />,
                      colSpan: 2,
                    },
                  ]}
                />

                {/* Medical Information */}
                <ProfileFormSection
                  title="Medical Information"
                  icon={<Heart className="w-5 h-5" />}
                  isEditMode={isEditMode}
                  data={isEditMode ? tempData : profileData}
                  onInputChange={handleInputChange}
                  validationErrors={validationErrors}
                  fields={[
                    {
                      key: "bloodGroup",
                      label: "Blood Group",
                      type: "select",
                      options: BLOOD_GROUP_OPTIONS,
                      colSpan: 1,
                    },
                    {
                      key: "emergencyContact",
                      label: "Emergency Contact",
                      type: "tel",
                      icon: <Phone className="w-4 h-4" />,
                      colSpan: 1,
                    },
                    {
                      key: "medicalConditions",
                      label: "Medical Conditions",
                      type: "textarea",
                      icon: <Heart className="w-4 h-4" />,
                      colSpan: 2,
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
                    {
                      key: "availability",
                      label: "Availability",
                      type: "select",
                      options: AVAILABILITY_OPTIONS,
                      conditional: "isVolunteer",
                      colSpan: 1,
                    }
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
          {fields.map((field) => {
            if (field.conditional && !data[field.conditional]) return null;

            return (
              <FormField
                key={field.key}
                field={field}
                value={data[field.key]}
                onChange={(value) => onInputChange(field.key, value)}
                isEditMode={isEditMode}
                error={validationErrors[field.key]}
              />
            );
          })}
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
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className="bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 shadow-lg hover:bg-gray-700/70">
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl">
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
            className="bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 shadow-lg hover:bg-gray-700/70 resize-none w-full"
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
              className={`bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 shadow-lg hover:bg-gray-700/70 w-full ${
                icon ? "pl-12" : ""
              } ${readOnly ? "cursor-not-allowed opacity-70" : ""}`}
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
