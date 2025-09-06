import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Upload, X, FileText, Image, File, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { createNotice } from "../../services/notices";

const NOTICE_CATEGORIES = [
  'Academic', 'Admission', 'Examination', 'Result', 'Events', 
  'Workshop', 'Seminar', 'Conference', 'Cultural', 'Sports',
  'Emergency', 'Holiday', 'Transportation', 'Scholarship',
  'Job', 'Internship', 'Research', 'Administrative', 'General',
  'Health', 'Safety', 'Accommodation', 'Library', 'IT', 'Other'
];

const PRIORITY_LEVELS = ['Low', 'Normal', 'High', 'Urgent'];
const NOTICE_TYPES = ['Announcement', 'Circular', 'Notice', 'Alert', 'Reminder'];
const ROLES = ['student', 'teacher', 'admin', 'all'];

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Electrical and Electronic Engineering',
  'Environmental Science and Engineering',
  'Statistics',
  'Bangla Language and Literature',
  'English Language and Literature',
  'Music',
  'Theatre and Performance Studies',
  'Film and Media Studies',
  'Philosophy',
  'History',
  'Fine Arts',
  'Economics',
  'Political Science and Sociology',
  'Public Administration',
  'Development Studies',
  'Anthropology',
  'International Relations',
  'Peace and Conflict Studies',
  'Law',
  'Microbiology',
  'Public Health and Informatics',
  'Pharmacy',
  'Business Administration'
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AdminNoticeUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    priority: 'Normal',
    type: 'Notice',
    targeting: {
      roles: [],
      departments: [],
      bloodGroups: [],
      volunteersOnly: false
    },
    deliverySettings: {
      publishAt: '',
      expiresAt: ''
    }
  });

  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (field, value) => {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: prev[parent][child].includes(value)
          ? prev[parent][child].filter(item => item !== value)
          : [...prev[parent][child], value]
      }
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      // Validate file type and size
      const isValidType = file.type.startsWith('image/') || 
                         file.type === 'application/pdf' || 
                         file.type.startsWith('text/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type === 'application/pdf') return <File className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    // Validate targeting - at least one criteria must be specified
    const hasTargeting = formData.targeting.roles.length > 0 || 
                        formData.targeting.departments.length > 0 || 
                        formData.targeting.bloodGroups.length > 0 || 
                        formData.targeting.volunteersOnly;
    
    if (!hasTargeting) {
      newErrors.targeting = 'At least one targeting criteria must be specified';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const noticeData = {
        ...formData,
        attachments: attachments
      };

      await createNotice(noticeData);
      
      toast.success('Notice created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: '',
        priority: 'Normal',
        type: 'Notice',
        targeting: {
          roles: [],
          departments: [],
          bloodGroups: [],
          volunteersOnly: false
        },
        deliverySettings: {
          publishAt: '',
          expiresAt: ''
        }
      });
      setAttachments([]);
      setErrors({});
      
    } catch (error) {
      console.error('Error creating notice:', error);
      toast.error(error.message || 'Failed to create notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Create Notice</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter notice title"
                  maxLength={200}
                />
                {errors.title && <FormMessage>{errors.title}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTICE_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <FormMessage>{errors.category}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map(priority => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTICE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            </div>

            {/* Content */}
            <FormItem>
              <FormLabel>Content *</FormLabel>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter notice content"
                rows={6}
                maxLength={5000}
              />
              <div className="text-sm text-gray-400 text-right">
                {formData.content.length}/5000 characters
              </div>
              {errors.content && <FormMessage>{errors.content}</FormMessage>}
            </FormItem>

            {/* Targeting */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Targeting *</h3>
              {errors.targeting && <FormMessage>{errors.targeting}</FormMessage>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <div className="space-y-2">
                    {ROLES.map(role => (
                      <label key={role} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.targeting.roles.includes(role)}
                          onChange={() => handleArrayChange('targeting.roles', role)}
                          className="rounded border-gray-600 bg-gray-800 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-300 capitalize">{role}</span>
                      </label>
                    ))}
                  </div>
                </FormItem>

                <FormItem>
                  <FormLabel>Volunteers Only</FormLabel>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="targeting.volunteersOnly"
                      checked={formData.targeting.volunteersOnly}
                      onChange={handleInputChange}
                      className="rounded border-gray-600 bg-gray-800 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-300">Target volunteers only</span>
                  </label>
                </FormItem>
              </div>

              <FormItem>
                <FormLabel>Departments</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-700 rounded-md p-3 bg-gray-900/30">
                  {DEPARTMENTS.map(dept => (
                    <label key={dept} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.targeting.departments.includes(dept)}
                        onChange={() => handleArrayChange('targeting.departments', dept)}
                        className="rounded border-gray-600 bg-gray-800 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-xs text-gray-300">{dept}</span>
                    </label>
                  ))}
                </div>
              </FormItem>

              <FormItem>
                <FormLabel>Blood Groups</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_GROUPS.map(group => (
                    <label key={group} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.targeting.bloodGroups.includes(group)}
                        onChange={() => handleArrayChange('targeting.bloodGroups', group)}
                        className="rounded border-gray-600 bg-gray-800 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-300">{group}</span>
                    </label>
                  ))}
                </div>
              </FormItem>
            </div>

            {/* Delivery Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Delivery Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Publish At</FormLabel>
                  <Input
                    type="datetime-local"
                    name="deliverySettings.publishAt"
                    value={formData.deliverySettings.publishAt}
                    onChange={handleInputChange}
                  />
                </FormItem>

                <FormItem>
                  <FormLabel>Expires At</FormLabel>
                  <Input
                    type="datetime-local"
                    name="deliverySettings.expiresAt"
                    value={formData.deliverySettings.expiresAt}
                    onChange={handleInputChange}
                  />
                </FormItem>
              </div>
            </div>

            {/* File Attachments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Attachments</h3>
              
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300 mb-2">
                  Drag files here or{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-orange-500 hover:text-orange-400 underline"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  Supports images, PDFs, and text files (max 10MB each)
                </p>
              </div>

              {/* Attached Files */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-300">Attached Files ({attachments.length})</h4>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file)}
                          <div>
                            <p className="text-sm font-medium text-gray-200">{file.name}</p>
                            <p className="text-xs text-gray-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[150px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Notice
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNoticeUpload;
