const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const educationSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['10th', '12th / PUC', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Certification', 'Other'],
    required: true,
  },
  degree: { type: String, required: true },
  specialization: { type: String },
  institution: { type: String, required: true },
  university: { type: String },
  startYear: { type: Number },
  endYear: { type: Number },
  cgpa: { type: Number },
  percentage: { type: Number },
  description: { type: String },
}, { _id: true });

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Technical' },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate',
  },
  yearsOfExperience: { type: Number, default: 0 },
}, { _id: true });

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrg: { type: String, required: true },
  certificateId: { type: String },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date },
  certificateUrl: { type: String },
  description: { type: String },
}, { _id: true });

const previousEmploymentSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  department: { type: String },
  employmentType: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Intern', 'Contract', 'Temporary', 'Freelancer'],
    default: 'Full Time',
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  responsibilities: { type: String },
  reasonForLeaving: { type: String },
  experienceLetterUrl: { type: String },
}, { _id: true });

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { type: String, required: true },
  altPhone: { type: String },
  email: { type: String },
  address: { type: String },
}, { _id: true });

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['Resume', 'Degree Certificate', 'Experience Certificate', 'Offer Letter', 'Joining Letter', 'Relieving Letter', 'ID Proof', 'Other'],
    required: true,
  },
  uploadDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { _id: true });

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    // Login & RBAC
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'HR', 'Manager', 'Employee'],
      default: 'Employee',
      index: true,
    },

    // 1. Personal Information
    personal: {
      firstName: { type: String, required: true, trim: true },
      middleName: { type: String, trim: true },
      lastName: { type: String, required: true, trim: true },
      profilePhoto: { type: String },
      dob: { type: Date },
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Non-Binary', 'Other', 'Prefer not to say'],
      },
      bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      },
      maritalStatus: {
        type: String,
        enum: ['Single', 'Married', 'Divorced', 'Widowed'],
      },
      nationality: { type: String, default: 'Indian' },
    },

    // 2. Contact Information
    contact: {
      personalEmail: { type: String, trim: true, lowercase: true },
      officialEmail: { type: String, trim: true, lowercase: true },
      mobileNumber: { type: String, trim: true },
      altPhone: { type: String, trim: true },
      currentAddress: {
        address: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String, default: 'India' },
        pinCode: { type: String },
      },
      permanentAddress: {
        address: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String, default: 'India' },
        pinCode: { type: String },
      },
      isPermanentSameAsCurrent: { type: Boolean, default: false },
    },

    // 3. Employment Information
    employment: {
      department: { type: String, required: true, index: true },
      designation: { type: String, required: true, index: true },
      employmentType: {
        type: String,
        enum: ['Full Time', 'Part Time', 'Intern', 'Contract', 'Temporary', 'Freelancer'],
        default: 'Full Time',
      },
      joiningDate: { type: Date, required: true, default: Date.now },
      workLocation: { type: String, default: 'Bangalore' },
      reportingManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
      team: { type: String },
      status: {
        type: String,
        enum: ['Active', 'Probation', 'On Leave', 'Inactive', 'Resigned', 'Terminated', 'Retired', 'Draft'],
        default: 'Active',
        index: true,
      },
      probationEndDate: { type: Date },
      confirmationDate: { type: Date },
      employmentEndDate: { type: Date },
      salary: { type: Number },
    },

    // 4. Professional Information
    professional: {
      yearsOfExperience: { type: Number, default: 0 },
      professionalSummary: { type: String },
      areasOfExpertise: [{ type: String }],
      careerInterests: { type: String },
      languagesKnown: [{ type: String }],
      achievements: [{ type: String }],
      awards: [{ type: String }],
    },

    // 5. Nested Structured Collections
    education: [educationSchema],
    skills: [skillSchema],
    certifications: [certificationSchema],
    previousEmployment: [previousEmploymentSchema],
    emergencyContacts: [emergencyContactSchema],
    documents: [documentSchema],

    // Soft Deletion
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        // Provide top-level convenience getters for backward compatibility
        ret.id = ret._id;
        ret.firstName = ret.personal?.firstName || '';
        ret.lastName = ret.personal?.lastName || '';
        ret.department = ret.employment?.department || '';
        ret.position = ret.employment?.designation || '';
        ret.status = ret.employment?.status || 'Active';
        ret.hireDate = ret.employment?.joiningDate;
        ret.phone = ret.contact?.mobileNumber || '';
        ret.address = ret.contact?.currentAddress?.address || '';
        ret.salary = ret.employment?.salary;
        return ret;
      },
    },
  }
);

// Auto-hash password on save
employeeSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
employeeSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Return safe JSON without password
employeeSchema.methods.toSafeJSON = function () {
  const obj = this.toJSON();
  delete obj.password;
  return obj;
};

// Profile completeness calculation virtual
employeeSchema.virtual('profileCompleteness').get(function () {
  let score = 0;
  if (this.personal?.firstName && this.personal?.lastName) score += 15;
  if (this.personal?.dob && this.personal?.gender) score += 10;
  if (this.contact?.mobileNumber && (this.contact?.personalEmail || this.contact?.officialEmail)) score += 15;
  if (this.contact?.currentAddress?.city) score += 10;
  if (this.employment?.department && this.employment?.designation) score += 20;
  if (this.education?.length > 0) score += 10;
  if (this.skills?.length > 0) score += 10;
  if (this.emergencyContacts?.length > 0) score += 10;
  return Math.min(100, score);
});

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

module.exports = Employee;
